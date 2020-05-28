<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        clicktime: 0,
        marktime: 0,
        hourMark: 0,
        myInterval: null,
      }
    },
    methods: {
      timerEvent: function () {
        let d = new Date()
        let h = d.getHours();
        // 几分钟后弹出广告页面
        if (this.$route.path == '/bs/index') {
          this.clicktime = d.getTime()
          // 3-5点 apk更新监测和自动更新
          if (h == 3 || h == 4) {
          //   let arr = this.appVersion.split('.')
          //   if (arr.length == 3) {
          //     if (arr[0] > 1 || arr[1] > 7 || arr[2] > 4) {
          this.checkUpdate();
          }
          // }
          // }
          return;
        }
        // else {
        //   // if (d.getTime() - this.clicktime > this.config.adInterval * 1000) {
        //     this.clicktime = d.getTime()
        //     // 3-5点 apk更新监测和自动更新
        //     // if (h == 3 || h == 4) {
        //       let arr = this.appVersion.split('.')
        //       if (arr.length == 3) {
        //         if (arr[0] > 1 || arr[1] > 7 || arr[2] > 4) {
        //           this.checkUpdate();
        //         }
        //       }
        //     // }
        //   // }
        // }
      },
      //获取更新信息
      checkUpdate: function () {//
        if(this.$store.state.stationData.IP){
          let url = 'http://'+ this.$store.state.stationData.IP+':'+this.$store.state.stationData.port+'/qrcodeapi/webapi/bigScreen/getVerticalScreenAppVersion';
          let params = new FormData()
          let params1 = {
            ouCode: '1000030',
            isTest: '1'
          }
          params.append('jsonData', JSON.stringify(params1))
          this.$http.post(url, params,{ headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }}).then(res => {
      /*      if (this.$store.state.stationData.indexAdImg) {
              this.getAdimg ()
            }*/
            let data = res.data;
            this.$Loading.close();
            let jsonData = {};
            jsonData.type = 'updateapp'
            jsonData.updatecontent =data;
            this.$Bridgefunc.callBridge('phonebridge', jsonData, function (response) {
              this.$Toast("" + response)
            })
          }, error => {
            this.$Loading.close();
          })
        }else {

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
      }
    },
    mounted() {
      // this.checkUpdate();
      let nowTime = (new Date()).getTime()
      this.clicktime = nowTime
      if (this.myInterval) {
        clearInterval(this.myInterval)
      }
      this.myInterval = setInterval(this.timerEvent, 20000);
    },
    beforeDestroy() {
      if (this.myInterval) {
        clearInterval(this.myInterval)
      }
    },
    watch: {
      '$route' (to, from) { // 监听路由,区分是否显示菜单按钮
        if (from.name === '设置' && this.$store.state.stationData.code) {
          console.log(113)
          this.getAdimg()
        }
      }
    }
  }
</script>

<style lang="stylus" type="text/stylus">
  @font-face{
    font-family: 'myFont';
    src: url('/static/fonts/PingFang SC Medium.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  body,html{
    font-family: myFont, sans-serif;
  }
  #app {
    width: 100%;
    max-width: 1080px
    /* height: 100% */
    height: 1920px;
    margin: 0 auto;
    /*font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

  }
</style>
