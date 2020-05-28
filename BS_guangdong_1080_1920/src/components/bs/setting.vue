<template>
  <div class="setting">
    <common-header  @goBack="goBack"><span class="title">设置</span></common-header>
    <div class="setting-content">
      <div class="setting-cont">
        <div class="setting-item">
          <div>
            <img src="../../../static/images/icon_GasStationCoding.png" alt=""/>
            <span class="setting-span">油站编码</span>
          </div>
          <div>
            <input class="setting-input"  type="Number" value="" v-model="oilCode" placeholder="请输入油站编码" />
          </div>
        </div>
      </div>
      <!-- 非油 start -->
      <div class="setting-cont" v-if="noneOilModelShow">
        <div class="setting-item">
          <div>
            <img src="../../../static/images/icon_IPSetting.png" alt=""/>
            <span class="setting-span">非油IP</span>
          </div>
          <div>
            <span class="setting-span setting-span-tips">{{noOilIP}}</span>
          </div>
        </div>
        <div class="setting-item">
          <div>
            <img src="../../../static/images/icon_PortSettings.png" alt=""/>
            <span class="setting-span">非油端口</span>
          </div>
          <div>
            <span class="setting-span setting-span-tips">21862</span>
          </div>
        </div>
        <div class="setting-item">
          <img src="../../../static/images/icon_PortSettings.png" alt=""/>
          <span class="setting-span">收银号</span>
          <span class="setting-span setting-span-tips">{{this.noOilSaleNo}}</span>
        </div>
      </div>
      <!-- 非油 end -->
      <div class="setting-cont">
        <div class="setting-item">
          <img src="../../../static/images/icon_NetworkSettings.png" alt=""/>
          <span class="setting-span">网络设置</span>
          <span class="setting-span setting-span-tips">已连接</span>
        </div>
        <div class="setting-item">
          <img src="../../../static/images/icon_ScanCode.png" alt=""/>
          <span class="setting-span">扫码器</span>
          <span class="setting-span setting-span-tips">已连接</span>
        </div>
        <div v-if="oilModelShow" class="setting-item">
          <img src="../../../static/images/icon_CentralIP.png" alt=""/>
          <span class="setting-span">中控IP</span>
          <span class="setting-span setting-span-tips">{{this.zkInfo.IP}}</span>
        </div>
        <div v-if="oilModelShow" class="setting-item">
          <img src="../../../static/images/icon_ControlPort.png" alt=""/>
          <span class="setting-span">中控端口</span>
          <span class="setting-span setting-span-tips">{{this.zkInfo.Port}}</span>
        </div>
        <div class="setting-item">
          <img src="../../../static/images/icon_printer.png" alt=""/>
          <span class="setting-span">打印机</span>
          <span class="setting-span setting-span-tips">已连接</span>
        </div>
      </div>
      <div class="setting-cont marbot" v-if="oilModelShow">
        <div class="setting-item label-mar">
          <img src="../../../static/images/icon_HomePageDisplay.png" alt=""/>
          <span class="setting-span">首页展示</span>
          <p class="select-label">
            <label class="cursor">
              <img v-if="isselectgun == '1'" src="../../../static/images/btn_choose_selected.png" alt="" />
              <img v-else  src="../../../static/images/btn_choose_normal.png" alt=""/>枪号
              <input type="checkbox" v-model="isselectgun" value="枪号"/>
            </label>
            <label class="cursor">
              <img class="marleft1" v-if="isselectoil == '1'" src="../../../static/images/btn_choose_selected.png" alt="">
              <img class="marleft1" v-else  src="../../../static/images/btn_choose_normal.png" alt="">油品
              <input type="checkbox" v-model="isselectoil" value="油品"/>
            </label>
          </p>
        </div>
      </div>
      <div class="setting-item setting-item-line btn-box-diss cursor">
        <span class="greencolor" v-preventReClick="800" @click.prevent="printerTest($event)">检测打印机是否正常运行</span>
      </div>
      <div class="setting-item setting-item-line btn-box-diss marleft cursor" v-preventReClick="800" @click.prevent="checkUpdate($event)">
        <span class="greencolor">手动更新软件</span>
      </div>
    </div>
    <div class="setting-device-code">设备型号: {{device}}</div>
    <div class="bottom">
      <div class="bottom-btn btn-box-diss cursor" @click="goBack" >取消</div>
      <div class="bottom-btn  bottom-right btn-box-sure cursor" @click="saveEvent">提交</div>
    </div>
    <!--输入密码界面 -->
    <div v-if="showPassWord" class="dialog__wrapper">
      <div class="dialog">
        <div class="dialog-title">请输入密码</div>
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
        inputPwd:'',
        oilCode:'',
        oilPort:'',
        oilIP:'',
        noOilIP:'',
        noOilSaleNo:'9166',
        device:'',
        oilModelShow: true, // 是否显示油品模块
        showPassWord: true,
        isselectgun: '1',     // 默认选中枪号、油品
        isselectoil: '1',
        zkInfo: {
          IP:'',
          Port:'',
          StationName:'',
        },
        isOpenNOOILPay: '0',  // 是否显示非油，1是，0否
        isPosNo: false,       // 是否设置终端号，false否，true是
        noneOilModelShow: true, // 是否显示非油模块
      }
    },
    methods: {
      // 保存按枪号、按油品选择(原生保存，停用)
      isselect (idx) {
        if (idx === '1'){
          this.isselectgun = !this.isselectgun;
        }else {
          this.isselectoil=!this.isselectoil;
        }
        let jsonData = {};
        jsonData.type = 'storeitem';
        jsonData.key = "isselectgun";
        jsonData.value = ""+this.isselectgun;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,(response) => {
        });
        let jsonData2 = {};
        jsonData2.type = 'storeitem';
        jsonData2.key = "isselectoil";
        jsonData2.value = ""+this.isselectoil;
        this.$Bridgefunc.callBridge('phonebridge',jsonData2,(response) =>{
        })
      },
      goHome () {
        this.$router.go(-this.$store.state.pushedLength)
      },
      goBack () {
        this.$router.go(-this.$store.state.pushedLength)
      },
      dissSetting () {
        this.showPassWord = false;
        this.goBack()
      },
      sureEvent () {
        if (this.inputPwd === '') {
          this.$Toast('请输入密码！')
        } else if (this.inputPwd === 'gdsy1234') {
          this.showPassWord = false
        } else {
          this.$Toast('请输入正确的密码！')
        }
      },
      // 点击提交
      saveEvent () {
        if (this.oilCode === '') {
          this.$Toast('油站编码不能为空！')
        }else {
          this.getZhongKongInfo();
        }
      },
      setStationData (data) {
        let jsonData = {};
        jsonData.type = 'storeitem';
        jsonData.key = "stationdata";
        jsonData.value=''+encodeURIComponent(data);
        let _this = this;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
        })
      },
      // 自助终端设备号
      getCommonargs () {
        let jsonData = {};
        jsonData.type = 'commonargs';
        let _this = this;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
          if (response) {
            _this.$store.state.commonargs = JSON.parse(response);
          }
        })
      },
      printerTest (event) {
        if (event.target.disabled) {
          this.$Toast('点击太频繁了');
          return
        }
        let jsonData = {};
        jsonData.type = 'printticket';
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
        };
        pdata.StationName = '打印测试加油站';
        pdata.stationAddress = '打印测试加油站地址';
        pdata.IsPrintInvoice = '0';
        pdata.QRCodeUrl = '123456789012345678';
        jsonData.printcontent = pdata;
        this.$Bridgefunc.callBridge('phonebridge',jsonData,function (response) {
          if (response) {
          }
        })
      },
      // 获取更新信息
      checkUpdate (event) {
        this.$Toast('正在获取更新软件信息，请耐心等待！')
        if (event.target.disabled) {
          this.$Toast('点击太频繁了');
          return
        }
        let url = 'http://'+ this.oilIP+':'+ this.oilPort+'/qrcodeapi/webapi/bigScreen/getVerticalScreenAppVersion';
        let params = new FormData();
        let params1 = {
          ouCode: '1000030',
          isTest: '1'
        };
        params.append('jsonData', JSON.stringify(params1));
        this.$Loading.open('更新中...');
        this.$http.post(url, params,{ headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }}).then(res => {
          let data = res.data;
          this.$Loading.close();
          let jsonData = {};
          jsonData.type = 'updateapp';
          jsonData.updatecontent =data;
          this.$Bridgefunc.callBridge('phonebridge', jsonData, function (response) {
            this.$Toast("" + response)
          })
        }, error => {
          this.$Loading.close();
          console.log('获取更新信息接口出错', 'url=>',url, 'error=>', error)
          this.$Toast("请求数据失败!请您检查设备是否已连接网络！")
          this.writeLog (url)
        })
      },
      // 获取中控主控机IP和端口号接口(走云平台接口)
      getZhongKongInfo () {
        let _this = this
        let url;
        if (_this.$store.state.isTest) {
          url = `http://${_this.oilIP}:${_this.oilPort}/HandHeldPosApi/api/Terminal/GetIPAndPort`;
        } else {
          url = `http://10.191.8.110/HandHeldPosApi/api/Terminal/GetIPAndPort`;
        }
        let params1 = {
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "Args": argsStr,
          "StationCode": _this.oilCode,
          "DeviceCode": _this.$store.state.commonargs.deviceId,
          "Sign": sign
        };
        _this.$Loading.open('提交中');
        _this.$http.post(url, params).then(res => {
          _this.$Loading.close();
          let data = res.data;
          if (data.ResultCode == 1) {
            _this.zkInfo = JSON.parse(data.ResultObj)
            _this.$store.state.stationData.code = _this.oilCode;
            _this.$store.state.stationData.centralIP = _this.zkInfo.IP;
            _this.$store.state.stationData.centralPort = _this.zkInfo.Port;
            _this.$store.state.stationData.name = _this.zkInfo.StationName;
            _this.noOilIP = _this.zkInfo.NoilIP;
            _this.$store.state.stationData.IP2 = _this.zkInfo.NoilIP;
            let orgcodeDataArr = [
              '33253700', '33251266', '33253206', '33250893', '33251647', '33251290', '33253170', '33250795', '33251065', '33251225', '33251118', '33251687', '33251676', '33250890', '33253255', '33251289', '33250789', '33253772', '33253126', '33251516', '33253236', '33253139', '33253725', '33251706', '33253768', '33250743', '33253076', '33250267', '33251244', '33253654', '33250906', '33250365', '33250790', '33251639', '33253237', '33251712', '33250142', '33250382', '33251214', '33250895', '33250792', '33250367', '33500125', '33251901', '33250458', '33253271', '33253693', '33252120', '33252132', '33252109', '33253391', '33251034', '33250616', '33250602', '33250608', '33250607', '33250610', '33500130', '33251204', '33252335', '33250152', '33251907', '33252416', '33255477', '33250135', '33251703', '33250441', '33253192', '33251635', '33255479', '33251691', '33252994', '33250581', '33250364', '33250763', '33252606', '33252278', '33252408', '33252241', '33253665', '33252234', '33252237', '33253318', '33253068', '33253858', '33251962', '33251985', '33252097', '33255250', '33251097'
            ]
            if(orgcodeDataArr.indexOf(this.oilCode) > -1) {
              _this.isOpenNOOILPay = '1'
              _this.$store.state.stationData.isOpenNOOILPay = true
              _this.$store.state.stationData.oilModelShow = true
              // console.log('1油站开通非油支付')
            } else {
              _this.isOpenNOOILPay = '0'
              _this.$store.state.stationData.isOpenNOOILPay = false
              _this.$store.state.stationData.oilModelShow = true
              // console.log('2油站未开通非油支付')
            }
            console.log('_this.isOpenNOOILPay',_this.isOpenNOOILPay)
            // _this.isOpenNOOILPay = _this.zkInfo.IsOpenNOOILPay; // 是否开通非油支付 (1开通；0不开通) // 现在暂时屏蔽掉用上面的判断 2020-01-07

         /*   if (_this.zkInfo.AppType === '2' && _this.isOpenNOOILPay === '0') { // 油非一体但未开通非油支付
              _this.oilModelShow = true;
              _this.noneOilModelShow = false
              _this.$store.state.stationData.isOpenNOOILPay = false
              _this.$store.state.stationData.oilModelShow = true
            } else if (_this.zkInfo.AppType === '2' && _this.isOpenNOOILPay === '1') { // 油非一体且开通非油支付
              _this.oilModelShow = true;
              _this.noneOilModelShow = true
              _this.$store.state.stationData.isOpenNOOILPay = true
              _this.$store.state.stationData.oilModelShow = true
            } else if (_this.zkInfo.AppType === '3') { // 纯便利店
              _this.oilModelShow = false;
              _this.noneOilModelShow = true
              _this.$store.state.stationData.isOpenNOOILPay = true
              _this.$store.state.stationData.oilModelShow = false
            }*/
            if(_this.isselectgun){ _this.isselectgun = '1'}else{_this.isselectgun = '0'}
            if(_this.isselectoil){ _this.isselectoil = '1'}else{_this.isselectoil = '0'}
            _this.$store.state.isSelectgun = _this.isselectgun; // 将枪号、油品是否显示保存
            _this.$store.state.isSelectoil = _this.isselectoil;
            _this.setStationData(JSON.stringify(_this.$store.state.stationData));
            _this.goHome();
          } else {
            _this.$Toast(""+data.ErrMsg)
          }
        }, error => {
          _this.$Loading.close();
          console.log('获取中控主控机IP和端口号接口出错', 'url=>',url, 'error=>', error)
          _this.$Toast("编号：14，请求数据失败!请您检查设备是否已连接网络！",)
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
      }
    },
    created() {
      this.noneOilModelShow = this.$store.state.stationData.isOpenNOOILPay
      this.oilModelShow = this.$store.state.stationData.oilModelShow
      this.noOilIP = this.$store.state.stationData.IP2
      this.oilCode = this.$store.state.stationData.code
      this.getCommonargs();
      this.device = this.$store.state.commonargs.deviceId;
      this.oilIP = this.$store.state.stationData.IP;
      this.oilPort = this.$store.state.stationData.port;
      this.zkInfo.Port = this.$store.state.stationData.centralPort;
      this.zkInfo.IP = this.$store.state.stationData.centralIP;
      this.isselectgun = this.$store.state.isSelectgun;
      this.isselectoil = this.$store.state.isSelectoil;
    },
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .cursor:hover{
    cursor: pointer
  }
  .hidden{
    display: none
  }
  .setting {
    width 100%;
    height 1880px;
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
          margin-left 10px;
          margin-right 0px;
        }
        .setting-span-tips {
          color $color-text-l;
          flex 1;
          text-align right;
          margin-right 10px;
        }
        .setting-input {
          width 230px;
          height 60px;
          margin-left 20px;
          margin-right 0px;
          text-align right;
          font-size 27px;
          border 1px solid #D3D3D3;
          border-radius 10px;
          padding 0 20px 0 10px
        }
        .setting-input::-webkit-outer-spin-button,
        .setting-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
        }
        .setting-input{
          -moz-appearance:textfield;
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
            border-radius 12px
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
