<template>
  <div id="footer">
    <span>{{$store.state.stationData.name}}</span> <span>版本号：{{$store.state.commonargs.appVersion}}</span>
  </div>
</template>
<script>
  export default {
    name: 'Footer',
    data(){
      return{
        footerInfo: '',
        sendUerId: '', // 底部接口返回的登陆账号
        cshName: '',  // 当前收款员名称
      }
    },
    created() {
      //this.GetSysCurrentInfo();
    },
    methods: {
      // 底部footer信息
      GetSysCurrentInfo() {
        let _this = this;
        let deviceId = this.$winx.createObj(__device).getDeviceId();
        if(deviceId){
          let url = `http://${this.$store.state.stationData.IP2}:21862/sys/api/SelfServiceSystem/GetSysCurrentInfo`;
          let params1 = {
            OrgCode: _this.$store.state.stationData.stationCode,
            DeviceId: _this.$store.state.stationData.deviceCode,
          };
          let argsStr = JSON.stringify(params1);
          let sign = this.$sign.signArgs(argsStr,0);
          let params = {
            "JsonData": argsStr,
            "Sign": sign
          }
          this.$http.post(url, params).then(
            res => {
              let rs = res.data;
              console.log('rs',rs)
              if (rs.ErrorCode === 0) {
                _this.footerInfo = JSON.parse(rs.Data);
                this.sendUerId = _this.footerInfo.ClsCloudUserId;
                this.cshName = _this.footerInfo.CshName;
                this.$emit('getUserIdNum',this.sendUerId);   // 当前账号
                this.$emit('getOperatorName',_this.footerInfo);
              } else {
                _this.$Toast(rs.Message)
              }
          }, error => {
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

  }
</script>
<style lang="stylus" scoped>
  #footer{
    width: 100%;
    height: 50px;
    line-height: 50px;
    background: #ffffff;
    color: #666666;
    text-align: center;
    font-size: 22px;
    position: absolute
    bottom: 0
    z-index: 1999
    span{
      padding: 0 15px
    }
  }
</style>
