<template>
  <div class="payorder">
    <div class="wrap">
      <common-header @goBack="goBack"></common-header>
    </div>
    <div class="count-wrapper">
      <p class="count-title"><span v-if="telNumber">手机号：{{telNumber}}，</span><span>{{payDetail.GasName}}</span></p>
      <p class="count-detail"><span>¥</span>{{amount.toFixed(2)}}</p>
    </div>
    <!-- 微信支付 -->
    <p class="pay-tips" v-if="paystyle0">打开微信支付在下方扫码器扫码</p>
    <p class="pay-handle-tips" v-if="paystyle0">微信首页 > 右上角 [ + ] > [ 收付款 ]</p>
    <p class="scan-pay" v-if="paystyle0"><img src="../../../static/images/paymentsetphone/wechat.gif" alt=""></p>
    <!-- 支付宝支付 -->
    <p class="pay-tips" v-if="!paystyle0">打开支付宝支付在下方扫码器扫码</p>
    <p class="pay-handle-tips" v-if="!paystyle0">支付宝首页 > [ 付钱 ]</p>
    <p class="scan-pay" v-if="!paystyle0"><img src="../../../static/images/paymentsetphone/alipay.gif" alt=""></p>
    <div class="activity">
      <!--<img src="../../../static/images/paymentsetphone/activity.jpg" alt="">-->
      <div class="carousel-box" v-if="!showPayorderImg">
        <el-carousel indicator-position="outside">
          <el-carousel-item v-for="(item,index) of payorderImg" :key="index">
            <img :src="item.AdImageUrl" alt="">
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
    <!-- 支付loading提示框 -->
    <div class="in-charging-wrapper">
      <el-dialog
        :modal="false"
        :visible.sync="inChargingTips"
        style="padding-top: 400px;overflow: hidden"
        center
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
      >
        <p><img src="static/images/payorder/loading.gif" alt=""></p>
        <div v-show="payingState">
          <span v-show="paying">支付中，请耐心等待！</span>
          <span v-show="!paying">支付成功</span>
        </div>
        <div v-show="!payingState">
          <span>正在查询中，请耐心等待！</span>
        </div>
      </el-dialog>
    </div>
    <!--摄像头入口--> <!-- 1是支付，0查询 -->
    <p class="barCode" style="border: 1px solid skyblue" v-if="this.$store.state.isTest">
      <label>
        <input id='inputId' style="background-color:yellow;position: absolute;top: 0;height: 50px;" v-model="scanValue" @keyup.enter="checkPaymentResult(1, scanValue)" autocomplete="off" />
      </label>
    </p>
    <!-- 支付状态提示框 -->
    <div class="el-dialog-wrapper">
      <el-dialog
        title="支付结果"
        :visible.sync="payResultTips"
        style="margin-top: 400px;overflow: hidden"
        center
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
        @closed="backToPay"
      >
        <i class="fail"></i>
        <span>{{payStateMsg}}</span>
        <div class="self-btn">
          <span class="scan-again" v-show="!showBtn" @click="backToPay">重新支付</span>
          <span class="check-pay" v-show="!showBtn" v-preventReClick @click.prevent="checkPaymentResult(0, 0, $event)">查询支付结果</span>
          <span class="scan-again" v-show="showBtn" @click="backToPay">取消</span>
          <span class="check-pay" v-show="showBtn" @click="backToPay">重新支付</span>
        </div>
      </el-dialog>
    </div>
    <!-- 查询结果 -->
    <div class="el-dialog-wrapper">
      <el-dialog
        title="查询结果"
        :visible.sync="checkPayResult"
        style="margin-top: 400px;overflow: hidden"
        center
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
        :show-close="showClose"
      >
        <span>{{checkResultMsg}}</span>
        <div class="self-btn">
          <span class="check-pay" style="margin-right: 50px" @click="checkPayResultM" v-if="checkBtnShow">重新支付</span>
          <span class="scan-again"  style="margin-right: 0" v-if="checkBtnShow" v-preventReClick @click.prevent="checkPaymentResult(0, 0, $event)">继续查询</span>
          <span class="scan-again" v-if="!checkBtnShow" @click="backHome">回首页</span>
          <span class="check-pay" v-if="!checkBtnShow" v-preventReClick @click.prevent="goEvaluate($event)">去评价{{count}}</span>
        </div>
      </el-dialog>
    </div>
    <!-- 返回按钮 -->
    <back-view @goBack="goBack" @goHome="backHome"></back-view>
    <Footer></Footer>
    <button @click="faceCollect(1)">人脸开启</button>
    <button @click="faceCollect(2, 1)">人脸上传</button>
    <button @click="faceCollect(0)">人脸关闭</button>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Dialog, Carousel  } from 'element-ui';
  import CommonHeader from './common/CommonHeader'
  import Footer from './common/Footer'

  Vue.use(Dialog, Carousel);

  export default {
    name: "payorder",
    components: {
      CommonHeader,
      Footer
    },
    data () {
      return {
        payDetail: {},              // 商品详情
        amount: '',                 // 商品应收金额
        goodsId: '',                // 商品订单号
        resultObj: {},              // 商品支付详情
        inChargingTips: false,      // 支付loading提示框
        payingState: true,          // 支付loading 内容包装盒
        paying: true,               // 支付loading 内容
        payResultTips: false,       // 支付状态提示框
        payStateMsg: '',            // 支付状态内容
        showBtn: true,              // 支付状态对应按钮
        checkPayResult: false,      // 查询结果对话框
        checkResultMsg: '',         // 查询结果内容
        acctID: '',                 // 手机注册用户id
        modelState: false,          // 阻止点击模态框遮罩或esc关闭
        openID: '',                 // 微信openID
        scanValue: '',              // 扫码值
        selectval: [],              // 控制开具发票选中状态
        refueledID: '',             // 要查询支付结果的加油记录的流水号
        checkBtnShow: true,         // 控制查询结果按钮显示
        showClose: true,            // 控制查询结果关闭按钮显示
        count: '',                  // 去评价页倒计时
        timer: null,
        lastTime: null,             // 最后一次点击的时间
        currentTime: null,          // 当前点击的时间
        response: '',               // 扫码值
        paystyle: '',               // 支付方式状态值
        paystyle0: true,            // 微信扫码页面
        payWay: '',                 // 支付方式区分
        payWayStyle: '',            // 支付方式区分
        telNumber: '',              // 手机号
        showPayorderImg: true,      //
        payorderImg: []
      }
    },
    methods: {
      // 回首页
      backHome() {
        this.scanEvent(0);
        this.LockAndUnLockOrder (0, this.payDetail);
        this.$router.push({
          name: '首页'
        })
      },
      // 返回上一页
      goBack () {
        this.scanEvent(0);
        this.$router.go(-2)
        this.LockAndUnLockOrder (0, this.payDetail)
      },
      // 去评价页
      goEvaluate (event) {
        this.scanEvent(0);
        if (event.target.disabled) {
          return
        }
        this.$router.push({
          name: '订单评价',
          params: {
            resultObj: this.resultObj,
            payDetail: this.payDetail,
            acctID: this.acctID
          }
        })
      },
      // 倒计时5s 后回到首页
      countDown () {
        const TIME_COUNT = 5;
        this.lastTime = this.currentTime;
        this.count = TIME_COUNT;
        this.show = false;
        this.timer = setInterval(() => {
          if (this.count > 0 && this.count <= TIME_COUNT) {
            this.count--;
            if (this.count === 0) {
              this.scanEvent(0);
              this.$router.push({
                name: '订单评价',
                params: {
                  resultObj: this.resultObj,
                  payDetail: this.payDetail,
                  acctID: this.acctID
                }
              })
            }
          } else {
            this.show = true;
            clearInterval(this.timer);
            this.timer = null;
          }
        }, 1000)
      },
      // 控制查询结果提示框显示
      checkPayResultM () {
        this.checkPayResult = false;
        this.scanEvent(1)
      },
      // 返回重新支付
      backToPay () {
        this.payResultTips = false;
        this.scanEvent(1)
      },
      // 去支付
      goPay (response) {
        this.scanEvent(0);
        this.inChargingTips = true;  // 开启支付loading提示框
        this.payingState = true; // 支付loading 内容包装盒
        let url = `http://${this.$store.state.stationData.centralIP}:${this.$store.state.stationData.centralPort}/${this.$store.state.stationData.centerUrl}/api/Terminal/WeChatCashier`;
        let params1 = {
          RefueledID: '' + this.goodsId,  // 要支付的加油记录的流水号
          Amount: this.amount, // 要支付的金额
          QrCode: response, // 微信付款二维码
          AcctID: this.acctID || null, // 参加营销方案的会员号(可为空)
          CheckMode: this.payWayStyle, // 支付方式(7微信、16支付宝)
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "Args": argsStr,
          "DeviceCode": this.$store.state.commonargs.deviceId, // 自助终端设备号
          "StationCode": this.$store.state.stationData.code,  // 油站编码
          "Sign": sign
        };
        this.$http.post(
          url,
          params,
          {
            timeout: 200000,
          }
        ).then(res => {
          var isPayByThisCode;
          if (res.data.ResultCode === 1) {
            this.inChargingTips = false;
            this.resultObj = res.data.ResultObj;
            this.refueledID = JSON.parse(this.resultObj).RefueledID;
            isPayByThisCode  = JSON.parse(this.resultObj).IsPayByThisCode;
            this.paying = false; // 支付loading 内容: 支付成功
            this.faceCollect(2, 1)
            if (isPayByThisCode === '1') {
              this.printerTest()
            }
            this.$router.push({
              name: '订单评价',
              params: {
                resultObj: this.resultObj,
                payDetail: this.payDetail,
                acctID: this.acctID
              }
            })
          } else {
            if(res.data.ResultCode == 0) {
              this.payStateMsg = res.data.ErrMsg;
              this.inChargingTips = false; // 关闭支付loading提示框
              this.payResultTips = true // 支付状态提示框
              this.faceCollect(0, 0)
            } else if (res.data.ResultCode == 2) {
              this.inChargingTips = false;
              this.payStateMsg = '支付失败，若扣款成功，请点击下方按钮，重新查询支付结果！';
              this.payResultTips = true;
              this.showBtn = false  // 支付状态对应按钮
              this.faceCollect(2, 1)
            }
            this.inChargingTips = false
          }
        }, error => {
          this.inChargingTips = false;  // 关闭支付loading提示框
          this.scanEvent(1);
          this.$Loading.close();
          this.$Toast("编号：5，请求数据失败! 请您检查设备是否已连接网络！")
          this.writeLog (url)
          this.faceCollect(0, 0)
        })
      },
      // 查询支付结果
      checkPaymentResult (type, response, event) {
        this.scanEvent(0);  // 关闭扫码
        if (!type) { // type 为 0
          this.inChargingTips = true;
          this.payingState = false;
          this.payResultTips = false;
          if (event.target.disabled) {
            this.inChargingTips = false;
            // 点击太频繁了
            return
          }
        }
        let url = `http://${this.$store.state.stationData.centralIP}:${this.$store.state.stationData.centralPort}/${this.$store.state.stationData.centerUrl}/api/Terminal/GetWeChatPayResult`;
        let params1 = {
          RefueledID: '' + this.goodsId,  // 要查询支付结果的加油记录的流水号
          Amount: this.amount // 支付的金额
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "Args": argsStr,
          "DeviceCode": this.$store.state.commonargs.deviceId, // 自助终端设备号
          "StationCode": this.$store.state.stationData.code,  // 油站编码
          "Sign": sign
        };
        this.$http.post(
          url,
          params,
          {
            timeout: 200000,
          }
        ).then(res => {
          this.inChargingTips = false;
          this.payResultTips = false;
          this.checkPayResult = true;
          if(res.data.ResultCode == 1) {
            if (!type) {
              this.checkBtnShow = false;
              this.showClose= false;
              this.resultObj = res.data.ResultObj;
              this.checkResultMsg = '支付成功，请将小票交予加油员！';
              this.faceCollect(2, 1)
              this.countDown ()
            }
          } else {
            if (response === '') {
              this.checkPayResult = false;
              this.$Toast('扫码内容不能为空或未能识别到您的二维码！');
              this.scanEvent(1)
            } else {
              if (type) {
                this.checkPayResult = false;
                this.faceCollect(1)
                this.goPay (response)
              } else {
                this.inChargingTips = false;
                this.checkResultMsg = '未查到支付成功记录，若扣款成功，请到前台获取小票！'
                this.faceCollect(2, 1)
              }
            }
          }
        }, error => {
          this.inChargingTips = false;  // 关闭查询loading提示框
          this.scanEvent(1);
          this.$Loading.close();
          this.$Toast("编号：6，请求数据失败! 请您检查设备是否已连接网络！")
          this.writeLog (url)
        })
      },
      // 打印小票
      printerTest () {
        let jsonData = {};
        jsonData.type = 'printticket';
        let pdata = {
          "ID": this.payDetail.ID,
          "WorkDay": this.payDetail.WorkDay,
          "Shift": this.payDetail.Shift,
          "GunNo": this.payDetail.GunNo,
          "GasCode": this.payDetail.GasCode,
          "GasName": this.payDetail.GasName,
          "Qty": this.payDetail.Qty,
          "Price": this.payDetail.Price,
          "Amount": this.payDetail.Amount,
          "HasPayAmount": JSON.parse(this.resultObj).HasPayAmount,
          "DisAmount": JSON.parse(this.resultObj).DisAmount,
          "POSTTC": this.payDetail.POSTTC,
          "C_PSAMASN": this.payDetail.C_PSAMASN,
          "CardNo": this.payDetail.CardNo,
          "PayWay": this.payWay
        };
        pdata.StationName = this.$store.state.stationData.name;
        pdata.IsPrintInvoice = '0';
        pdata.QRCodeUrl = 'https://gdws.nsenz.com/app/download';
        jsonData.printcontent = pdata;
        this.$Bridgefunc.callBridge(
          'phonebridge',
          jsonData,
          function (response) {
            if (response) {
            } else {
            }
          })
      },
      // 解锁/锁定 目的是防止其他设备下同一个订单
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
      // 原生方法获取焦点扫码
      scanEvent (type) {
        let jsonData = {};
        if (type) { // 其他是开启
          jsonData.type = 'scancode'  // 开启摄像头
        } else {  // 0是关闭
          jsonData.type = 'closescan'  // 关闭摄像头
        }
        let _this = this;
        console.log('扫描二维码')

        // callBridge 使用js调用原生能力（扫码）
        this.$Bridgefunc.callBridge('phonebridge', jsonData, function (response) {
          if (response) {
            console.log('扫描二维码回调')
            _this.response = response;
            _this.checkPaymentResult(1, response);
          }
        });
      },
      /*
      * 人脸采集
      * @param {number} status -参数status是指打开或关闭人脸识别原生能力
      * @param {number} isUpload -参数isUpload是指告知客户端是否上传采集的图像 1：上传 0：不上传
      * */
      faceCollect (status, isUpload) {
        let jsonData = {},
            _this = this,
            facecodeObj = {
              'StoreId': _this.payDetail.GasCode,
              // 'ID': _this.payDetail.ID,
              // 'WorkDay': _this.payDetail.WorkDay,
              // 'PayWay': _this.payWay,
              // 'Tel': _this.telNumber
            }

        console.log(`传进facecollect的参数${status}, ${isUpload}`)

        if (status === 1) { // 1是开启
          console.log('进入开启接口')
          jsonData.type = 'openface'
          console.log('人脸采集openface', jsonData)
        } else if (status === 2) {  // 2是采集上传
          console.log('进入上传接口')
          jsonData.type = 'baiduFaceCollect'
          jsonData.facecode = `{"StoreId": ${_this.payDetail.GasCode}}`  // 人脸参数
          jsonData.resultState = isUpload  // 是否上传 1:上传，0: 不上传
          jsonData.url = 'http://127.0.0.1:8881/webapi/face/dealFaceInfo'  // 上传图片地址
          console.log('人脸采集baiduFaceCollect', jsonData)
        } else { // 0是关闭
          console.log('进入关闭接口')
          jsonData.type = 'closeface'
          console.log('人脸采集closeface', jsonData)
        }

        this.$Bridgefunc.callBridge('phonebridge', jsonData, function (response) {
          if (response) {
            console.log('调用人脸采集');
          }
        });
      },
      // 广告
      getAd () {
        this.$store.state.stationData.code ? this.showPayorderImg = false : this.showPayorderImg = true
        // let url;
        // if (this.$store.state.isTest) {
        //   url = `http://${this.$store.state.stationData.IP}/SelfWebApi/api/SelfAD/SearchADInfo`;
        // } else {
        //   url = `http://10.191.8.110/SelfWebApi/api/SelfAD/SearchADInfo`;
        // }
        let url = this.$store.state.isTest ? `http://${this.$store.state.stationData.IP}/SelfWebApi/api/SelfAD/SearchADInfo` : `http://10.191.8.110/SelfWebApi/api/SelfAD/SearchADInfo`
        let params = {
          "PageCode": "HLWPAY001", // 页面编码
          "PositionCode": "003", // 广告位置编码
          "UniversalCode": this.$store.state.stationData.code, // 油站编码
          "DeviceCode": "hlwzz" // 设备编号
        };
        this.$http.post(url, params)
          .then(res => {
            this.payorderImg = res.data.Data
          }, error => {
            this.$Toast(error)
            this.writeLog (url)
          })
      },
      // 日志
      writeLog (msg) {
        console.log('msg',msg)
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
    created () {
      this.getAd ()
      this.payDetail = this.$route.params.payDetail;  // 原有数据
      this.paystyle = this.$route.params.paystyle;  // type 0微信，1支付宝
      this.telNumber = this.$route.params.telNumber;  // 获取上个页面填写的手机号
      if (this.paystyle) {
        this.payWay = '支付宝支付';
        this.paystyle0 = false;
        this.payWayStyle = 16
      } else {
        this.payWay = '微信支付';
        this.payWayStyle = 7
      }
      this.amount = this.payDetail.Amount;
      this.goodsId = this.payDetail.ID;
      this.acctID = this.$route.params.acctID;
      this.openID = this.$route.params.openID;
      this.selectval = this.$route.params.selectval;
      // this.$Loading.close()
    },
    mounted () {
      this.lastTime = new Date().getTime();   // 网页第一次打开时，记录当前时间
      this.scanEvent(1);
    },
    beforeDestroy () {
      this.faceCollect(0)
    }
  }
</script>
<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/common.styl';
  .carousel-box >>> .el-carousel {
    .el-carousel__container {
      height: 960px
    }
    .el-carousel__item h3 {
      color: #475669;
      font-size: 18px;
      opacity: 0.75;
      margin: 0;
    }
    .el-carousel__item:nth-child(2n) {
      background-color: #fff;
    }
    .el-carousel__item:nth-child(2n+1) {
      background-color: #fff;
    }
    .el-carousel__indicators--outside {
      display none
    }
  }
  .in-charging-wrapper >>> .el-dialog {
    width: 676px
    height: 420px
    border-radius 10px
    background: rgba(53,53,53,.7)
    .el-dialog__header{
      .el-icon-close {
        display none
      }
    }
    .el-dialog__body {
      padding 0 30px
      text-align center
      font-size: $fz45
      color: $fc-white
      span {
        line-height: 60px
      }
    }
  }
  .el-dialog-wrapper >>> .el-dialog {
    width: 912px
    height: 582px
    margin-top: 650px
    border-radius 10px
    .el-dialog__header{
      padding-top 56px
      .el-icon-close {
        margin 20px 30px 0 0
      }
      .el-icon-close:before {
        content: url("/static/images/payorder/btn_close.png")
      }
      .el-dialog__title {
        font-size: $fz45
        color: $fc-48
        font-weight 500
      }
    }
    .el-dialog__body {
      padding: 90px 60px 98px;
      font-size: 39px
      color: $fc-48
      text-align: center
      i {
        display inline-block
        width: 40px
        height: 40px
        vertical-align middle
      }
      i.fail {
        background: url("/static/images/payorder/pay_failure11.png") no-repeat
      }
      i.succ {
        background: url("/static/images/payorder/icon_successful.png") no-repeat
      }
      span {
        display inline-block
        height: 100px
        line-height: 50px
      }
      .self-btn {
        margin-top 90px
        span {
          display inline-block
          width: 360px
          height: 102px
          line-height: 102px
          border 1px solid #6EC773
          font-size: 39px
          border-radius 10px
        }
        .scan-again {
          color: #39b240
          margin-right 50px
        }
        .check-pay {
          color: $fc-white
          background: #39b240
        }
      }
    }
  }
  .payorder {
    width: 100%;
    height: 100%
    background-color: $bgc
    text-align: center
    .wrap {
      height: 150px
      overflow: hidden
      border-bottom: 1px solid #ECECEC
    }
    .count-wrapper {
      width: 660px
      height: 226px
      margin: 0 auto 60px
      background: #5AD25A
      border-bottom-left-radius: 40px
      border-bottom-right-radius: 40px
      text-align center
      .count-title {
        line-height: 114px
        font-size: 38px
        color: $fc-white
      }
      .count-detail {
        font-size: 75px
        color: #fff
        text-align: center
        span {
          font-size: 51px
        }
      }
    }
    .pay-tips {
      font-size: $fz45
      color: #4c4948
      margin-bottom: 34px
    }
    .pay-handle-tips {
      font-size: 39px
      color: #979696
    }
    .activity {
      padding-bottom 80px
    }
  }
</style>
