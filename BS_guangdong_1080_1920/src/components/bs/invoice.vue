<template>
  <div class="invoice">
    <div class="invoice-content">
      <div class="manual-text">
        <div class="tips">如需发票请下载“加油广东”APP，“我的发票”里开具发票</div>
        <div class="tag">电子发票</div>
      </div>
    </div>
    <back-view @goBack="goHome" @goHome="goHome"></back-view>
  </div>
</template>

<script>
  export default {
    name: "invoice",
    components: {},
    data() {
      return {
        invoiceInfo: [],
        orderitem: [],
      }
    },
    methods: {
      goHome () {
        let jsonData = {};
        jsonData.type = 'closescan';
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
        });
        this.$router.go(-this.$store.state.pushedLength)
      },
      goBack () {
        let jsonData = {};
        jsonData.type = 'closescan';
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
        });
        this.$store.state.pushedLength--;
        this.$router.go(-1)
      },
      scanEvent: function () {
        let jsonData = {};
        jsonData.type = 'scancode';
        let _this = this;
        this.$Bridgefunc.callBridge('phonebridge', jsonData, function (response) {
          if (response) {
            //这里应该调用申请开发票接口
            _this.getGetInvoiceInfo(response);
          }
        })
      },
      //通过发票二维码获取发票内容接口
      getGetInvoiceInfo (QrCode) {
        QrCode = decodeURIComponent(QrCode);
        let url = 'http://'+ this.$store.state.stationData.IP+':'+ this.$store.state.stationData.port+'/'+this.$store.state.stationData.centerUrlTest+'/api/Terminal/GetInvoiceInfo';
        let params1 = {
          QrCode: '' + QrCode,
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr);
        let params = "Args=" + argsStr + '&StationCode=' +this.$store.state.stationData.code + "&DeviceCode=" + this.$store.state.commonargs.deviceId + "&Sign=" + sign;
        this.$Loading.open();
        this.$http.post(url, params,{ headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }}).then(res => {
          this.$Loading.close();
          let data = res.data;
          if (data.ResultCode == 1) {
            this.invoiceInfo = JSON.parse(data.ResultObj);
            this.getPrintInvoice()
          } else {
            this.$Toast("" + data.ErrMsg)
          }
        }, error => {
          this.$Loading.close();
          this.$Toast("编号：7，请求数据失败!请您检查设备是否已连接网络！")
        })
      },
      //开取发票
      getPrintInvoice() {
        let url = 'http://'+ this.$store.state.stationData.centralIP+':'+ this.$store.state.stationData.centralPort+'/'+this.$store.state.stationData.centerUrl+'/api/Terminal/PrintInvoice';
        let params1 = {
          RefueledID: '' + this.orderitem.ID,
          ActAmount: '' + this.orderitem.HasPayAmount,
          InvoiceType: 51,
          Name: '' + this.invoiceInfo.Name,
          TaxNo: '' + this.invoiceInfo.TaxNo,
          Address: '' + this.invoiceInfo.Address,
          TelePhone: '' + this.invoiceInfo.TelePhone,
          BankName: '' + this.invoiceInfo.BankName,
          BankAccount: '' + this.invoiceInfo.BankAccount,
          Email: '' + this.invoiceInfo.Email,
          AppUserID: '' + this.invoiceInfo.AppUserID,
          MobilePhone: '' + this.invoiceInfo.MobilePhone,
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
        let _this = this;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,(response) => {
          _this.$Loading.close();
          let data = JSON.parse(response);
            if (data.ResultCode == 1) {
              _this.$Toast("已申请发票");
              _this.goHome()
            } else {
              _this.$Toast(data.ErrMsg);
              _this.scanEvent();
              // this.$Toast({
              //   message: "请求数据失败!请稍后重试",
              //   position: 'middle'
              // })
            }
        })
      },
    },
    mounted() {
      this.orderitem = this.$route.query.orderitem
    },
    created() {
      this.scanEvent();
    },
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .invoice {
    width 100%;
    height 100%
    position relative;
    .invoice-content{
      text-align center;
      width 100%;
      height 100%
      background: url("../../../static/images/img_invoice.jpg") no-repeat center center / 100% 100%;
    }
    .invoice-text {
      position absolute;
      width 100%;
      text-align center;
    }
    .tips {
      display flex;
      justify-content center;
      align-items center
      height 40px;
      background-color $tip-top-bg;
      font-size $font-size-small
    }
    .tag {
      margin-top 30px;
      display flex;
      justify-content center;
      align-items center
      color white;
      font-size $font-size-medium
    }
    .manual-img {
      display block;
      width 100%;
      height 100%;
    }
  }
</style>
