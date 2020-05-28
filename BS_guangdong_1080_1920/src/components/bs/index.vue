<template>
  <div class="index-wrap">
    <div class="top-set">
       <div class="logo-img" @click="ping('10.191.8.110')"><img src="../../../static/index/index_logo.png" alt=""></div>
       <div class="to-setting">
         <span>{{name}}</span>
         <span>版本号:{{version}}</span>
         <img class="setting-img cursor" src="../../../static/index/settings.png" @click="goSetting()" alt="">
       </div>
    </div>
    <div class="top">
      <img class="wh" v-show="showIndexImg" src="../../../static/index/img_bg3.jpg" alt="" />
      <div class="carousel-box" v-show="!showIndexImg">
        <el-carousel indicator-position="outside">
          <el-carousel-item v-for="(item,index) of indexImg" :key="index">
            <img :src="item.AdImageUrl" alt="">
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
    <div class="content">
      <div class="index">
        <div v-if="isOpenOilPay">
          <div v-if="isselectgun == '1'" class="index-item cursor guide" @click="guide()"></div>
          <div v-if="isselectoil == '1'" class="index-item cursor trades" @click="clearingTrades()"></div>
        </div>
        <div v-if="isOpenNOOILPay" class="index-item cursor noneoil" @click="noneOil()"></div>
      </div>
      <div class="qrcode">
        <div class="intro-info">技术支持：北京尚博信科技有限公司</div>
        <div class="qrcode-img-box">
          <div class="qrcode-img"></div>
          <p>扫一扫小程序<br />开具电子发票</p>
        </div>
        <div><img src="../../../static/index/qrcode.png" alt="" /></div>
      </div>
    </div>
    <!-- 无网络 -->
    <NoNetwork v-if="IsConnectShow" @Back="Back" @Back1="Back1"></NoNetwork>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Carousel } from 'element-ui';
  Vue.use(Carousel);
  export default {
    name: "index",
    components: {
       NoNetwork: require('./NoNetwork').default,
    },
    data() {
      return {
        isselectgun: '1',
        isselectoil: '1',
        stationdata:{},
        name:'',
        version:'',
        IsConnectShow: false, // 是否显示无网络
        zkInfo: {
          IP:'',
          Port:'',
          StationName:'',
        },
        pdata: [],            // 传参数组
        isOpenNOOILPay: true,  // 是否显示非油
        isOpenOilPay: true,  // 是否显示油品
        ClickType: '',        // 油品列表
        portVal: '',
        showIndexImg: true,
        indexImg: [],
        stationCode: '', // 油站编码
      }
    },
    methods: {
      Back () {
        this.IsConnectShow = false
      },
      Back1 () {
        this.IsConnectShow = false;
        this.getconnet()
      },
      goSetting () {
        let jsonData = {};
        jsonData.type = 'closescan';
        this.$Bridgefunc.callBridge('phonebridge', jsonData, function (response) {
        });
        this.$store.state.pushedLength ++;
        this.$router.push({
          path: 'setting',
        })
      },
      // 推送设备状态
      getSendDeviceStateInfo () {
        let url = 'http://'+ this.$store.state.stationData.IP+':'+ this.$store.state.stationData.port+'/'+this.$store.state.stationData.centerUrlTest+'/api/Terminal/SendDeviceStateInfo';
        let params1 = {
          DeviceIP: this.$store.state.commonargs.IpAddress ,
          DeviceVersion: this.$store.state.commonargs.appVersion,
          State:1,
          DeviceLogDate: this.$util.dateFtt("yyyy-MM-dd hh:mm:ss", new Date()),
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = "Args=" + argsStr + '&StationCode=' +this.$store.state.stationData.code + "&DeviceCode=" + this.$store.state.commonargs.deviceId + "&Sign=" + sign;
        this.$http.post(url, params,{ headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }}).then(res => {
          let data = res.data;
          if (data.ResultCode == 1) {
          } else {
          }
        }, error => {
          this.writeLog (url)
        })
      },
      // 终端版本号
      getCommonargs () {
        let jsonData = {};
        jsonData.type = 'commonargs';
        let _this = this;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
          if (response) {
            _this.$store.state.commonargs = JSON.parse(response);
            _this.version = _this.$store.state.commonargs.appVersion;
          }
        })
      },
      // 油站信息
      getStationData () {
        let jsonData = {};
        jsonData.type = 'getitem';
        jsonData.key = "stationdata";
        let _this = this;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
          if (response.length>0) {
            _this.$store.state.stationData = JSON.parse( decodeURIComponent(response));
            _this.name = _this.$store.state.stationData.name;
            _this.getSendDeviceStateInfo()
          }
        })
      },
      // 检查网络
      getconnet () {
        let _this = this;
        _this.$Bridgefunc.registeBridge('getConnectStatus', function (response) { //0有网络，1无网络
          _this.$Loading.open('连接中');
          if (response === '1') {
            _this.$Loading.open('连接失败');
            setTimeout(function(){
              _this.$Loading.close();
              _this.IsConnectShow=true;},
              500)
          } else {
            _this.$Loading.close();
            _this.IsConnectShow = false;
          }
        })
      },
      clearingTrades () {
        this.ClickType = 'GasCode';
        if (this.$store.state.stationData.IP === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.code === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.centralPort === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.centralIP === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.port === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        this.$store.state.pushedLength++;
        this.$router.push({
          path: 'payment',
          query:{
            type:false
          }
        })
      },
      guide () {
        this.ClickType = 'GunNo';
        if (this.$store.state.stationData.IP === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.code === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.centralPort === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.centralIP === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.port === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        this.$store.state.pushedLength++;
        this.$router.push({
          path: 'paymentoilnum',
          query:{
            type:true
          }
        })
      },
      // 点击非油模块
      noneOil () {
        if (this.$store.state.stationData.IP === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.code === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.centralPort === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.centralIP === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        if (this.$store.state.stationData.port === ''){
          this.$Toast('请检查设置是否正确！');
          return;
        }
        this.$store.state.pushedLength++;
        this.$router.push({
          path: 'noneOilIndex',
          query:{
            type:true
          }
        })
      },
      // 检查是否显示枪号、油品
      isShowOil () {
        this.isselectgun = this.$store.state.isSelectgun;   //获取枪号、油品显示值.
        this.isselectoil = this.$store.state.isSelectoil;
      },
      // 广告
      getAd () {
        if (this.$store.state.stationData.indexAdImg.length === 0) {
          this.getAdimg()
        }
        if (this.$store.state.stationData.code !== '' && this.$store.state.stationData.indexAdImg.length === 0) {
          this.getAdimg()
        }
        if (this.$store.state.stationData.indexAdImg.length !== 0) {
          this.showIndexImg = false;
        }
      },
      // 获取广告图片
      getAdimg () {
        let url;
        if (this.$store.state.isTest) {
          url = `http://${this.$store.state.stationData.IP}/SelfWebApi/api/SelfAD/SearchADInfo`;
        } else {
          url = `http://10.191.8.110/SelfWebApi/api/SelfAD/SearchADInfo`;
        }
        let params = {
          "PageCode": "HLWH001", // 页面编码
          "PositionCode": "003", // 广告位置编码
          "UniversalCode": this.$store.state.stationData.code, // 油站编码
          "DeviceCode": "hlwzz" // 设备编号
        };
        this.$http.post(url, params)
          .then(res => {
            this.showIndexImg = false;
            this.indexImg = res.data.Data
            this.$store.state.stationData.indexAdImg = res.data.Data
          }, error => {
            this.$Toast('编号：01广告',error)
            this.writeLog (url)
          })
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
      },
      // 手动检测网络
      ping(ip) {
        console.log('进入ping ip ')
        let _this = this;
        var img = new Image();
        var start = new Date().getTime();
        var flag = false;
        var isCloseWifi = true;
        var hasFinish = false;
        img.onload = function() {
          if ( !hasFinish ) {
            flag = true;
            hasFinish = true;
            img.src = 'X:\\';
            // _this.$Toast('Ping ' + ip + ' success. ');
            _this.$Toast('网络连接成功！');
          }
        };
        img.onerror = function() {
          if ( !hasFinish ) {
            if ( !isCloseWifi ) {
              flag = true;
              img.src = 'X:\\';
              // _this.$Toast('Ping ' + ip + ' success. ');
              _this.$Toast('网络连接成功！');
            } else {
              // _this.$Toast('network is not working! ');
              _this.$Toast('网络连接失败！');
            }
            hasFinish = true;
          }
        };
        setTimeout(function(){
          isCloseWifi = false;
          console.log('network is working, start ping...');
        },2);
        img.src = 'http://' + ip + '/' + start;
        var timer = setTimeout(function() {
          if ( !flag ) {
            hasFinish = true;
            img.src = 'X://';
            flag = false ;
            // _this.$Toast('Ping ' + ip + ' fail. ');
            _this.$Toast('网络连接失败！');
          }
        }, 1500);
      }
    },
    created() {
      this.stationCode = this.$store.state.stationData.code
      this.isOpenNOOILPay = this.$store.state.stationData.isOpenNOOILPay
      this.isOpenOilPay = this.$store.state.stationData.oilModelShow
      this.isShowOil();          // 检查是否显示枪号、油品
      this.getCommonargs();      // 自助终端设备号
      this.getStationData();     // 油站信息
      this.version = this.$store.state.commonargs.appVersion;   // 版本号
      this.getconnet();          // 是否有网络
      this.$store.state.pushedLength = 0;
      this.getAd ()
      this.indexImg = this.$store.state.stationData.indexAdImg
    },
    mounted() {
      this.name = this.$store.state.stationData.name;
    },
    watch:{
      '$store.state.stationData.centralIP': function(val, oldVal) {
        this.name = this.$store.state.stationData.name;
      }
    }
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .carousel-box >>> .el-carousel {
    .el-carousel__container {
      height: 540px
    }
    .el-carousel__item h3 {
      color: #475669;
      font-size: 18px;
      opacity: 0.75;
      margin: 0;
    }
    .el-carousel__item:nth-child(2n) {
      background-color: #99a9bf;
    }
    .el-carousel__item:nth-child(2n+1) {
      background-color: #d3dce6;
    }
  }
  .cursor:hover{
    cursor: pointer
  }
  .hidden{
     display: none
  }
  .top-set{
    width 100%;
    height 150px;
    line-height 150px;
    display flex;
    justify-content space-between;
    color #888888;
    .logo-img {
      flex 1
    }
    .to-setting {
      position absolute
      right 0
    }
    span{
      padding-right 30px;
      font-size 24px;
    }
    .setting-img{
      width auto;
      margin 10px 30px -10px 0;
    }
  }
  .top {
    width 100%;
    height 540px;
    overflow hidden;
    .wh {
      width 100%;
      height auto;
    }
  }
  .content{
    height 1230px;
    background: url("../../../static/index/bg.jpg") no-repeat center center / 100% auto;
  }
  .index {
    width 100%;
    height auto;
    overflow hidden;
    padding 175px 95px 0 95px;
    .index-item {
      width 48%!important;
      height 320px;
      text-align center;
      overflow hidden;
      float left;
      &:nth-child(1), &:nth-child(3) {
        margin-right 4%
      }
      &:nth-child(1), &:nth-child(2) {
        margin-bottom 35px
      }
      .item-img {
        display block;
        width 100%;
        height 100%;
        div{
          width 100%;
          height 100%;
        }
      }
      .item-text {
        margin-top 220px;
        padding 40px;
        font-size 38px;
        color #333333
      }
    }
    .guide {
      background: url("../../../static/index/btn_qhxz_normal.png") no-repeat center center / 100% auto;
    }
    .guide:active  {
      background: url("../../../static/index/btn_qhxz_pressed.png") no-repeat center center / 100% auto;
    }
    .trades {
      background: url("../../../static/index/btn_ypxz_normal.png") no-repeat center center / 100% auto;
    }
    .trades:active {
      background: url("../../../static/index/btn_ypxz__pressed.png") no-repeat center center / 100% auto;
    }
    .download {
      background: url("../../../static/index/btn_ytkcz_normal.png") no-repeat center center / 100% auto;
    }
    .download:active {
      background: url("../../../static/index/btn_ytkcz_pressed.png") no-repeat center center / 100% auto;
    }
    .noneoil{
      background: url("../../../static/index/btn_spjs_normal.png") no-repeat center center / 100% auto;
    }
    .noneoil:active {
      background: url("../../../static/index/btn_spjs_pressed.png") no-repeat center center / 100% auto;
    }
  }
  .qrcode{
    width 100%;
    height 280px;
    display flex;
    justify-content space-between
    position absolute;
    bottom 0;
    clear both;
    .intro-info{
      line-height 40px;
      margin-top 185px;
      margin-left 95px;
      font-size 22px;
      color #494748;
    }
    .qrcode-img-box {
      position relative
      top: -31px
      display flex
      flex-direction column
      justify-content center
      align-items center

      .qrcode-img {
        width: 182px
        height: 190px
        background: url("../../../static/index/index-xiaochengxu.jpg") no-repeat
        -webkit-background-size: 100%
        background-size: 100%
      }
    }
    img{
      width auto;
      height auto;
      margin 0 95px 0 0;
    }

  }
  .connet_layout{
    margin-bottom 150px;
    text-align center;
    .right-oil-list-bg-text {
      color $color-text-l;
    }
    .right-oil-list-bg-img {
      margin-top 300px;
    }
    .btn-box {
      display: flex;
      position: relative;
      justify-content: center;
      align-items: center;
      width: 400px;
      height: 60px;
      font-size: 20px;
      background-color white;
      border-radius 15px;
      border 1px solid $bg-color;
      color $bg-color;
      margin 0 auto;
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
  .content-bg-img {
    position absolute;
    left: 0px;
    top 690px;
    width 100%;
    height 1230px;
    z-index -1;
  }
</style>
