/**Created by steven on 2019/5/23.*/

<template>
  <div class="index">
    <nav-top @backEvent="$router.go(-1)"></nav-top>
    <nav-content>
      <toptitle title="粤通卡充值不开具发票"></toptitle>
      <div class="desc-content">
        <div class="cell">
          <p class="left">粤通卡号</p>
          <p class="right">{{cardBasicInfo.CardNo}}</p>
        </div>

        <div class="cell">
          <p class="left">余额(元)</p>
          <p class="right">{{cardBasicInfo.CardBalance}}</p>
        </div>
        <div class="cell">
          <p class="left">最低充值金额(元)</p>
          <p class="right">{{cardData.AmtLowerLimit}}</p>
        </div>
        <div class="cell">
          <p class="left">单次最高充值金额(元)</p>
          <p class="right">{{cardData.SysMaxAmount}}</p>
        </div>
        <div class="cell">
          <p class="left">最高充值金额(元)</p>
          <p class="right">{{cardData.AmtUpperLimit}}</p>
        </div>
        <div class="cell">
          <p class="left-deep">充值金额</p>
          <p class="right-deep">{{amountArr[amountIndex]}}.00</p>
        </div>
      </div>
      <div class="amount-div">
        <div class="cell" v-for="(item,index) in amountArr"
             @click="amountIndex=index"
             :class="{'cell-mrgt':index>2,'cell-mrgl':index%3!=0,'cell-selected':index==amountIndex}">
          {{item}}元
        </div>
      </div>
      <p class="chargeIm" :class="{'chargeIm-disable': cardData.Code != '00'}" @click="chargeimmediately">立即充值</p>
      <p class="reread" @click="getCardInfo(true)">重新读卡</p>
    </nav-content>
  </div>
</template>

<script>
  import toptitle from '../commonui/common-div/toptitle'
  import moment from 'moment'
  import charge from './js/charge'

  export default {
    name: "index",
    components: {
      toptitle,
    },
    data() {
      return {
        amountArr: ['200', '500', '1000', '2000', '5000', '10000'],
        amountIndex: 0,
        cardBasicInfo: {},
        cardData: {},

      }
    },
    methods: {
      chargeimmediately: function () {
        if (this.cardData.Code != '00') {
          return;
        }
        let money = this.amountArr[this.amountIndex];
        if (money < this.cardData.AmtLowerLimit) {
          this.$Toast('充值金额不能小于' + this.cardData.AmtLowerLimit);
          return;
        }
        if (money > this.cardData.AmtUpperLimit) {
          this.$Toast('充值金额不能大于' + this.cardData.AmtUpperLimit);
          return;
        }
        this.ETCSysSuspend();
      },
      //生成挂单
      ETCSysSuspend(money) {
        let url = 'http://' + this.$store.state.YTIP + ':' + this.$store.state.YTPort + '/etc/api/SelfServiceETC/ETCSysSuspend'
        var info = {
          "CardNo": this.cardData.CardNo,
          "Cash": money,
          "Saleno": '',
          "OrgCode": this.$store.state.stationData.code
        };
        let sign = this.$sign.signArgs(JSON.stringify(info));
        var params = {
          "JsonData": JSON.stringify(info),
          "Sign": sign
        };
        this.$Loading.open();

        this.$http.post(url, params).then(res => {
          this.$Loading.close();
          let data = res.data;
          if (data.ErrorCode == '0') {  //挂单成功
            this.$router.push({
              path: 'chargepay',
              query: {
                saleNO: data.Data,
                money: money,
                cardData: encodeURIComponent(JSON.stringify(this.cardData))
              }
            })
          } else {  //其他错误提示
            this.$Toast(data.Message)
          }
        }, error => {
          this.$Loading.close();
        })
      },
      async getCardInfo(isAgainOpenCard) {
        let toast = this.$Toast({
          iconSrc: require('../../assets/loading.gif'),
          message: '读卡中, 请勿将卡移开读卡器',
          noAutoHide: true
        });

        this.cardData = {};
        if (isAgainOpenCard) {
          this.cardBasicInfo = {};
          let openData = await this.$Bridgefunc.openCard();
          console.log('初始化读卡' + JSON.stringify(openData));
          if (openData.code != 9000) {
            toast.close();
            this.$Toast(openData.msg)
            return;
          }
        }
        let data = await this.$Bridgefunc.readCard();
        toast.close();
        if (data.code == 9000) {
          this.cardBasicInfo = data.data;
          console.log('读卡信息' + JSON.stringify(this.cardBasicInfo));
          this.validCard('');  //读卡成功验卡
        } else {
          this.$Toast(data.msg);
        }
      },
      //验卡
      async validCard(commandText) {

        let url = 'http://' + this.$store.state.YTIP + ':' + this.$store.state.YTPort + '/etc/api/SelfServiceETC/ValidateCard';
        var info = {
          "CardNo": this.cardBasicInfo.CardNo,
          "CardNetNo": this.cardBasicInfo.CardNetNo,
          "CardBalance": this.cardBasicInfo.CardBalance,
          "MF0015": this.cardBasicInfo.MF0015,
          "CardValidityStart": this.cardBasicInfo.CardValidityStart,
          "CardValidityEnd": this.cardBasicInfo.CardValidityEnd,
          "instructionSet": commandText,
          "UniversalCode": this.$store.state.stationData.code,
          "OrgCode": this.$store.state.stationData.code
        };
        console.log('验卡参数' + JSON.stringify(info))
        let sign = this.$sign.signArgs(JSON.stringify(info));
        var params = {
          "JsonData": JSON.stringify(info),
          "Sign": sign
        };
        this.$Loading.open();
        this.$http.post(url, params).then(res => {
          this.$Loading.close();
          let rss = res.data
          console.log('验卡返回' + JSON.stringify(rss))
          if (rss.ErrorCode == 0) {
            let data = JSON.parse(rss.Data);
            this.setCardData(data);

            if (data.Code == '00') {  //读卡成功
              this.$Toast('读卡成功')
            } else if (data.Code == '1000') {  //未充值成功
              this.$Toast(data.Msg);
              this.tranceNotice();
            } else if (data.Code == '1001') { //未打印交易流水小票(先打印，再执行1000)
              charge.QuerySalBill(data.Saleno)  //查询销售明细
              this.$Toast(data.Msg)
            } else if (data.Code == '-1000') {
              this.$Toast(data.Msg)
            } else if (data.Code == '41') {  //未绑卡
              this.bondCard()  //绑卡
            } else if (data.Code == '51') { //写卡
              this.errorWithWriteCard(data.CommandText);
            } else if (data.Code == '61' || data.Code == '81' || data.Code == '73' || data.Code == '83') {
              this.GetInitCommand()   //获取初始化指令
            } else {  //其他错误提示
              this.$Toast(data.Msg)
            }
          } else {
            this.$Toast(rss.Message)
          }

        }, error => {
          this.$Loading.close();
        })
      },

      //发起转账通知
      tranceNotice() {
        charge.tranceNotice(()=>{
          this.GetInitCommand();
        })
      },

      //获取初始化指令
      GetInitCommand() {
        charge.GetInitCommand(
          (newCommandText)=>{
            this.initCommandWithWriteCard(newCommandText);
          },
          ()=>{
            this.RechReversal();
          }
        )
      },
      //初始化指令
      initCommandWithWriteCard(CommandText){
        charge.initCommandWithWriteCard(CommandText,(newCommandText)=>{
          this.GetCircleSaveCommand(newCommandText);
        });
      },
      //验卡返回51
      async errorWithWriteCard(CommandText) {
        let res = await this.$Bridgefunc.writeCard(CommandText, true);
        if (res.Data.Code == '1') {
          let commandText = res.Data.CommandResult;
          this.validCard(commandText)  //重新验卡
        } else {
          this.$Toast(res.Message)
        }
      },

      //获取圈存指令
      GetCircleSaveCommand(commandText) {

        charge.GetCircleSaveCommand(CommandText,
          (newCommandText)=>{
            this.getCommandsWithWriteCard(newCommandText);
          },
          //冲正
          ()=>{
            this.RechReversal();   //冲正
          }
        );

      },
      //获取圈存指令成功写卡
      getCommandsWithWriteCard(commandText) {
        charge.getCommandsWithWriteCard(commandText,(newCommandText)=>{
          this.CircleSaveReadCard(newCommandText)  //圈存确认前，重新读卡
        });
      },
      //圈存确认前重新读卡
      CircleSaveReadCard(commandText) {
        charge.CircleSaveReadCard(commandText,(cardInfo)=>{
          this.cardBasicInfo = cardInfo;   //alert('重新读卡code:'+data.ErrorCode)
        })
      },
      //圈存确认
      CircleSaveAffirm(commandText, cardBalance) {
        charge.CircleSaveAffirm(commandText,cardBalance);
      },
      //冲正
      RechReversal() {

        charge.RechReversal(()=>{
          this.getCardInfo();
        });

      },

      //绑卡
      async bondCard() {
        let url = 'http://' + this.$store.state.YTIP + ':' + this.$store.state.YTPort + '/etc/api/SelfServiceETC/RegisterCard'
        var info = {
          "CardNo": this.cardData.CardNo,
          "CardNetNo": this.cardData.CardNetNo,
          "CardBalance": this.cardData.CardBalance,
          "MF0015": this.cardData.MF0015,
          "CardValidityStart": this.cardData.CardValidityStart,
          "CardValidityEnd": this.cardData.CardValidityEnd,
          "instructionSet": '',
          "UniversalCode": this.$store.state.stationData.code,
          "OrgCode": this.$store.state.stationData.code
          //"OrgCode": "33251219"
        };
        let sign = this.$sign.signArgs(JSON.stringify(info));
        var params = {
          "JsonData": JSON.stringify(info),
          "Sign": sign
        };

        this.$Loading.open();
        this.$http.post(url, params).then(res => {

          this.$Loading.close();
          let data = JSON.parse(res.data.Data);
          this.cardData = params;
          console.log('绑卡code:' + data.Code)
          if (data.Code == '00') {  //绑卡成功后验卡
            this.reBondCard()
          } else {  //其他错误提示
            this.$Toast(data.Msg)
          }
        }, error => {
          this.$Loading.close();
        })
      },

      //绑卡成功后验卡
      async reBondCard() {
        let _this = this;

        let url = 'http://' + this.$store.state.YTIP + ':' + this.$store.state.YTPort + '/api/SelfServiceETC/RegisterLaterValidateCard'
        var info = {
          "CardNo": this.cardData.CardNo,
          "CardNetNo": this.cardData.CardNetNo,
          "CardBalance": this.cardData.CardBalance,
          "MF0015": this.cardData.MF0015,
          "CardValidityStart": this.cardData.CardValidityStart,
          "CardValidityEnd": this.cardData.CardValidityEnd,
          "instructionSet": '',
          "UniversalCode": this.$store.state.stationData.code,
          "OrgCode": this.$store.state.stationData.code
        };
        let sign = this.$sign.signArgs(JSON.stringify(info));
        var params = {
          "JsonData": JSON.stringify(info),
          "Sign": sign
        };

        this.$http.post(url, params).then(res => {

          this.$Loading.close();
          let data = JSON.parse(res.data.Data);
          this.cardData = params;
          console.log('绑卡成功后验卡code:' + data.Code)
          if (data.Code == '00') {
            this.getCardInfo();  //重新读卡
            this.setCardData(data);
          } else {  //其他错误提示
            this.$Toast(data.Msg)
          }
        }, error => {
          this.$Loading.close();
        })
      },

      setCardData:function (data) {
        this.cardData = data;
        charge.cardData = data;
      }

    },
    created() {
    },
    mounted() {
      this.getCardInfo(true);
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';

  .index {
    width 100%
    height 100%
    overflow hidden
    .desc-content {
      margin 60px 92px 0px 92px
      .cell {
        display flex
        justify-content space-between
        align-items center
        font-size $font-size-medium

        & + .cell {
          margin-top 48px
        }
        .left {
          color $color-text-l
        }
        .right {
          color $color-text-normal
        }

        .left-deep {
          color $color-text
          font-weight $font-weight-x
          font-size $font-size-medium-x
        }
        .right-deep {
          color $bg-color
          font-weight $font-weight-x
          font-size $font-size-medium-x
        }
      }
    }
    .amount-div {
      margin 110px 92px 0px 92px
      width calc(100% - 92px - 92px);
      .cell {
        width 282px
        height 120px
        line-height 120px
        color $color-text-l
        font-size $font-size-medium-x
        border 2px solid $color-text
        border-radius 10px
        text-align center
        display inline-block
      }
      .cell-selected {
        background-color $bg-color
        color white
        border 2px solid $bg-color

      }
      .cell-mrgt {
        margin-top 30px
      }
      .cell-mrgl {
        margin-left 24px
      }

    }
    .chargeIm {
      margin 96px 220px 0px 220px
      background-color $bg-color
      color white
      font-size $font-size-medium-x
      text-align center
      padding 36px 0px
      border-radius 10px
    }
    .chargeIm-disable {
      background-color $color-text-lll
      color $color-text-l
    }
    .reread {
      margin 60px 220px 0px 220px
      background-color white
      color $bg-color
      border 2px solid $bg-color
      font-size $font-size-medium-x
      text-align center
      padding 36px 0px
      border-radius 10px
    }

  }
</style>
