<template>
  <div class="pay-detail-wrapper" @click="handleDocumentEvent()">
    <p class="icon-wrapper"><img src="static/images/payOrderDetail/icon.png" alt=""></p>
    <div class="detail-wrapper">
      <p class="title">支付成功！</p>
      <p class="pay-total">￥{{totalSjysAmount}}</p>
      <div class="pay-detail">
        <p class="pay-item"><span>总金额（元）</span><span>{{totalYsAmount}}</span></p>
        <p class="pay-item"><span>优惠金额（元）</span><span>{{totalYhAmount}}</span></p>
        <p class="pay-item real-pay"><span>共{{payDetailObj.totalGoodsQuantities}}件</span></p>
      </div>
    </div>
    <p class="confirm-button back-to-home martop">
      <span @click.stop="openInvoice">开具电子发票</span>
    </p>
    <p class="confirm-button back-to-home">
      <span class="count" @click.stop="backToHome">首页(<strong>{{count}}</strong>s)</span>
    </p>
    <back-view @goBack="goBack" @goHome="goHome"></back-view>
    <!-- 底部 -->
    <div class="footer">
      <Footer></Footer>
    </div>
  </div>
</template>

<script>
  import Footer from '../common/Footer'

  export default {
    name: "paySuccess",
    components: {
      Footer
    },
    data () {
      return {
        payDetail: {}, // 支付信息
        resultObj: {},  // 商品支付详情
        count: '',
        timer: null,
        clickEvent: false, // 设置为false,让setInterval执行
        modelState: false,          // 阻止点击模态框遮罩或esc关闭
        payDetailObj: Object,  // 非油订单信息
        stationCode: '',              // 油站编码
      }
    },
    methods: {
      goHome () {
        this.closeCount(); // 清除定时刷新,不重新启动
        this.$router.push({
          path: '/'
        })
      },
      goBack () {
        this.closeCount();
        this.freshCount = null;
        this.$store.state.pushedLength--;
        this.$router.go(-1)
      },
      // 回到首页按钮
      backToHome () {
        this.closeCount();
        this.$router.push({
          path: '/'
        });
        this.$Loading.close();
      },
      //  页面点击事件,并重新启动倒计时
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
      // 打印小票  new printer
      printerNew () {  // align: 0居中，1居左，2居右
        let sysInfo = this.$store.state.sysCurrentInfo;
        var payname
        if(this.paystyle){
          payname = '支付宝支付'
        }else{
          payname = '微信支付'
        }
        let printTime = this.$util.dateFtt("yyyy-MM-dd hh:mm:ss", new Date());
        let jsonData = {};
        jsonData.type = 'printticketbase';
        this.pdata = [
          {"align":"0", "value":"中石化加油站销售小票"},
          {"align":"0", "value": ""+sysInfo.NodeName+""},
          {"align":"0", "value":"-------------------------------"},
          {"align":"0", "value":"收银员："+sysInfo.CshName+""},
          {"align":"0", "value":"商品        数量   单价   金额"},
          {"align":"2", "value":"合计（元）："+this.totalYsAmount+""},
          {"align":"0", "value":"-------------------------------"},
          {"align":"1", "value":"支付方式： "+payname+""},
          {"align":"1", "value":"日期： "+ printTime +""},
          {"align":"1", "value":"流水号： "+this.saleNo+""},
          {"align":"1", "value":"合计（元）："+this.totalYsAmount+""},
          {"align":"1", "value":"优惠金额（元）："+this.totalYhAmount+""},
          {"align":"1", "value":"实收（元）："+this.totalSjysAmount+""},
          {"align":"0", "value":"-------------------------------"},
          {"align":"0", "value":"请保留小票，以作退换货凭证"},
          {"align":"0", "value":"欢迎您再次光临"},
          {"align":"0", "value":"客户存根联"},
          {"align":"0", "value":""},
        ];
        let obj = '';
        let scanGoodsList = this.payDetailObj.scanGoodsList;
        var titles
        for(var i in scanGoodsList){
          if(scanGoodsList[i].Name.length>6){
            titles = scanGoodsList[i].Name.substring(0,5)+'...'
          }else{
            titles = scanGoodsList[i].Name
          }
          obj = {"align":"0", "value":""+titles+"  "+scanGoodsList[i].XsCount+"    "+scanGoodsList[i].Price+"   "+scanGoodsList[i].YsAmount+""};
          this.pdata.splice(5,0,obj);
        }
        this.pdata.StationName = this.$store.state.stationData.name;
        this.pdata.IsPrintInvoice = '0';
        this.pdata.QRCodeUrl = 'https://gdws.nsenz.com/app/download';
        jsonData.printcontentbase = encodeURIComponent(JSON.stringify(this.pdata));
        this.$Bridgefunc.callBridge(
          'phonebridge',
          jsonData,
          function (response) {
          if (response) {
          } else {
          }
        })
      },
      openInvoice () {
        this.closeCount();
        this.$store.state.pushedLength ++;
        this.$router.push({
          name: '非油开发票',  // noneOilInvoice
          params: {
            payDetailObj: this.payDetailObj,
            saleNo: this.saleNo
          }
        })
      },
      // 自助终端设置销售终端号
      SetPosNo () {
        let _this = this;
        let deviceId = this.$store.state.commonargs.deviceId;
        if(deviceId){
          let url = `http://${this.$store.state.stationData.IP2}:21862/sys/api/SelfServiceSystem/SetPosNo`;
          let params1 = {
            OrgCode: _this.stationCode,
            DeviceId: _this.$store.state.commonargs.deviceId,
            PosNo: '9166'
          };
          let argsStr = JSON.stringify(params1);
          let sign = this.$sign.signArgs(argsStr,0);
          let params = {
            "JsonData": argsStr,
            "Sign": sign
          };
          this.$http.post(url, params).then(res => {

          }, error => {
            // console.log('获取终端销售号报错：','error')
            this.$Toast("编号：1，请求数据失败!请您检查设备是否已连接网络！")
            this.writeLog (url)
          })
        }
      },
      // 获取当前记账日期&班次&操作员&销售终端号等信息
      getSysCurrentInfo () {
          let _this = this;
          let deviceId = this.$store.state.commonargs.deviceId;
          if(deviceId){
            let url = `http://${this.$store.state.stationData.IP2}:21862/sys/api/SelfServiceSystem/GetSysCurrentInfo`;
            let params1 = {
              OrgCode: _this.stationCode,
              DeviceId: _this.$store.state.commonargs.deviceId,
            };
            let argsStr = JSON.stringify(params1);
            let sign = this.$sign.signArgs(argsStr,0);
            let params = {
              "JsonData": argsStr,
              "Sign": sign
            };
            this.$http.post(url, params).then(res => {
              let rs = res.data;
              if (rs.ErrorCode === 0) {  // 终端号： 0已设置，1未设置
                let rss = rs.Data;
                _this.$store.state.sysCurrentInfo = rss;  // 终端号信息
                _this.noOilSaleNo = rss.PosNo; // 收银号 默认9166
                _this.isPosNo = true
                this.printerNew()
              } else {
                _this.isPosNo = false
              }
            }, error => {
              // console.log('获取终端销售号报错：','error')
              this.$Toast("编号：2，请求数据失败!请您检查设备是否已连接网络！")
              this.writeLog (url)
            })
          }
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
      this.saleNo = this.$route.params.saleNo;
      this.paystyle = this.$route.params.paystyle;
      this.payDetailObj = this.$route.params.payDetailObj; // 支付信息
      this.totalYhAmount = parseFloat(this.payDetailObj.totalYhAmount).toFixed(2);
      this.totalSjysAmount = parseFloat(this.payDetailObj.totalSjysAmount).toFixed(2);
      this.totalYsAmount = parseFloat(this.payDetailObj.totalYsAmount).toFixed(2);
      this.SetPosNo()
    },
    mounted() {
      this.getSysCurrentInfo ()
      this.countDown ()
    },
    beforeDestroy() {
      // 刷新页面，清除倒计时
      if (this.timer) {
        this.closeCount()
      }
    }
  }
</script>

<style scoped lang="stylus">
  @import '~@/common/stylus/common.styl';

  .pay-detail-wrapper {
    height 100%
    padding-top 108px
    text-align center
    .icon-wrapper {
      margin-bottom 48px
    }
    .detail-wrapper {
      padding 0 215px 55px
      .title {
        font-size: $fz45
        color: $fc-48
        font-weight: 500
        margin-bottom 30px
      }
      .pay-total{
        line-height: 200px
        font-size: 75px!important
        color: #39B23F
        border-bottom: 1px solid $bo-color
      }
      .pay-detail {
        line-height: 86px
        color: #9EA09F
        font-size: 36px
        text-align left
        border-bottom 1px solid $bo-color
        padding: 25px 0
        .pay-item {
          display: flex
          justify-content: space-between
        }
        .real-pay {
          color: $fc-48
        }
      }
    }
    .confirm-button {
      width: 640px
      line-height: 120px
      background: #39B23F
      margin: 0 auto
      color: $fc-white
      border-radius 15px
      text-align center
    }
    .back-to-home {
      -webkit-box-sizing: border-box
      -moz-box-sizing: border-box
      box-sizing: border-box
      border 1px solid #38B341
      font-size 36px
      color: #38B341
      background: #fff
      span {
        display inline-block
        width: 100%
        height: 100%
        strong {
          display: inline-block
          width: 55px
        }
      }
    }
    .martop{
      margin  220px auto 40px
    }
    #footer {
      border-top 1px solid $bo-color
    }
  }
</style>
