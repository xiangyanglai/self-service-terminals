<template>
  <div class="payorder">
    <div class="wrap">
      <common-header @goBack="backHome"><span class="title">开具电子发票</span></common-header>
    </div>
    <p class="scan-pay"><img src="../../../../static/images/noneOil/invoice_tip.png" alt=""></p>
    <p class="no-invoice" @click.stop="backHome">不开具电子发票</p>
    <p class="back-to-home" @click.stop="backHome">首页</p>
   <!-- 底部 -->
    <Footer></Footer>

    <!-- 状态提示框 -->
    <div class="el-dialog-wrapper">
      <el-dialog
        title="开票结果"
        :visible.sync="invoiceShow"
        center
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
      >
        <span><i :class="showSuccessBtn?'succ':'fail'"></i> {{invoiceMsg}}</span>   <!-- 登记开票提示  -->
        <span slot="footer" class="dialog-footer">
          <el-button v-show="showSuccessBtn" @click.stop="backHome">确定，返回首页</el-button>
          <el-button v-show="!showSuccessBtn" @click.stop="backHome">返回</el-button>
          <el-button v-show="!showSuccessBtn" type="primary" @click.stop="reInvoice">重新扫码开票</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 返回按钮 -->
    <back-view @goHome="backHome" @goBack="goBack" style="z-index: 1000"></back-view>

    <!-- 摄像头入口 -->
     <p class="barCode" v-if="this.$store.state.isTest">
      <label>
        <input id='inputId' v-model="scanValue" @keyup.enter="getInvoiceInfo()" autocomplete="off" style="background-color: skyblue;" />
      </label>
    </p>

  </div>
</template>

<script>
  import Vue from 'vue'
  import { Dialog  } from 'element-ui';
  import CommonHeader from '../common/CommonHeader'
  import Footer from '../common/Footer'

  Vue.use(Dialog);

  export default {
    name: "noneOilInvoice",
    components: {
      CommonHeader,
      Footer
    },
    data () {
      return {
        invoiceInfo: [],     // 发票内容信息
        scanValue: '',       // 扫描值
        invoiceShow: false,  // 开票提示框
        modelState: false,   // 阻止点击模态框遮罩或esc关闭
        invoiceMsg: '',      // 弹框提示内容
        showSuccessBtn: true,// 是否显示弹框按钮
        saleNo: '',          // 流水号
        stationCode: '',     // 油站编码
      }
    },
    methods: {
      // 回首页
      backHome() {
        this.$router.push({
           name: '首页'
        })
      },
      // 返回上一页
      goBack () {
        this.$router.push({
          name: '首页'
        })
      },
      // 原生扫码获取焦点
      scanEvent (type) {
        let jsonData = {};
        if (type) { // 其他是开启
          jsonData.type = 'scancode'  // 开启摄像头
        } else {  // 0是关闭
          jsonData.type = 'closescan'  // 关闭摄像头
        }
        jsonData.type = 'scancode';
        let _this = this;
        this.$Bridgefunc.callBridge('phonebridge', jsonData, function (response) {
          if (response) {
            _this.scanValue = response;
            _this.getInvoiceInfo();
          }
        })
      },
      // 通过发票二维码获取发票内容接口 // 通过云平台
      getInvoiceInfo () {
        let _this = this;
        this.scanEvent(0);  // 开票中，关闭摄像头
        this.$Loading.open('正在开具电子发票');
        let url;
        if (this.$store.state.isTest) {
          url = 'http://10.191.8.201/HandHeldPosApi/api/Terminal/GetInvoiceInfo';
        } else {
          url = 'http://10.191.8.110/HandHeldPosApi/api/Terminal/GetInvoiceInfo';
        }
        let params1 = {
          "QrCode": this.scanValue
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "Args": argsStr,
          "DeviceCode": this.$store.state.commonargs.deviceId ,
          "StationCode": this.stationCode,
          "Sign": sign
        };
        this.$http.post(url, params).then(res => {
          let rs = res.data;
          if (rs.ResultCode ===1 ) {
            let invoiceInfo = JSON.parse(rs.ResultObj);
            _this.PrintInvoice(invoiceInfo)
          } else {
            _this.$Loading.close();
            _this.$Toast(rs.ErrMsg);
            _this.scanEvent(1)
          }
        }, error => {
          this.scanEvent(1);
          this.$Loading.close();
          this.$Toast("编号：01非油获取发票，请求数据失败!请您检查设备是否已连接网络！")
          this.writeLog (url)
        })
      },
      // 开具发票
      PrintInvoice(invoiceInfo) {
        let stationCode;
        if (this.$store.state.isTest) {
          stationCode = '33250001'
        } else {
          stationCode = this.$store.state.stationData.code
        }
        let params1 = {
          "SaleNo": this.saleNo,
          "OrgCode": stationCode,
          "InvoiceType": "51",                    // 发票类型  41-普票(卷票) 51-电子票
          "UnitName": invoiceInfo.Name,           // 发票抬头
          "BankName": invoiceInfo.BankName,       // 开户行名称
          "BankAccount": invoiceInfo.BankAccount, // 开户行账号
          "TaxNum": invoiceInfo.TaxNo,            // 税号
          "Address": invoiceInfo.Address,         // 单位地址
          "Telephone": invoiceInfo.Telephone,     // 单位电话
          "Phone": invoiceInfo.MobilePhone,       // 客户手机号
          "Email": invoiceInfo.Email,             // 邮箱
          "ReceiveMan": invoiceInfo.AppUserID,    // 收款人
          "TicketMan": invoiceInfo.Name,          // 开票人
        };
        let url = `http://${this.$store.state.stationData.IP2}:21862/sale/api/SelfServiceSale/PrintInvoice`;
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params)
          .then(res => {
              this.$Loading.close()
              this.scanEvent(1); // 开启摄像头
            if (res.data.IsSuccess === true) {
              this.scanValue = '';
              this.invoiceShow = true;
              this.showSuccessBtn = true;
              this.invoiceMsg = '开票成功，已发送您的邮箱，若未收到邮件，请咨询加油员！';
            } else {
              this.scanValue = '';
              this.invoiceShow = true;
              this.showSuccessBtn = false;
              this.invoiceMsg = res.data.Message;
            }
          }, error => {
            this.$Loading.close();
            this.scanEvent(1);
            this.invoiceShow = false;
            this.$Toast("编号：01开具发票，请求数据失败!请您检查设备是否已连接网络！");
            this.writeLog (url)
          })
      },
      // 点击“重新扫码开票”
      reInvoice () {
        this.invoiceShow = false;
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
      this.saleNo = this.$route.params.saleNo;  // 流水号
      this.scanEvent(1)  // 进入页面开启摄像头
    },
    beforeDestroy () {
      this.scanEvent(0)  // 离开页面关闭摄像头
    }
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/common.styl';
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
    .no-invoice {
      width: 640px
      line-height: 120px
      margin 0 auto
      border-radius 15px
      text-align center
      -webkit-box-sizing: border-box
      -moz-box-sizing: border-box
      box-sizing: border-box
      border 1px solid #38B341!important
      color: #38B341
      background: #fff
    }
    .back-to-home{
      width: 640px
      line-height: 120px
      margin 0 auto
      border none
      color #A0A0A0
    }
    /* 弹框提示语 */
    .el-dialog-wrapper >>> .el-dialog {
      width: 912px
      height: 582px
      position: absolute;
      top: 50%
      left: 50%
      transform: translate(-50%, -50%);
      border-radius 10px
      margin: 0!important
      .el-dialog__header{
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
        padding: 90px 60px 70px;
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
          background: url("/static/images/payorder/pay_failure11.png") no-repeat 100% 100%
          background-pisition center center
        }
        i.succ {
          background: url("/static/images/payorder/icon_successful.png") no-repeat 100% 100%
          background-pisition center center
        }
        span {
          display inline-block
          height: 100px
          line-height: 50px
        }
      }
      .dialog-footer {
        .el-button {
          width: 370px
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
    /* 弹框提示语 end */

  }


</style>
