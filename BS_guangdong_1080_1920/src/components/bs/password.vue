<template>
  <div class="password">
    <div class="title_layout">
      <div class="title">请输入“加油广东会员”手机号后四位</div>
    </div>
    <div class='am_payPwd' :id="`ids_${id}`" v-if="refreshInput">
      <input type="password"
             maxlength="1"
             @input="changeInput"
             @click="changePwd"
             v-model="pwdList[i]"
             @keydown="oldPwdList = pwdList.length"
             @focus="onFocus($event)"
             class="shortInput"
             v-for="(v, i) in 4" :key="i">
    </div>
    <div class="right-oil-list-oil-num">
      <div v-for="(item,idx) in selectnum">
        <div class="list-item-oil-num list-item-oncheck"
             @click.stop="numchange(item.id)">
          <div class="list-item-text-oncheck">{{item.id}}</div>
        </div>
      </div>
    </div>
    <div class="right-oil-list-oil-num">
      <div class="list-item-oil-num2 list-item-oncheck"  @click.stop="numchange('0')">0</div>
      <div class="list-item-oil-num list-item-oncheck" @click.stop="numchange('-1')">删除</div>
    </div>
    <!-- 支付完成关闭提示框 -->
    <div v-if="closePrompt" class="dialog__wrapper">
      <div class="dialog">
        <div class="dialog-title">支付结果</div>
        <div class="printing-div">
          <img src="../../../static/images/gif.gif" alt=""/>
        </div>
        <div class="dialog-content">
          <p>支付成功，请将小票交于加油员！</p>
        </div>
        <div class="dialog-bottom">
          <div class="btn-box btn-box-diss" @click="goIndex">首页 ({{countText}}秒)</div>
          <div class="btn-box btn-box-sure"  @click="goInvoice()">开具电子发票</div>
        </div>
      </div>
    </div>

    <!-- 支付失败提示框 -->
    <div v-if="errorPrompt" class="dialog__wrapper">
      <div class="dialog">
        <div class="dialog-title">
          提示
        </div>
        <div class="printing-div">
          <img src="../../../static/images/gif.gif" alt=""/>
        </div>
        <div class="dialog-content">
          <p>{{errortips}}</p>
        </div>
        <div class="dialog-bottom">
          <div v-show="!payAgain" class="btn-box btn-box-diss" @click="dissbtn()">确定</div>
          <div v-show="payAgain" class="btn-box btn-box-diss" @click="getWeChatPayResult()">查询支付状态</div>
        </div>
      </div>
    </div>
    <back-view @goBack="goBack" @goHome="goHome"></back-view>
  </div>
</template>

<script>
  export default {
    name: "password",
    components: {},
    props: {
      id: String, // 当一个页面有多个密码输入框时，用id来区分
      default: '1'
    },
    mounted() {
      this.ipt = document.querySelectorAll(`#ids_${this.id} .shortInput`)
    },
    data() {
      return {
        orderitem: {},
        facedata: {},
        pwdList: [],
        oldPwdList: [],
        isDelete: false,
        closePrompt: false,
        errorPrompt: false,
        payAgain: false,
        errortips:'',
        errorNum:0,
        refreshInput: true,
        countText: 10,
        ipt: '',
        telno: '',
        selectnum: [
          {id: "1", text: "1"},
          {id: "2", text: "2"},
          {id: "3", text: "3"},
          {id: "4", text: "4"},
          {id: "5", text: "5"},
          {id: "6", text: "6"},
          {id: "7", text: "7"},
          {id: "8", text: "8"},
          {id: "9", text: "9"},
        ],
        selectnum2: [
          {id: "0", text: "0"},
          {id: "-1", text: ""},
        ],
      }
    },
    methods: {
      numchange(num) {
        if(num === '-1'){
          this.pwdList.pop()
        }else {
          if(this.pwdList.length >= 4){
          }else {
            this.pwdList.push(num)
          }
        }
        if (this.pwdList.length === 4){
          this.getValidWalletPwd();
          return
        }
        this.refreshInput = false;
        this.$nextTick(() => {
          this.refreshInput = true;
        })
      },
      goHome () {
        this.$router.go(-this.$store.state.pushedLength)
      },
      goBack() {
        this.$store.state.pushedLength --;
        this.$router.go(-1)
      },
      dissbtn () {
        if (this.errorNum === 3){
           this.goBack();
        }else {
          this.errorPrompt = false;
          this.errortips='';
        }
      },
      goIndex:function () {
        this.closePrompt = false;
        if (this.myClock) {
          window.clearInterval(this.myClock);
          this.myClock = null;
        }
        this.goHome();
      },
      goInvoice:function () {
        this.closePrompt = false;
        if (this.myClock) {
          window.clearInterval(this.myClock);
          this.myClock = null
        }
        this.$store.state.pushedLength ++;
        this.closePrompt = true;
        this.$router.push({
          path: 'invoice',
          query:{
            orderitem:this.orderitem
          }
        })
      },
      onFocus(ev){
        document.activeElement.blur();//禁止默认键盘
      },
      keyUp(ev) {
        let index = this.pwdList.length;
        if (!index) return;
        if (ev.keyCode === 8) {
          this.isDelete = true;
          if (this.oldPwdList === this.pwdList.length) {
            if (index === this.pwdList.length) {
              this.pwdList.pop()
            }
            index--
          } else {
            index > 0 && index--
          }
          this.ipt[index].focus()
        } else if (this.isDelete && index === this.pwdList.length && /^\d$/.test(ev.key)) {
          this.isDelete = false;
          this.pwdList.pop();
          this.pwdList.push(ev.key);
          this.ipt[this.pwdList.length] && this.ipt[this.pwdList.length].focus()
        }
        this.$emit('getPwd', this.pwdList.join(''))
      },
      changePwd() {
        let index = this.pwdList.length;
        index === 4 && index--;
        this.ipt[index].focus()
      },
      changeInput() {
        let index = this.pwdList.length;
        let val = this.pwdList[index - 1];
        if (!/[0-9]/.test(val)) {
          this.pwdList.pop();
          return
        }
        if (!val) {
          this.pwdList.pop();
          index--;
          if (index > 0) this.ipt[index - 1].focus()
        } else {
          if (index < 4) this.ipt[index].focus()
        }
      },
      //开始进行人脸支付
      getValidWalletPwd () {
        let url = 'http://'+ this.$store.state.stationData.centralIP+':'+ this.$store.state.stationData.centralPort+'/'+this.$store.state.stationData.centerUrl+'/api/Terminal/NoSecretWeChatCashier';
        let params1 = {
          RefueledID: '' + this.orderitem.ID,
          Amount:this.orderitem.Amount,
          AcctID:this.facedata.Data.UserId,

          Telephone:this.pwdList.toString().replace(/,/g,""),
          CheckCode:this.facedata.Data.CheckCode,
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr);
        let params2 = {
          Args:argsStr,
          StationCode: this.$store.state.stationData.code,
          DeviceCode:this.$store.state.commonargs.deviceId,
          Sign:sign
        };
        // let params = "Args=" + argsStr + '&StationCode=' +this.$store.state.stationData.code + "&DeviceCode=" + this.$store.state.commonargs.deviceId + "&Sign=" + sign
        let params=JSON.stringify(params2);
        this.$Loading.open();
        let jsonData = {};
        jsonData.type='gethttpdata';
        jsonData.url = url;
        jsonData.jsonstr=encodeURIComponent(params);
        let _this=this;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,(response) => {
          _this.$Loading.close();
            let data=JSON.parse(response);
            if (data.ResultCode === 1) {
              _this.getGetBasicInfo();
            } else {
              _this.numchange('-1');
              _this.numchange('-1');
              _this.numchange('-1');
              _this.numchange('-1');
              if (data.ResultCode === 3) {
                _this.errorNum++;
                if ( _this.errorNum===3){
                  _this.payAgain=false;
                  _this.errorPrompt = true;
                  _this.errortips = data.ErrMsg;
                }else {
                  _this.$Toast(data.RetMsg)
                }
              } else if (data.ResultCode === 100) {
                _this.errorPrompt = true;
                _this.errortips = data.ErrMsg;
                _this.payAgain=true;
              }
            }
        })
        // })
      },
      printerTest () {
        let jsonData = {};
        jsonData.type = 'printticket';
        let pdata = {
          "ID":this.orderitem.ID,
          "WorkDay":this.orderitem.WorkDay,
          "Shift":this.orderitem.Shift,
          "GunNo":this.orderitem.GunNo,
          "GasCode":this.orderitem.GasCode,
          "GasName":this.orderitem.GasName,
          "Qty":this.orderitem.Qty,
          "Price":this.orderitem.Price,
          "Amount": this.orderitem.Amount,
          "HasPayAmount": this.orderitem.HasPayAmount,
          "DisAmount": this.orderitem.DisAmount,
          "POSTTC":this.orderitem.POSTTC,
          "C_PSAMASN":this.orderitem.C_PSAMASN,
          "CardNo":this.orderitem.CardNo
        };
        pdata.StationName = this.$store.state.stationData.name;
        pdata.IsPrintInvoice = '0';
        pdata.QRCodeUrl =  'https://gdws.nsenz.com/app/download';
        jsonData.printcontent = pdata;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
          if (response) {
          }
        })
      },
      //获取油站基本信息接口
      getGetBasicInfo () {
        this.countText = 10;
        this.myClock = window.setInterval(() => {
          this.countText--;
          if (this.countText <= 0) {
            this.goIndex();
          }
        }, 1000);
        this.closePrompt=true;
        this.printerTest()
      },

      //查询订单
      getWeChatPayResult: function () {
        this.errorPrompt = false;
        this.errortips = '';
        this.payAgain=false;
        let url = 'http://' + this.$store.state.stationData.centralIP + ':' + this.$store.state.stationData.centralPort + '/' + this.$store.state.stationData.centerUrl + '/api/Terminal/GetWeChatPayResult';
        let params1 = {
          RefueledID: '' + this.orderitem.ID,
          Amount:this.orderitem.Amount,
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr);
        let params2 = {
          Args: argsStr,
          StationCode: this.$store.state.stationData.code,
          DeviceCode: this.$store.state.commonargs.deviceId,
          Sign: sign
        };
        // let params = "Args=" + argsStr + '&StationCode=' +this.$store.state.stationData.code + "&DeviceCode=" + this.$store.state.commonargs.deviceId + "&Sign=" + sign
        let params = JSON.stringify(params2);
        this.$Loading.open();
        let jsonData = {};
        jsonData.type = 'gethttpdata';
        jsonData.url = url;
        jsonData.jsonstr = encodeURIComponent(params);
        let _this=this;
        this.$Bridgefunc.callBridge('phonebridge', jsonData, (response) => {
          this.$Loading.close();
          let data = JSON.parse(response);
          if (data.ResultCode === 1) {
            _this.getGetBasicInfo();
          } else {
            _this.errorPrompt = true;
            _this.errortips = data.ErrMsg;
            _this.payAgain=true;
          }
        })
      },
    },
    created() {
      this.orderitem = JSON.parse(decodeURIComponent(this.$route.query.orderitem));
      this.facedata = JSON.parse(decodeURIComponent(this.$route.query.facedata));
      this.facedata = JSON.parse(decodeURIComponent(this.$route.query.facedata));
      this.telno = JSON.parse(decodeURIComponent(this.$route.query.telno));
    },
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .password {
    width 100%;
    height 100%
    position relative;
    overflow hidden;
    .title_layout {
      display flex;
      justify-content center;
      align-items center
      .title {
        font-size $font-size-large-x
        color black
        margin 10px 20px;
        margin-top 100px;
      }
      .num {
        font-size $font-size-small
        color $order-bg-color
        margin 10px 20px;
      }
    }
    .am_payPwd {
      width 100%;
      height: 100px;
      border-radius: 5px;
      padding: 10px 0;
      position: relative;
      margin-left: 1px;
      display flex;
      justify-content center;
      align-items center
      .shortInput {
        text-align: center;
        font-size: $font-size-large
        float: left;
        width: 100px;
        height: 60px;
        color: #333;
        outline: #ff0067;
        &:not(:last-child) {
          border-right: 1px solid #999;
        }
      }
    }
    .right-oil-list-oil-num {
      padding 0 280px;
      left 0px;
      width 100%
      top 100px;
      bottom 0px;
      overflow-y scroll;
      -webkit-overflow-scrolling touch;
      .list-item-oil-num {
        padding 10px;
        width 130px;
        height 80px;
        float left;
        border-radius 20px;
        margin 20px;
        font-size $font-size-large
        .item-bottom {
          display flex;
          margin-top 10px;
          .item-bottom-left {
            flex 1;
          }
        }
      }
      .list-item-oil-num2 {
        padding 10px;
        width 300px;
        height 80px;
        float left;
        border-radius 20px;
        margin 20px;
        font-size $font-size-large
        .item-bottom {
          display flex;
          margin-top 10px;
          .item-bottom-left {
            flex 1;
          }
        }
      }
      .list-item-oncheck {
        display: flex;
        justify-content: center;
        align-items: center;
        border 1px solid $bg-color;
        background-color $bg-color-setting-pressed;
        .list-item-text-oncheck {
          color $color-text-d;
        }
      }
      .list-item-oncheck:active {
        background-color $bg-color;
        .list-item-text-oncheck {
          color white;
        }
      }
    }
    .dialog__wrapper {
      position: fixed;
      top: 808px;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      background-color: rgba(0, 0, 0, 0.6);
      .dialog {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        padding-top: 120px;
        background-color white
        border-radius 15px;
        .dialog-title {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 60px;
          position: absolute;
          width: 100%;
          top: 5%;
          z-index: 10;
          font-size: $font-size-large;
        }
        .dialog-content {
          width 100%;
          height 120px;
          display: flex;
          padding 0 40px;
          justify-content: center;
          font-size: $font-size-medium;
          color $color-text-l;
        }
        .printing-div {
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            width 200px;
          }
        }
      }
      .dialog-bottom {
        display: flex;
        justify-content: space-around;
        padding-bottom: 40px;
        .btn-box {
          display: flex;
          position: relative;
          justify-content: center;
          align-items: center;
          width: 200px;
          height: 60px;
          font-size: 20px;
          background-color white;
          border-radius 15px;
          border 1px solid $bg-color;
          color $bg-color;
        }
        .btn-box-diss{
          background-color white;
          border 1px solid $bg-color;
          color $bg-color;
        }
        .btn-box-diss:active{
          background-color white;
          border 1px solid $bg-color-pressed;
          color $bg-color-pressed;
        }
        .btn-box-sure {
          background-color $bg-color;
          color white;
        }
        .btn-box-sure:active {
          background-color $bg-color-pressed;
          color white;
        }
      }
    }
  }
</style>
