<template>
  <div >
    <div class="payorder">
      <div class="payorder-cont">
        <p class="close-btn"><img @click="closeBtn('')" src="../../../../static/images/payorder/btn_close.png" alt=""></p>
        <div class="count-wrapper">
          <p class="count-title">共{{payDetailObj.totalGoodsQuantities}}件商品，已优惠￥{{totalYhAmount}}，合计</p>
          <!-- 实际支付金额 -->
          <p class="count-detail"><span>¥</span>{{totalSjysAmount}}</p>
          <!-- 应收金额 -->
          <p class="count-total"><span>¥</span>{{totalYsAmount}}</p>
        </div>
        <div v-if="paystyle==0">
          <p class="pay-tips">打开微信支付在下方扫码器扫码</p>
          <p class="pay-handle-tips">微信首页 > 右上角 [ + ] > [ 收付款 ]</p>
          <p class="scan-pay"><img src="../../../../static/images/payorder/img_ScanTheQRCode0.png" alt=""></p>
        </div>
        <div v-else>
          <p class="pay-tips">打开支付宝支付在下方扫码器扫码</p>
          <p class="pay-handle-tips">支付宝首页 > [ 付钱 ]</p>
          <p class="scan-pay"><img src="../../../../static/images/payorder/img_ScanTheQRCode1.png" alt=""></p>
        </div>
      </div>
      <!--摄像头入口  1是支付，0查询-->
       <p class="barCode" style="position: absolute;top:20%;z-index: 2000" v-if="this.$store.state.isTest">
        <label>
          <input id='inputId'
                 v-model="scanValue"
                 @keyup.enter="payCheck(scanValue)"
                 autocomplete="off"
                 style="background-color: skyblue;z-index: 2000"
          />
        </label>
      </p>
    </div>
    <!-- 支付状态提示框 -->
    <div class="pay-dialog-wrapper state-dialog">
      <el-dialog
        title="支付结果"
        :visible.sync="payResultTips"
        center
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
      >
        <i :class="payResultTips?'fail':'succ'"></i>
        <span>{{payStateMsg}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button v-show="showBtn" @click="backToPay">重新支付</el-button>
          <el-button v-show="!showBtn" @click="backToPay">取消</el-button>
          <el-button  v-show="!showBtn" type="primary" @click="backToPay">重新支付</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 查询提示框 -->
    <div class="pay-dialog-wrapper">
      <el-dialog
        title="查询结果"
        :visible.sync="checkPayResult"
        center
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
      >
        <i :class="checkPayResult?'fail':'succ'"></i>
        <span>{{checkResultMsg}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button v-show="checkBtnShow" @click="backToPay">重新支付</el-button>
          <el-button v-show="!checkBtnShow" @click="backHome">回首页(<strong>{{count}}</strong>s)</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 返回按钮 -->
    <back-view @goHome="backHome" @goBack="goBack" style="z-index: 20000"></back-view>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Dialog  } from 'element-ui';
  import CommonHeader from '../common/CommonHeader'
  import Footer from '../common/Footer'

  Vue.use(Dialog);

  export default {
    name: "noneOilpay",
    components: {
      CommonHeader,
      Footer
    },
    props: {
      payDetailObj: Object   // 非油订单信息
    },
    data () {
      return {
        payResultTips: false,       // 支付弹框
        payStateMsg: '支付成功',
        payDetail: {},              // 商品详情
        resultObj: {},              // 商品支付详情
        showBtn: true,              // 支付状态对应按钮
        modelState: false,          // 阻止点击模态框遮罩或esc关闭
        scanValue: '',              // 扫码值
        saleNo: '',                 // 流水号
        paystyle: '0',              // 支付方式，0微信 1支付宝
        checkPayResult: false,      // 查询结果对话框
        checkResultMsg: '查询成功', // 查询结果内容
        checkBtnShow: true,         // 控制查询结果按钮显示
        payResult: '',              // 支付结果
        count: '',
        timer: null,
        clickEvent: false,          // 设置为false,让setInterval执行
        stationCode: '',              // 油站编码
      }
    },
    methods: {
      // 原生方法获取焦点扫码
      scanEvent (type) {
        let jsonData = {};
        if (type) { // 其他是开启
          jsonData.type = 'scancode'  // 开启摄像头
        } else {  // 0是关闭
          jsonData.type = 'closescan'  // 关闭摄像头
        }
        let _this = this;
        this.$Bridgefunc.callBridge('phonebridge', jsonData, function (response) {
          if (response) {
            _this.payCheck(response)
          }
        });
      },
      // 回首页
      backHome() {
        this.$router.push({
          name: '首页'
        })
      },
      // 返回上一页
      goBack () {
        this.closeBtn('')
      },
      // 页面点击事件,并重新启动倒计时
      handleDocumentEvent () {
        this.show = true;
        this.clickEvent = false;
        window.clearInterval(this.timer);
        this.countDown()  // 页面有操作后重新倒计时
      },
      // 关闭倒计时，不重新启动
      closeCount () {
        this.clickEvent = true;  // 设置为true,让setInterval不执行
        window.clearInterval(this.timer);  // 清除倒计时
      },
      // 倒计时10s 后回到首页
      countDown () {
        const TIME_COUNT = 10;
        if (this.clickEvent) {
          this.count = 0
        } else {
          this.count = TIME_COUNT
        }
        this.show = false;
        this.timer = setInterval(() => {
          if (this.count > 0 && this.count <= TIME_COUNT) {
            this.count--;
            if (this.count === 0) {
              this.$router.push({
                path: '/'
              });
              this.$Loading.close();
              window.clearInterval(this.timer)
            }
          } else {
            this.show = true;
            window.clearInterval(this.timer);
            this.timer = null;
          }
        }, 1000)
      },
      // 关闭支付页
      closeBtn (paycont) {
        this.$emit('payCallBack', paycont)
      },
      backToPay () {
        this.scanEvent(1);
        this.payResultTips = false;
        this.checkPayResult = false;
      },
      // 系统挂单
      SysSuspendBill () {
        let url = `http://${this.$store.state.stationData.IP2}:21862/checkout/api/SelfServiceCheckOut/SuspendBill`;
        let params1 = {
          "OrgCode": this.stationCode,
          "Bill": {
            "Number": null,
            "VipNo": null,
            "PosNo": '9166',
            "ClsCloudUserId": this.$store.state.sysCurrentInfo.ClsCloudUserId,
            "Amount": 0.0,
            "YsAmount": 0.0,
            "SjysAmount": 0.0,
            "YhAmount": 0.0,
            "SsAmount": 0.0,
            "YisAmount": 0.0,
            "DaisAmount": 0.0,
            "ZlAmount": 0.0,
            "ZfAmount": 0.0,
            "PluList": this.payDetailObj.scanGoodsList,
            "PayList": [],
            "ECouponList": []
          }
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params)
          .then(res => {
            let rs = res.data;
            if(rs.IsSuccess){
              let rs = JSON.parse(res.data.Data);
              this.saleNo = rs.SaleNo;
              this.$store.state.stationData.saleNo = rs.SaleNo;   //保存流水号，使用优惠券后，支付页不用请求流水号
            }else{
              this.$Toast(rs.Message);
            }
          }, error => {
            this.$Toast("编号：5，请求数据失败! 请您检查设备是否已连接网络！")
            this.writeLog (url)
          })
      },
      // 支付方式检查
      payCheck (scanValue) {
        this.payBeforeCheck (scanValue)
      },
      // 微信支付
      payWeChat (scanValue) {
        this.scanEvent(0);
        this.$Loading.open('支付中，请耐心等待！');
        let url = `http://${this.$store.state.stationData.IP2}:21862/pay/api/SelfServicePay/PayWeChat`;
        let params1 = {
          "OrgCode": this.stationCode,
          "SaleNo": this.saleNo,
          "QrCode": scanValue,
          "Amount": this.totalSjysAmount
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params)
          .then(res => {
            if(res.data.IsSuccess === true) {
              this.CheckOutSaleBill()
            } else {
              this.$Loading.close();
              this.payResultTips = true;
              let msg = res.data.Message;
              if(msg.substring(0,3) === '请扫描'){
                this.scanEvent(1);
                this.payResultTips = true;
                this.payStateMsg = '付款码不正确，请扫描微信支付授权码'
              }else{
                this.scanEvent(1);
                this.payResultTips = true;
                this.payStateMsg = '支付失败，若扣款成功，请准备支付凭证到收银台咨询！'
              }
              this.scanValue = '';
            }
        }, error => {
            this.scanEvent(1);
            this.$Loading.close();
            this.$Toast("编号：6，请求数据失败! 请您检查设备是否已连接网络！")
            this.writeLog (url)
        })
      },
      // 支付宝支付
      payPayAli (scanValue) {
        this.scanEvent(0);
        this.$Loading.open('支付中，请耐心等待！');
        let url = `http://${this.$store.state.stationData.IP2}:21862/pay/api/SelfServicePay/PayAli`;
        let params1 = {
          "OrgCode": this.stationCode,
          "SaleNo": this.saleNo,
          "QrCode": scanValue,
          "Amount": this.totalSjysAmount
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params)
          .then(res => {
            if(res.data.IsSuccess === true) {
              this.CheckOutSaleBill()
            } else {
              this.scanEvent(1)
              this.$Loading.close();
              this.payResultTips = true;
              this.payStateMsg = res.data.Message;
              this.scanValue = '';
            }
        }, error => {
            this.scanEvent(1);
            this.$Loading.close();
            this.$Toast("编号：7，请求数据失败! 请您检查设备是否已连接网络！");
            this.writeLog (url)
        })
      },
      // 订单收银
      CheckOutSaleBill () {
        let url = `http://${this.$store.state.stationData.IP2}:21862/checkout/api/SelfServiceCheckOut/CheckOutSaleBill`;
        let params1 = {
          "OrgCode": this.stationCode,
          "PosNo": '9166',
          "ClsCloudUserId": this.$store.state.sysCurrentInfo.ClsCloudUserId,
          "saleNo": this.saleNo,
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params, {
            timeout: 200000,
          })
          .then(res => {
            this.scanValue = '';
            if(res.data.IsSuccess){
              this.$Loading.close();
              this.$router.push({
                name: '非油支付成功',
                params: {
                  payDetailObj: this.payDetailObj,
                  saleNo: this.saleNo,
                  paystyle: this.paystyle,
                }
              });
            }else{
              this.$Loading.close();
              this.payResultTips = true;
              this.payStateMsg = res.data.Message;
              this.scanValue = '';
            }
            this.$store.state.stationData.saleNo = ''  // 支付完，清空流水号
          }, error => {
            this.scanEvent(1);
            this.scanValue = '';
            this.$Toast("编号：11，请求数据失败! 请您检查设备是否已连接网络！")
            this.writeLog (url)
        })
      },
      // 支付前验证
      payBeforeCheck (scanValue) {
        let url = `http://${this.$store.state.stationData.IP2}:21862/check/api/SelfServiceCheck/CheckAmount`;
        let params1 = {
          "OrgCode": this.stationCode,
          "SaleNo": this.saleNo,
          "Message": `销售单号：${this.saleNo} 应收金额：${this.totalYsAmount} 优惠金额：${this.totalYhAmount} 电子券金额：0 实收金额：${this.totalSjysAmount}`
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params)
          .then(res => {
            if (this.totalSjysAmount == res.data.Data) {
              if(this.paystyle){  // 1支付宝 0微信
                this.payPayAli(scanValue)
              }else{
                this.payWeChat(scanValue)
              }
            } else {
              if (res.data.ErrorCode === 1000) {
                this.$Toast("实收金额异常,不能收银!")
              } else if (res.data.ErrorCode === 1001) {
                this.$Toast("结算失败，请去柜台未结算订单处理!")
              }
            }
          }, error => {
            this.$Toast("编号：01非油验证，请求数据失败! 请您检查设备是否已连接网络！")
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
    created() {
      if (this.$store.state.isTest) {
        this.stationCode = '33250001';
      } else {
        this.stationCode = this.$store.state.stationData.code;
      }
      this.totalYhAmount = parseFloat(this.payDetailObj.totalYhAmount).toFixed(2);
      this.totalSjysAmount = parseFloat(this.payDetailObj.totalSjysAmount).toFixed(2);
      this.totalYsAmount = parseFloat(this.payDetailObj.totalYsAmount).toFixed(2);
      this.paystyle = this.payDetailObj.typeWay;  // 0微信 1支付宝
      if(!this.$store.state.stationData.saleNo){
        this.SysSuspendBill()
      }else{
        this.saleNo = this.$store.state.stationData.saleNo
      }
    },
    mounted() {
      this.scanEvent(1)  // 进入页面开启摄像头
    },
    beforeDestroy() {
      // this.scanEvent(0);  // 离开页面关闭摄像头
      // 刷新页面，清除倒计时
      if (this.timer) {
        this.closeCount()
      }
    }
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/common.styl';

  /* 支付提示框 start*/
  .pay-dialog-wrapper /deep/ .el-dialog {
    position: absolute;
    left: 50%;
    top: 50%;
    margin: -250px 0 0 -457px!important;
    width: 914px;
    border-radius: 18px;
    .el-dialog__header{
      font-size: 39px
      padding-top 56px
      .el-icon-close {
        margin 10px 15px 0 0
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
        width: 46px
        height: 46px
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
    }
    .dialog-footer {
      .el-button {
        width: 360px
        height: 102px
        border 1px solid #6EC773
        font-size: 39px
        border-radius 10px
      }
      .el-button--default {
        color: #39b240
        margin-right 50px
      }
      .el-button--primary {
        color: $fc-white
        background: #39b240
      }
    }
  }
  /* 支付提示框 end */
  .payorder {
    width: 100%;
    height: 100%
    text-align: center
    position: absolute
    top: 0
    left: 0
    background-color: rgba(76,73,72,0.5)
    z-index: 1000
    .wrap {
      height: 150px
      overflow: hidden
      border-bottom: 1px solid #ECECEC
    }
    .payorder-cont::-webkit-scrollbar{
      display: none;
    }
    .payorder-cont{
      width: 100%
      height: 80vh
      overflow: scroll
      position: absolute
      bottom: 0
      background: #ffffff
      z-index: 999
      .close-btn{
        height: 100px
        text-align: right
        img{
          margin: 13px 20px
        }
      }
    }
    .count-wrapper {
      width: 100%
      height: auto
      margin: 0 auto 148px
      border-bottom-left-radius: 40px
      border-bottom-right-radius: 40px
      text-align center
      .count-title {
        line-height: 60px
        font-size: $fz45
        color: #4A4947
      }
      .count-detail {
        line-height: 100px
        font-size: 75px
        color: #27C226
        text-align: center
        span {
          font-size: 51px
        }
      }
      .count-total{
        line-height: 40px
        font-size: 36px
        color: #B7B7B7
        text-decoration: line-through
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
      margin-bottom: 150px
    }
  }
</style>
