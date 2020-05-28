<template>
  <div class="bsapp">
   <!--  
    <div class="top">
      <img class="wh" src="static/index/img_bg.png"/>
    </div> -->
   <!--  <div class="time">
      <div class="content-left"></div>
      <div class="content-text content-text1">{{name}}</div>
      <div class="content-text content-text2">版本号:{{version}}</div>
      <img class="time-content-img" src="static/index/setting.png" @click="goSetting()"></img>
    </div> -->
    <div v-show="IsConnectShow" class="content">
      <router-view/>
      <!-- <img class="content-bg-img" src="static/index/home_bg.png"/> -->
    </div>
    <!-- <div v-show="!IsConnectShow" class="content">
      <img class="content-bg-img" src="static/index/home_bg.png"/>
      <div class="connet_layout">
        <img class="right-oil-list-bg-img" src="static/images/defaultPage_NetworkError.png"/>
        <div class="right-oil-list-bg-text btn-box btn-box-sure" @click="getconnet()">重新连接</div>
      </div>
    </div> -->
  </div>
</template>

<script>
  export default {
    name: "bs",
    components: {},
    data() {
      return {
        stationdata:{},
        name:'',
        version:'',
        IsConnectShow:true,
        zkInfo: {
          IP:'',
          Port:'',
          StationName:'',
        },
      }
    },
    methods: {
      // goSetting:function () {
      //   let jsonData = {};
      //   jsonData.type = 'closescan'
      //   this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
      //   })
      //   this.$store.state.pushedLength ++
      //   this.$router.push({
      //     path: 'setting',
      //   })
      // },
      //推送这杯状态
      getSendDeviceStateInfo:function () {
        let url = 'http://'+ this.$store.state.stationData.IP+':'+ this.$store.state.stationData.port+'/'+this.$store.state.stationData.centerUrlTest+'/api/Terminal/SendDeviceStateInfo';
        let params1 = {
          DeviceIP: this.$store.state.commonargs.IpAddress ,
          DeviceVersion:this.$store.state.commonargs.appVersion,
          State:1,
          DeviceLogDate:this.$util.dateFtt("yyyy-MM-dd hh:mm:ss", new Date()),
        }
        let argsStr = JSON.stringify(params1)
        let sign = this.$sign.signArgs(argsStr)
        let params = "Args=" + argsStr + '&StationCode=' +this.$store.state.stationData.code + "&DeviceCode=" + this.$store.state.commonargs.deviceId + "&Sign=" + sign
        this.$http.post(url, params,{ headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }}).then(res => {
          let data = res.data;
          if (data.ResultCode == 1) {
          } else {
            // _this.$Toast("请求数据失败!请稍后重试")
          }
        }, error => {
        })
      },
      getCommonargs:function () {
        let jsonData = {};
        jsonData.type = 'commonargs'
        let _this = this
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
          if (response) {
            // this.setLocalCommonargs(response);
            _this.$store.state.commonargs=JSON.parse(response);
            _this.version= _this.$store.state.commonargs.appVersion;
          }
        })
      },
      getStationData:function () {
        let jsonData = {};
        jsonData.type = 'getitem'
        jsonData.key = "stationdata";
        let _this = this
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
          if (response.length>0) {
            _this.$store.state.stationData=JSON.parse( decodeURIComponent(response));
            _this.name=_this.$store.state.stationData.name;
            _this.getSendDeviceStateInfo();
            _this.getZhongKongInfo();
          }
        })
      },
      getconnet:function(){
        let _this = this;
        _this.$Bridgefunc.registeBridge('getConnectStatus',function (response) {
          if (response==='0') {
            _this.IsConnectShow=true;
          } else {
            _this.IsConnectShow=false;
          }
        })
      },
      //获取中控ip和端口
      getZhongKongInfo: function () {
        // if (this.$store.state.stationData.code == ''|| this.$store.state.stationData.IP==''||this.$store.state.stationData.port==''||this.$store.state.commonargs.deviceId=='') {
        //     return
        // }
        console.log("----------获取名称-------->>>>>");
        let url = 'http://'+ this.$store.state.stationData.IP+':'+ this.$store.state.stationData.port+'/'+this.$store.state.stationData.centerUrlTest+'/api/Terminal/GetIPAndPort';
        let params1 = {
        }
        console.log("----------获取名称-------->>>>>"+url);
        let argsStr = JSON.stringify(params1)
        let sign = this.$sign.signArgs(argsStr)
        let params = "Args=" + argsStr + '&StationCode=' +this.$store.state.stationData.code + "&DeviceCode=" + this.$store.state.commonargs.deviceId + "&Sign=" + sign
        // this.$Loading.open();
        this.$http.post(url, params,{ headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }}).then(res => {
          this.$Loading.close();
          let data = res.data;
          console.log("----------访问返回-------->>>>>");
          console.log(data);
          if (data.ResultCode == 1) {
            this.zkInfo = JSON.parse(data.ResultObj)
            this.$store.state.stationData.name=this.zkInfo.StationName;
            this.name=this.$store.state.stationData.name;
            console.log("----------打印名称-------->>>>>");
            console.log(this.name);
          } else {
            console.log("----------打印错误-------->>>>>");
            console.log(data.ErrMsg);
            // this.$Toast(""+data.ErrMsg)
          }
        }, error => {
          // this.$Loading.close();
        })
      },
    },
    created(){
      this.getCommonargs();
      this.getStationData();
      this.version= this.$store.state.commonargs.appVersion;
      this.getconnet();
    },
    mounted() {
      this.name=this.$store.state.stationData.name;
    },
    watch:{
      '$store.state.stationData.centralIP': function(val, oldVal) {
        // this.getStationData();
        this.name=this.$store.state.stationData.name;
      }
    }

  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .bsapp {
    width 100%;
    max-width 1080px;
    height 100%;
    position relative;
    /* overflow hidden */
    font-size $font-size-medium-x;
    margin 0 auto;
    
    .top {
      /* width 1080px; */
      /* height 808px; */
      width 100%;
      height 540px
      .wh {
        width 100%;
        height 100%;
      }
    }
    .time {
      width 1080px;
      height 84px;
      background: url("../../static/index/navbar.png") no-repeat center center / 100% 100%;
      display flex;
      align-items center;
      color white;

      .content-left {
        flex 1;
      }
      .content-text1 {
        margin-right 25px;
        font-size $font-size-medium;
      }
      .content-text2 {
        margin-right 35px;
        font-size $font-size-small;
      }
      .time-content-img {
        width 32px;
        height 32px;
        margin-right 25px;
      }
    }

    .content {
      position relative;
      //width 1080px;
      //height 1028px;
      //text-align center;
      //justify-content: center;
      //align-items: center;
      //display flex;
      //background: url("../../../static/index/home_bg.png") no-repeat center center / 100% 100%;
      height 100%
      .connet_layout{
        margin-bottom 150px;
        .right-oil-list-bg-text {
          color $color-text-l;
        }
        .right-oil-list-bg-img {
          margin-right 50px;
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
        top 0px;
        width 100%;
        /* height 1028px; */
        height 1230px;
        z-index -1;
      }
    }
    .go-top {
      position fixed;
      z-index 10;
    }

  }

</style>
