<template>
  <div class="payment">
    <common-header @goBack="goBack"><span class="title">选择支付方式</span></common-header>
    <div class="payment-wrapper">
      <div class="content">
        <p class="pay-activity"><img src="../../../static/images/pay_activity_img.png" alt=""></p>
        <p class="tip-img"><img src="../../../static/images/paymentsetphone/img_title1.png" alt=""></p>
        <p class="img-point"><img src="../../../static/images/paymentsetphone/img_point.gif" alt=""></p>
        <p class="phone-wrapper" @click="showKeyboard">
          <span class="line"></span>
          <span>{{telno}}</span>
        </p>
        <p class="tip-text">请输入您的手机号(提示：绑定微信的手机号)</p>
      </div>
      <div class="pay-style-wrapper">
        <p class="pay-style-wrap" :style="keyboardShow ? 'opacity:0' : 'opacity:1'">
          <img src="../../../static/images/paymentsetphone/img_title2.png" alt="">
        </p>
        <div class="dialog-style">
          <div class="pay-wechat"><img @click="selectWay(0)" src="../../../static/images/paymentsetphone/btn_wechatpay.png" alt=""></div>
          <div class="pay-zfb" ><img @click="selectWay(1)" src="../../../static/images/paymentsetphone/btn_alipay.png" alt=""></div>
        </div>
      </div>
    </div>
    <!-- 底部 -->
    <div class="footer">
      <Footer></Footer>
    </div>
    <div class="keyboard-cont" v-show="keyboardShow">
      <div @click="closeKey">
        <img src="../../../static/images/paymentsetphone/img_title3.png" alt="">
        <img src="../../../static/images/paymentsetphone/bg3.png" alt="">
      </div>
      <div class="keyboard" >
        <span v-for="(item,index) in keyboardKeyList" :key="index" @click="keyboardClick(item,index)">{{item}}</span>
      </div>
    </div>
    <div class="keyboard-wrapper" @click="closeKey" v-if="keyboardShow"></div>
    <div class="yy" @click="openKey" v-if="keyboardShow"></div>
  </div>
</template>

<script>
  import md5 from 'js-md5';

  export default {
    name: "paymentsetphone",
    components: {
      CommonHeader: require('./common/CommonHeader').default,
      Footer: require('./common/Footer.vue').default,
    },
    data() {
      return {
        checkitem: {},  // 接收订单数据
        telno: '',      // 填写的手机号
        goodsId: '',    // 要支付的加油记录的流水号
        workDay: '',    // 加油时间
        acctID: '',     // 手机注册用户id
        openID: '',     // 微信openID
        paystyle: '',   // 订单支付方式
        gasName: '',    // 油品名称
        keyboardKeyList: [1, 2, 3, 4, 5, 6, 7, 8, 9, '清空', 0,'X'], // 键盘数字按钮
        password: [], // 输入值数组
        Span:-1,
        keyboardShow: false,   // 显示手机输入键盘
      }
    },
    methods: {
      // 返回上一页
      goBack () {
        this.LockAndUnLockOrder (0, this.checkitem);
        this.$router.go(-1)
      },
      // 判断手机填写输入是否正确
      isPhoneNum () {
        let reg = /^1[0-9]{10}$/;
        // 因为有国际号所以判断前面带加号
        if(this.telno !== '') {
          if (!reg.test(this.telno)) {
            this.$Toast('请输入有效的手机号码');
            return false
          }else {
            return true
          }
        }else {
          this.$router.push({
            name: '订单支付',
            params: {
              payDetail: this.checkitem,
              paystyle: this.paystyle,
              telNumber: this.telno,
              gasName: this.gasName
            }
          })
        }
      },
      // 发起手机号绑定会员
      getToRegister () {
        this.$Loading.open('提交中');
        let url = `${this.$store.state.faceSearch}/UserRegisterAuto?jsonData=${JSON.stringify({"Telephone": this.telno,"regChannel": 5})}`;
        let params1 = {
          "Telephone": this.telno,
          "regChannel": 5
        };
        let argsStr = JSON.stringify(params1);
        let timestamp = this.$util.dateFtt("yyyyMMddhhmmss", new Date());
        let signval = "jsonData=" + argsStr + '&timestamp=' + timestamp + '&secretKey=xi8(I4Y=aFVXSsgX';
        let signMd5 = md5(signval);
        let params = {
          'jsonData': argsStr
        };
        this.$http.post(
          url, params,
          {
            timeout: 200000,
            headers: {
              'timestamp': timestamp,
              'sign': signMd5
            }
          }) .then(res => {
            let rs = res.data.Data;
          this.$Loading.close();
          if (!res.data.RetCode) {
            this.$router.push({
              name: '订单支付',
              params: {
                payDetail: this.checkitem,
                paystyle: this.paystyle,
                telNumber: this.telno,
                gasName: this.gasName,
                acctID: rs.AcctID
              }
            })
          } else {
            this.$Toast(res.data.RetMsg)
          }
        }, error => {
          this.$Loading.close();
          this.$Toast("编号：001绑会员，请求数据失败!请您检查设备是否已连接网络!")
          this.writeLog (url)
        })
      },
      // 解锁
      LockAndUnLockOrder (lockState,item) {  // lockState: 1锁定  0解锁
        let url = 'http://'+ this.$store.state.stationData.centralIP+':'+ this.$store.state.stationData.centralPort+'/'+this.$store.state.stationData.centerUrl+'/api/Terminal/LockAndUnLockOrder';
        let params1 = {
          RefueledID: '' + item.ID,
          LockState: lockState,
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        this.$Loading.open();
        let params = {
          "Args": argsStr,
          "StationCode": this.$store.state.stationData.code,
          "DeviceCode": this.$store.state.commonargs.deviceId,
          "Sign": sign
        };
        this.$http.post(url, params).then(res => {
          this.$Loading.close();
        }, error => {
          this.$Loading.close();
          this.writeLog (url)
        })
      },
      // 选择支付方式
      selectWay (type) { // type 0微信，1支付宝
        this.paystyle = type
        if(this.isPhoneNum()){
          // 发起手机号绑定会员
          this.getToRegister();
        }
      },
      // 显示手机键盘
      showKeyboard () {
        if (!this.keyboardShow) {
          this.keyboardShow = true;
          this.password = [];
          this.telno = '';
        }
      },
      keyboardClick (item,index) {
        if (item === '清空') {
          this.telno = '';
          this.password = [];
          return
        }
        if (item === 'X') {
          this.delHandle();
          return
        }
        let text = item;
        let len = this.password.length;
        this.password.push(text);
        this.telno = this.password.join('').replace(/\s/g, '');
        this.Span = len;
        if (this.password.length === 11) {
          this.keyboardShow = false;
          if(!(/^1[34578]\d{9}$/.test(this.telno))) {
            this.$Toast("手机号码输入格式有误")
          }
        }
      },
      // 清除
      delHandle () {
        if (this.password.length <= 1) {
          this.password = [];
          this.telno = '' ;
          return false
        }
        this.password.pop(); // 删除最后一项
        this.telno = this.password.join(' ').replace(/\s/g, '');
        this.Span--;
      },
      // 关闭手机输入键盘
      closeKey () {
        this.keyboardShow = false;
      },
      // 开启手机输入键盘
      openKey () {
        this.keyboardShow = false;
      },
      // 日志
      writeLog (msg) {
        let url = `http://${this.$store.state.stationData.IP2}:21862/pay/api/SelfServiceSystem/WriteLog`;
        let params1 = {
          "OrgCode": this.stationCode,
          "Message ": `网络不通或其他异常请求的接口地址 url:  msg`,
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params)
          .then(res => {
          }, error => {
          })
      }
    },
    created() {
      this.checkitem = JSON.parse(decodeURIComponent(this.$route.params.orderitem));
      this.gasName = decodeURIComponent(this.$route.params.gasName);
      this.goodsId = this.checkitem.ID;
      this.workDay = this.checkitem.WorkDay
    },
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/common.styl'
 .payment {
   text-align center
   .header-wrapper {
     border-bottom 1px solid #EAEAEA
   }
   .payment-wrapper {
     background: url("../../../static/images/paymentsetphone/bg1.png") no-repeat;
     -webkit-background-size: cover
     background-size: cover
     padding-top: 22%;
     padding-bottom 32%
     .content {
       padding-bottom 100px
       padding-top 115px
       text-align center
       color: #f3fff3
       position relative
       .pay-activity {
         width: 650px
         position absolute;
         top: -185px;
         left 50%;
         margin-left -325px
       }
       .img-point {
         position absolute
         left: -5px;
         top: 265px;
       }
       .phone-wrapper {
         background-color: #FFCF23
         border-radius 16px
         font-size: 39px
         width: 650px
         height: 120px
         line-height: 120px
         margin 0 auto 28px
         position relative
         span {
           display inline-block
           font-size: 56px
         }
         .line {
           border-left 2px solid #ffffff
           position absolute
           top: 30px;
           left: 105px;
           height: 70px;
         }
       }
       .tip-text {
         color: #31AC38
         font-size: 36px
       }
     }
     .pay-style-wrapper {
       .pay-style-wrap {
         text-align: center;
         .pay-style {
           font-size: 50px;
           color: #4c4948;
           vertical-align: -8px;
         }
       }
       .dialog-style{
         width: 100%
         display: flex
         margin-bottom 120px
         div{
           flex 1
           cursor pointer
         }
         .pay-wechat {
           margin-right: 40px;
           text-align: right;
         }
         .pay-zfb {
           text-align left
         }
       }
     }
   }
    .keyboard-cont{
      width 100%
      height auto
      position absolute
      bottom 0px
      left 0
      z-index 2000
      img{
        width auto
        height auto
        margin-bottom -5px
      }
     .keyboard {
       background-color: #ffffff;
       padding-left 20px
       /* padding-top 25px  */
       /*img {*/
        /* position absolute */
        /*top: -60px; */
        /*right: 0px; */
       /*}*/
       span {
         display inline-block
         width: 328px
         height: 150px
         line-height: 170px
         border-radius 16px
         background-color: #F0F2EF
         margin-right 20px
         margin-bottom 20px
         font-size: 48px
       }
       span:active {
         background-color: #E1F2ED
       }
     }
    }
   .keyboard-wrapper {
     position fixed
     top: 0
     left: 0
     height: 100%
     width: 100%
     background-color: rgba(0,0,0,0);
   }
   .yy {
     position: absolute;
     top: 644px
     left: 215px
     background-color: rgba(0,0,0,0)
     /*background-color: blue*/
     width: 650px
     height: 120px
   }
 }

</style>
