<template>
  <div class="setting">
    <common-header  @goBack="goBack"><span class="title">设置</span></common-header>
    <div class="setting-content">
      <div class="setting-cont">
        <div class="setting-item">
          <div>
            <img src="static/images/icon_GasStationCoding.png"/>
            <span class="setting-span" >油站编码</span> 
          </div>
          <div>
            <input class="setting-input"  type="Number" value="" v-model="oilCode" placeholder="请输入油站编码" />
          </div>
        </div>
        <div class="setting-item">
          <div>
            <img src="static/images/icon_PortSettings.png"/>
            <span class="setting-span">端口设置</span>
          </div>
          <div>
            <input class="setting-input" type="Number" value="" v-model="oilPort" placeholder="请输入端口"/>
          </div>
        </div>
        <div class="setting-item">
          <div>
            <img src="static/images/icon_IPSetting.png"/>
            <span class="setting-span">IP设置</span>
          </div>
          <div>
            <input class="setting-input" value="" v-model="oilIP" placeholder="请输入IP"/>
          </div>
        </div>
        <!-- 隐藏终端号输入，默认固定值9166 -->
       <!--  <div class="setting-item">
          <div>
            <img src="static/images/icon_PortSettings.png"/>
            <span class="setting-span">非油品销售终端号</span>
          </div>
          <div>
            <input class="setting-input" type="Number" value="" v-model="noOilSaleNo" placeholder="请输入终端号"/>
          </div>
        </div> -->
      </div>
      <div class="setting-cont">
        <div class="setting-item">
          <img src="static/images/icon_NetworkSettings.png"/>
          <span class="setting-span">网络设置</span>
          <span class="setting-span setting-span-tips">已连接</span>
        </div>
        <div class="setting-item">
          <img src="static/images/icon_ScanCode.png"/>
          <span class="setting-span">扫码器</span>
          <span class="setting-span setting-span-tips">已连接</span>
        </div>
        <div v-if="isshow" class="setting-item">
          <img src="static/images/icon_CentralIP.png"/>
          <span class="setting-span">中控IP</span>
          <span class="setting-span setting-span-tips">{{this.zkInfo.IP}}</span>
        </div>
        <div v-if="isshow" class="setting-item">
          <img src="static/images/icon_ControlPort.png"/>
          <span class="setting-span">中控端口</span>
          <span class="setting-span setting-span-tips">{{this.zkInfo.Port}}</span>
        </div>
        <div class="setting-item">
          <img src="static/images/icon_printer.png"/>
          <span class="setting-span">打印机</span>
          <span class="setting-span setting-span-tips">已连接</span>
        </div>
      </div>
      <div class="setting-cont marbot">
        <div class="setting-item label-mar">
          <img src="static/images/icon_HomePageDisplay.png"/>
          <span class="setting-span">首页展示</span>
          <p class="select-label"> 
           <label class="cursor"><img v-if="isselectgun" src="static/images/btn_choose_selected.png"><img v-else  src="static/images/btn_choose_normal.png">枪号<input type="checkbox" v-model="isselectgun" value="枪号"/></label> 
           <label class="cursor"><img class="marleft1" v-if="isselectoil" src="static/images/btn_choose_selected.png"><img class="marleft1" v-else  src="static/images/btn_choose_normal.png">油品<input type="checkbox" v-model="isselectoil" value="油品"/></label> 
          </p> 
        </div>
      </div>
      
      <!--<div  :class="isselectgun?setting-item-layout:setting-item"  @click="isselect(1)">-->
        <!--<img src="static/images/icon_ControlPort.png"/>-->
        <!--<span class="setting-span">按枪号选择</span>-->
      <!--</div>-->
      <!--<div :class="isselectgun?setting-item-layout:setting-item" @click="isselect(2)">-->
        <!--<img src="static/images/icon_ControlPort.png"/>-->
        <!--<span class="setting-span">按油品选择</span>-->
      <!--</div>-->

      <!-- <div class="setting-item btn-box-diss setting-item-line" @click="isselect('1')">
        <span class="setting-span">按枪号选择</span>
        <img v-show="isselectgun" class="isselectimg" src="static/images/chose.png"/>
      </div>
      <div class="setting-item btn-box-diss setting-item-line" @click="isselect('2')">
        <span class="setting-span">按油品选择</span>
        <img v-show="isselectoil" class="isselectimg" src="static/images/chose.png"/>
      </div> -->
     
      <div class="setting-item setting-item-line btn-box-diss cursor">
        <span class="greencolor" v-preventReClick="800" @click.prevent="printerTest($event)">检测打印机是否正常运行</span>
      </div>
      <div class="setting-item setting-item-line btn-box-diss marleft cursor" >
        <span class="greencolor" v-preventReClick="800" @click.prevent="checkUpdate($event)">手动更新软件</span>
      </div>
    </div>
    <div class="setting-device-code">设备型号: {{device}}</div>
    <div class="bottom">
      <div class="bottom-btn btn-box-diss cursor" @click="goBack" >
        取消
      </div>
      <div class="bottom-btn  bottom-right btn-box-sure cursor" @click="saveEvent">
        提交
      </div>
    </div>
    <!--输入密码界面 -->
    <div v-if="showPassWord" class="dialog__wrapper">
      <div class="dialog">
        <div class="dialog-title">
          请输入密码
        </div>
        <div class="dialog-content">
          <input type="password" v-model="inputPwd" placeholder="请输入密码"/>
        </div>
        <div class="dialog-bottom">
          <div class="btn-box btn-box-diss cursor" @click="dissSetting">取消</div>
          <div class="btn-box btn-box-sure cursor" @click="sureEvent">确定</div>
        </div>
      </div>
    </div>
    <!-- 底部 -->
    <div class="footer">
      <Footer></Footer>
    </div>

  </div>
</template>

<script>
  export default {
    name: "setting",
    components: {
      Footer: require('./common/Footer.vue').default,
      CommonHeader: require('./common/CommonHeader').default
    },
    data() {
      return {
        // inputPwd:'gdsy1234',
        inputPwd:'',
        oilCode:'',
        oilPort:'',
        oilIP:'',
        noOilSaleNo:'9166',
        device:'',
        isshow:true,
        showPassWord: true,
        isselectgun: true, //默认选中枪号、油品
        isselectoil: true,
        zkInfo: {
          IP:'',
          Port:'',
          StationName:'',
        },
      }
    },
    methods: {
      // 保存按枪号、按油品选择
      isselect: function (idx) { console.log(idx)
       if (idx=='1'){
         this.isselectgun=!this.isselectgun;  console.log(this.isselectgun)
       }else {
         this.isselectoil=!this.isselectoil;
       }
        let jsonData = {};
        jsonData.type = 'storeitem'
        jsonData.key = "isselectgun";
        jsonData.value=""+this.isselectgun;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,(response) => {
        })

        let jsonData2 = {};
        jsonData2.type = 'storeitem'
        jsonData2.key = "isselectoil";
        jsonData2.value=""+this.isselectoil;
        this.$Bridgefunc.callBridge('phonebridge',jsonData2,(response) =>{
        })
      },
      goHome: function () {
        this.$router.go(-this.$store.state.pushedLength)
      },
      goBack: function () {
        this.$router.go(-this.$store.state.pushedLength)
      },
      dissSetting:function () {
        this.showPassWord=false
        this.goBack()
      },
      sureEvent: function () {
        if (this.inputPwd == '') {
          this.$Toast('请输入密码！')
        } else if (this.inputPwd == 'gdsy1234') {
          this.showPassWord = false
        } else {
          this.$Toast('请输入正确的密码！')
        }
      },
      saveEvent: function () {
        if (this.oilCode == '') {
          this.$Toast('油站编码不能为空！')
        }else if (this.oilIP==''){
          this.$Toast('油站IP不能为空！')
        }else if (this.oilPort==''){
          this.$Toast('油站端口不能为空！') 
        }else if (this.noOilSaleNo=='' ){
          this.$Toast('非油品销售终端号不能为空！') 
        }else if (this.noOilSaleNo.length>4){
          this.$Toast('非油品销售终端号不能大于四位数！') 
        }else { 
          this.getZhongKongInfo();
        
        }
      },
      setStationData:function (data) {
        let jsonData = {};
        jsonData.type = 'storeitem'
        jsonData.key = "stationdata";
        jsonData.value=''+encodeURIComponent(data);
        let _this = this
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
        })
      },
      // 自助终端设备号
      getCommonargs:function () {
        let jsonData = {};
        jsonData.type = 'commonargs'
        let _this = this
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) { 
          if (response) {
            // this.setLocalCommonargs(response);
            _this.$store.state.commonargs=JSON.parse(response);
            // _this.$store.state.commonargs.deviceId='V101164800586';
          }
        })
      },
      printerTest: function (event) {
        if (event.target.disabled) {
          this.$Toast('点击太频繁了') 
          return
        }
        let jsonData = {};
        jsonData.type = 'printticket'
        let pdata = {
          "ID":"打印测试",
          "WorkDay":"2018-03-28T00:00:00",
          "Shift":3,
          "GunNo":6,
          "GasCode":"000603040060206059",
          "GasName":"92号汽油",
          "Qty":44.32,
          "Price":6.77,
          "Amount":300.05,
          "HasPayAmount":300.00,
          "DisAmount":0.05,
          "POSTTC":70389,
          "C_PSAMASN":"2018-06-12T14:30:00",
          "CardNo":"01000414400000336579"
        }
        pdata.StationName = '打印测试加油站'
        pdata.stationAddress = '打印测试加油站地址'
        pdata.IsPrintInvoice = '0'
        pdata.QRCodeUrl = '123456789012345678'
        jsonData.printcontent = pdata
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
          if (response) {

          }
        })
      },
      //获取更新信息
      checkUpdate (event) {
        if (event.target.disabled) {
         this.$Toast('点击太频繁了') 
          return
        }
        let url = 'http://'+ this.oilIP+':'+ this.oilPort+'/qrcodeapi/webapi/bigScreen/getVerticalScreenAppVersion';
        let params = new FormData()
        let params1 = {
          ouCode: '1000030',
          isTest: '1'
        }
        params.append('jsonData', JSON.stringify(params1))

        this.$Loading.open('更新中');
        this.$http.post(url, params,{ headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }}).then(res => {
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
          this.$Toast("请求数据失败!请您检查设备是否已连接网络！")
        })

      },
      //获取中控ip和端口
      getZhongKongInfo: function () {
        let url = 'http://'+ this.oilIP+':'+ this.oilPort+'/'+this.$store.state.stationData.centerUrlTest+'/api/Terminal/GetIPAndPort';
        let params1 = {
        }
        let argsStr = JSON.stringify(params1)
        let sign = this.$sign.signArgs(argsStr,0)
        //let params = "Args=" + argsStr + '&StationCode=' +this.oilCode + "&DeviceCode=" + this.$store.state.commonargs.deviceId + "&Sign=" + sign
        let params = {
          "Args":argsStr,
          "StationCode": this.oilCode,
          "DeviceCode":this.$store.state.commonargs.deviceId,
          "Sign":sign
        }
 
        this.$Loading.open('提交中');  
        this.$http.post(url, params).then(res => {
          this.$Loading.close();
          let data = res.data; console.log('GetIPAndPort:',data)
          if (data.ResultCode == 1) {
            this.zkInfo = JSON.parse(data.ResultObj)
            this.$store.state.stationData.IP=this.oilIP;
            this.$store.state.stationData.port=this.oilPort;
            this.$store.state.stationData.code=this.oilCode;
            this.$store.state.stationData.centralIP=this.zkInfo.IP;
            this.$store.state.stationData.centralPort=this.zkInfo.Port;
            this.$store.state.stationData.name=this.zkInfo.StationName;

            this.$store.state.isSelectgun= this.isselectgun; // 将枪号、油品是否显示保存
            this.$store.state.isSelectoil= this.isselectoil;  

            console.log(this.$store.state.stationData.name);
            this.setStationData(JSON.stringify(this.$store.state.stationData));
            this.SetPosNo(this.noOilSaleNo , this.$store.state.commonargs.deviceId)  // 设置自助终端销售终端号
            // this.goHome();
          } else {
           this.$Toast(""+data.ErrMsg)
          }
        }, error => {
          this.$Loading.close();
          this.$Toast("请求数据失败!请您检查设备是否已连接网络！")
        })
      },
      //获取中控ip和端口
      getZhongKongOildName: function () {
        if (this.$store.state.stationData.code == ''|| this.$store.state.stationData.IP==''||this.$store.state.stationData.port==''||this.$store.state.commonargs.deviceId=='') {
          return
        }
        let url = 'http://'+ this.$store.state.stationData.IP+':'+ this.$store.state.stationData.port+'/'+this.$store.state.stationData.centerUrlTest+'/api/Terminal/GetIPAndPort';
        let params1 = {
        }
        let argsStr = JSON.stringify(params1)
        let sign = this.$sign.signArgs(argsStr,0)
        //let params = "Args=" + argsStr + '&StationCode=' +this.$store.state.stationData.code + "&DeviceCode=" + this.$store.state.commonargs.deviceId + "&Sign=" + sign
        let params = {
          "Args":argsStr,
          "StationCode": this.$store.state.stationData.code,
          "DeviceCode": this.$store.state.commonargs.deviceId,
          "Sign":sign
        }

        this.$Loading.open();
        this.$http.post(url, params).then(res => { console.log('GetIPAndPort:'+JSON.stringify(res.data))
          this.$Loading.close();
          let data = res.data;
          if (data.ResultCode == 1) {
            this.zkInfo = JSON.parse(data.ResultObj)
            this.$store.state.stationData.name=this.zkInfo.StationName;
          } else {
            this.$Toast(""+data.ErrMsg)
          }
        }, error => {
          this.$Loading.close();
        })
      },

      // new add on 2019.07.20
      //设置自助终端销售终端号
      SetPosNo (orgCode,deviceId) {
        let _this=this;

        let url='http://'+ this.$store.state.stationData.IP2+':'+ this.$store.state.stationData.port2+'/sys/api/SelfServiceSystem/SetPosNo'
        var info = { 
          // "OrgCode": orgCode,
          "OrgCode": '33251219',  // 非油测试环境33251219
          "DeviceId": deviceId,
          // "PosNo": '68',  // 测试固定销售号
          "PosNo": _this.noOilSaleNo
        };  console.log(JSON.stringify(info))
        let sign = this.$sign.signArgs(JSON.stringify(info),1)
        var params = { 
          "JsonData": JSON.stringify(info),     
          "Sign": sign 
        };  
        this.$http.post(url, params).then(res => {  
          this.showmask = false   
          let data=res.data;    console.log('SetPosNo:',data)
          if (data.ErrorCode == 0) {  
            let rs= JSON.parse(data.Data);  
            _this.GetSysCurrentInfo();  // 获取终端信息
            // _this.$store.state.sysCurrentInfo = JSON.parse(data.Data);  // 终端号信息      
            _this.goHome();  // 返回首页
          } else{  // 其他错误提示
            this.$Toast(data.Message)
          }
        }, error => {
          this.$Loading.close();
          this.$Toast("请求数据失败!请您检查设备是否已连接网络！")
        })
      },
     
      //获取终端销售号
      GetSysCurrentInfo() {
        let _this = this;
        let deviceId = this.$store.state.commonargs.deviceId;
        if(deviceId){
          let url = 'http://'+ this.$store.state.stationData.IP2+':'+ this.$store.state.stationData.port2+'/sys/api/SelfServiceSystem/GetSysCurrentInfo';
          // getSign提交签名的是需要post的参数
          let info = {
            // OrgCode: _this.$store.state.stationData.code,
            OrgCode: "33251219",
            DeviceId: _this.$store.state.commonargs.deviceId,
          };
          let sign = this.$sign.signArgs(JSON.stringify(info),1)
          let params = { "JsonData": JSON.stringify(info), "Sign": sign };

          this.$http.post(url, params).then(res => {  //  console.log('GetSysCurrentInfo:'+JSON.stringify(res.data))
            let rs = res.data;
            if (rs.ErrorCode === 0) {
              let rss = JSON.parse(rs.Data);
              _this.$store.state.sysCurrentInfo = rss;  // 终端号信息
              _this.noOilSaleNo = rss.PosNo;
            } else {
              // _this.$Toast(rs.Message)
            }
          }, error => {
            this.$Toast("请求数据失败!请您检查设备是否已连接网络！")
          })
        }
      },

      
    },
    created() { console.log('stationData:'+JSON.stringify(this.$store.state.stationData))
      this.getCommonargs();

      this.device=this.$store.state.commonargs.deviceId;
      this.oilIP=this.$store.state.stationData.IP;
      this.oilPort=this.$store.state.stationData.port;
      this.oilCode=this.$store.state.stationData.code;
      this.zkInfo.Port=this.$store.state.stationData.centralPort;
      this.zkInfo.IP=this.$store.state.stationData.centralIP;
      this.isselectgun=this.$store.state.isSelectgun;
      this.isselectoil=this.$store.state.isSelectoil;
      this.getZhongKongOildName();

      this.GetSysCurrentInfo()

    },
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .cursor:hover{
    cursor: pointer
  }
  .setting {
    width 100%;
    height 100%;
    background-color $setting-top-bg;
    .setting-content {
      width 100%;
      padding 12px 30px;
      overflow hidden;
      font-size 27px;
      .setting-cont{
        width 100%;
        height auto;
        overflow hidden;
        margin-top 36px;
        background #ffffff;
        border-radius 16px;
        .setting-item:nth-child(even){
          margin-left 2%;
        }
        .label-mar{ 
          padding-right 0!important
        }
        .select-label{
          flex 1
          color #333333
          margin-left 20px
        }
        .select-label img{
           width 40px;
           height 40px;
           margin -5px 10px -10px 0
        }
        .select-label input{
          display none
        }
      }
      
      .setting-item {
        position relative;
        /* width 500px; */
        width 49%;
        height 100px;
        float left;
        background-color white;
        margin 10px 0;
        padding 0 20px;
        border-radius 10px;
        align-items center;
        display flex;
        justify-content space-between
        div{
          align-items center;
          display flex;
        }
        .isselectimg{
          position absolute;
          top 0;
          right 0;
          width 50px;
          height 50px;
        }
        .setting-span {
          color $color;
          margin-left 20px;
          margin-right 0px;
        }
        .setting-span-tips {
          color $color-text-l;
          flex 1;
          text-align right;
        }
        .setting-input {
          /*flex 1;*/
          width 240px;
          height 60px;
          margin-left 20px;
          margin-right 0px;
          text-align right;
          font-size 27px;
          border 1px solid #D3D3D3;
          border-radius 10px;
          padding 0 20px

        }
                 
      }
      
      .setting-item-line {
        border 1px solid $bg-color;
        align-items center;
        display flex;
        justify-content center;
        color #39b240!important;
        font-size 36px
        margin-top 24px
        background $setting-top-bg
      }
      .setting-item-layout {
        border 1px solid $setting-top-bg;
        background-color $bg-color-pressed;
        color white;
      }
      .setting-item-layout2 {
        border 1px solid $setting-top-bg;
        background-color white;
        color $color-text-l;
      }
      .btn-box-diss:active{
        background-color $bg-color-setting-pressed;
        border 1px solid $bg-color-pressed;
      }
    }
    .setting-device-code {
      width 100%;
      margin-top 5px;
      text-align right;
      padding-right 30px;
      color $color-text-c;
      font-size $font-size-small-x;
    }
    .bottom {
      width 100%;
      font-size $font-size-large
      overflow hidden;
      margin 120px auto;
      display flex
      justify-content center
      .bottom-btn {
        width 38%;
        height 120px
        line-height 120px
        color $bg-color;
        border-radius 16px;
        margin 0 1%;
        text-align center
        border 1px solid $bg-color;
        font-size 40px;
        
      }
      .bottom-right {
        color white;
        background-color $bg-color
      }
      .btn-box-diss:active{
        background-color white;
        border 1px solid $bg-color-pressed;
        color $bg-color-pressed;
      }
      .btn-box-sure:active {
        background-color $bg-color-pressed;
        color white;
      }
    }
    .dialog__wrapper {
      width: 100%
      height: 100%
      max-width: 1080px
      margin: 0 auto
      position: fixed;
      /* top: 808px; */
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1000;
      background-color: rgba(0, 0, 0, 0.6);
      .dialog {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 64%;
        padding-top: 135px;
        background-color white
        border-radius 15px;
        .dialog-title {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 60px;
          position: absolute;
          width: 100%;
          top: 5%;
          z-index: 10;
          font-size: $font-size-medium;
        }
        .dialog-content {
          width 100%;
          display: flex;
          justify-content: center;
          font-size $font-size-small;
          color $color-text-l;
          input {
            width 100%;
            height 70px;
            margin 0 60px;
            margin-top 10px;
            margin-bottom 60px;
            padding-left 10px;
            border 1px solid $color-text-l;
          }
        }
        .printing-div {
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            width 200px;
          }
        }
      }
      .dialog-bottom {
        display: flex;
        justify-content: space-around;
        padding-bottom: 40px;
        .btn-box {
          display: flex;
          position: relative;
          justify-content: center;
          align-items: center;
          width: 200px;
          height: 60px;
          font-size: 20px;
          background-color white;
          border-radius 15px;
          border 1px solid $bg-color;
          color $bg-color;
        }
        .btn-box-diss{
          background-color white;
          border 1px solid $bg-color;
          color $bg-color;
        }
        .btn-box-diss:active{
          background-color white;
          border 1px solid $bg-color-pressed;
          color $bg-color-pressed;
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
    }
    .marbot{
       margin-bottom 35px
    }
    .marleft{
       margin-left 2%!important
    }
    .marleft1{
       margin-left 50px!important
    }
    .greencolor{
       color $bg-color
    }

  }
</style>
