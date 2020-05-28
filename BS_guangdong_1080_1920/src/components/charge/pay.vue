/**Created by steven on 2019/5/23.*/

<template>
  <div class="pay">
    <nav-top noTitle="true" @backEvent="$router.go(-1)"></nav-top>
    <nav-content class="bordert">
      <div class="top-amount">
        <p class="amount-title">支付</p>
        <p class="amount-desc">￥<span>{{moneyval}}</span></p>
      </div>
      <p class="tip">打开微信支付在下方扫码器扫码</p>
      <p class="tip-s">微信首页 > 右上角[+] > [收付款]</p>
      <div class="tip-img">
        <img src="../../assets/img_ScanTheQRCode.png" alt="">
      </div>
    </nav-content>
  </div>
</template>

<script>

export default {
  name: "pay",
  components: {
    moneyval:'',
    saleNO:'',
    cardData:{}
  },
  data () {
    return {
    }
  },
  methods: {
    scanEvent: function () {
      // let jsonData = {};
      // jsonData.type = 'scancode'
      // console.log("weixinsaoma----------start-------->>>>>");
      // this.$Bridgefunc.callBridge('phonebridge', jsonData,  (response)=> {
      //   console.log("weixinsaoma----------code-------->>>>>" + response);
      //   if (response) {
      //     this.ETCPayWeChat(response);
      //   }
      // });

      // 测试固定123
      this.ETCPayWeChat('123');

    },

    //微信支付
    ETCPayWeChat (QrCode) {
      let url='http://'+ this.$store.state.YTIP + ':' + this.$store.state.YTPort+'/pay/api/SelfServicePay/ETCPayWeChat'

      let info="{\"OrgCode\":\""+this.$store.state.stationData.code+"\",\"SaleNo\":\""+this.saleNO+"\",\"QrCode\":\""+QrCode+"\",\"Amount\":"+this.moneyval+"}"
      let sign = this.$sign.signArgs(info)
      var params = {
        "JsonData": info,
        "Sign": sign
      };

      this.$Loading.open();
      this.$http.post(url, params).then(res => {
        this.$Loading.close()
        let data=res.data;
        if (data.ErrorCode == 0) {  //微信支付成功
          let rs= JSON.parse(data.Data)
          this.UploadPayRecord(this.saleNO,rs.Amount);  //上传流水
        } else{  //其他错误提示
          this.$Toast(data.Message)
        }
      }, error => {
        this.$Loading.close();
      })
    },

    //上传流水
    UploadPayRecord (saleNO,Amount) {

      let url='http://'+ this.$store.state.YTIP + ':' + this.$store.state.YTPort+'/etc/api/SelfServiceETC/UploadPayRecord'
      var info = {
        "Saleno": saleNO,
        "OrgCode": this.$store.state.stationData.code
        //"UniversalCode": "33251219"
      };
      let sign = this.$sign.signArgs(JSON.stringify(info));
      var params = {
        "JsonData": JSON.stringify(info),
        "Sign": sign
      };

      this.$http.post(url, params).then(res => {
        this.$Loading.close()
        let data=res.data;
        if (data.ErrorCode == '0') {  //上传流水成功
          this.ETCCheckOut(saleNO,Amount)   //完成流水
        } else{  //其他错误提示
          this.$Toast(data.Message)
        }
      }, error => {
        this.$Loading.close()
      })
    },

    //完成流水(checkout)
    ETCCheckOut (saleNO,Amount) {

      let url='http://'+ this.$store.state.YTIP + ':' + this.$store.state.YTPort+'/etc/api/SelfServiceETC/ETCCheckOut'
      var info = {
        "Saleno": saleNO,
        "CardBalance": this.cardData.CardBalance,
        "OrgCode": this.$store.state.stationData.code,
      };
      let sign = this.$sign.signArgs(JSON.stringify(info))
      var params = {
        "JsonData": JSON.stringify(info),
        "Sign": sign
      };
      this.$Loading.open()
      this.$http.post(url, params).then(res => {
        this.$Loading.close()
        let data=res.data;
        if (data.ErrorCode == 0) {  //上传流水成功
          this.tranceNotice()
          charge.QuerySalBill(saleNO)  //查询销售明细
        } else{  //其他错误提示
          this.$Toast(data.Message)
        }
      }, error => {
        this.$Loading.open();
      })
    },

    //发起转账通知
    tranceNotice () {
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
        // this.getCardInfo();
      });
    },


  },
  created () {
    this.moneyval = this.$route.query.money;
    this.saleNO = this.$route.query.saleNO;
    this.cardData = JSON.parse(decodeURIComponent(this.$route.query.cardData));
    this.scanEvent();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';

  .pay {
    width 100%
    height 100%
    overflow hidden
    .bordert{
      border-top 1px solid $color-text-lll
    }
    .top-amount{
      margin 0px 210px
      background-color #59D25A
      border-radius 0px 0px 20px 20px
      overflow hidden
      .amount-title{
        margin-top 40px
        font-size $font-size-medium-x
        color white
        width 100%
        text-align center
      }
      .amount-desc{
        margin 40px 0px 50px 0px
        width 100%
        font-size $font-size-medium-x
        font-weight $font-weight-x
        color white
        text-align center
        span{
          font-size $font-size-large
          font-weight $font-weight-x

        }
      }
    }
    .tip{
      margin-top 150px
      font-size $font-size-medium-x
      font-weight $font-weight-x
      width 100%
      text-align center
    }
    .tip-s{
      margin-top 40px
      font-size $font-size-medium-s
      color  $color-text-l
      width 100%
      text-align center
    }
    .tip-img{
      margin-top  150px
      width 100%
      text-align center
      img{
        margin 0px auto
      }
    }
  }
</style>
