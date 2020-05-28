<template>
  <div class="payment" >
    <common-header v-if="isshowguns" @goBack="goBack"><span class="title">选择你的枪号</span></common-header>
    <common-header v-if="!isshowguns" @goBack="goBack1"><span class="title">订单列表</span></common-header>
    <div @click="handleDocumentEvent()">
      <!-- 发票提示语 -->
      <common-tips>
        <p class="tips-content">如需<span class="ticket">电子发票,</span>请下载“加油广东”APP，“我的发票”里开具发票</p>
      </common-tips>
      <div class="payment-content">
        <div class="payment-right">
          <div v-if="!isshowguns" class="right-title">{{gunNo}}号枪</div>
          <!-- 油品订单列表 -->
          <van-pull-refresh v-if="isshoworder && !isshowguns " class="right-oil-list" v-model="isLoading"  @refresh="onRefresh(0)">
            <div class="list-item-new list-item-oncheck cursor" v-for="(item,idx) in oilorder"
                 v-preventReClick="800" @click.prevent="oilorderchange(item,idx,$event)">
              <div class="disflex bothpad">
                <div class="list-item-text-black">{{item.GasName}}</div>
                <div class="list-item-amount-black">{{item.Amount}}元</div>
              </div>
              <div class="item-bottom martop1 bothpad">
                <div class="item-bottom-left list-item-text-oncheck">
                  {{datasplit(item)}}
                </div>
                <div class="list-item-text-oncheck">{{item.Qty+'L'}} </div>
              </div>
            </div>
          </van-pull-refresh>
          <!-- 枪号列表 -->
          <van-pull-refresh v-if="isshoworder && isshowguns" class="right-oil-list-oil-num" :class="selectnum.length<=32?'big-list':'small-list'" v-model="isLoading"  @refresh="onRefresh(1)">
            <div v-if="selectnum.length<=32">
              <div class="list-item-oil-num list-item-oncheck cursor big-list-item"  v-for="(item,idx) in selectnum" :class="{list_item_oncheck_noorder:haveordergun(item)}" v-preventReClick="800" @click.prevent="oilnumchange(item,idx,$event)">
                <div class="list-item-text-oncheck" >{{item.GunNo+''}}号枪</div>
              </div>
            </div>
            <div v-else>
              <div class="list-item-oil-num list-item-oncheck cursor small-list-item"  v-for="(item,idx) in selectnum" :class="{list_item_oncheck_noorder:haveordergun(item)}"  v-preventReClick="800" @click.prevent="oilnumchange(item,idx,$event)">
                <div class="list-item-text-oncheck">{{item.GunNo+''}}号枪</div>
              </div>
            </div>
          </van-pull-refresh>
          <!-- 无订单 和 请求失败 -->
          <div v-if="!isshoworder" class="right-oil-list-bg">
            <div  v-if="isShowError" class="right-oil-list-bg">
              <img class="right-oil-list-bg-img" src="../../../static/images/defaultPage_NoOrder.png" alt="" />
              <div class="right-oil-list-bg-text">
                <p v-if="errortip">{{errortip}}</p>
                <p v-else class="error-tip">
                  网络失败原因: <br/>1、自助机本身网络中断；<br/>2、中控主控机网络中断；<br/>3、油站网络中断；<br/>请逐一排查！
                </p>
              </div>
              <button style="width:50%;height:80px;border:1px solid #57DC5F;color:#57DC5F;font-size:30px;text-align:center;border-radius:10px;background:#fff;margin-top:50px" v-preventReClick="800" @click.prevent="repair($event)">手动修复</button>
              <div style="width:50%;height:80px;border:1px solid #57DC5F;font-size:30px;text-align:center;border-radius:10px;background:#fff;margin: 30px auto 0;line-height: 80px;">
                <!--<a href="http://10.191.8.110" style="color: rgb(87, 220, 95);width: 100%;height: 100%;display: block">测试网络</a>-->
                <p @click="ping('10.191.8.110')" style="color: rgb(87, 220, 95);width: 100%;height: 100%;display: block">测试网络</p>
              </div>
            </div>
            <div v-else>
              <img class="right-oil-list-bg-img" src="../../../static/images/defaultPage_NoOrder.png" alt="" />
              <div class="right-oil-list-bg-text">暂无订单,可能您的爱车正在加油中！</div>
            </div>
          </div>
          <!-- 右上角刷新提示 -->
          <img class="refresh-img" src="../../../static/images/refresh_icon.png" alt="" />
        </div>
      </div>
      <!-- 订单被锁定 -->
      <div v-if="showLockOrder" class="dialog__wrapper">
        <div class="dialog">
          <div class="dialog-title">
            订单锁定
          </div>
          <div class="dialog-content">
            <p>抱歉，此订单已被其他客户端锁定，请让加油员在“中控”手动解锁订单</p>
          </div>
          <div class="dialog-bottom">
            <div class="btn-box btn-box-1" v-preventReClick="800" @click.prevent="dissLock($event)">确定({{countText}}秒)</div>
          </div>
        </div>
      </div>
      <!--<back-view @goBack="goBack" @goHome="goHome"></back-view>-->
      <back-views @goBack="goBack" @goHome="goHome" @goRefresh="goRefresh"></back-views>
      <!-- 底部 -->
      <div class="footer">
        <Footer></Footer>
      </div>
    </div>
    <!-- 无网络 -->
    <NoNetwork v-if="IsConnectShow"  @Back="Back" @Back1="Back1"></NoNetwork>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { PullRefresh } from 'vant';
  Vue.use(PullRefresh);

  export default {
    name: "paymentoilnum",
    components: {
      Footer: require('./common/Footer.vue').default,
      CommonHeader: require('./common/CommonHeader').default,
      CommonTips: require('./common/CommonTips').default,
      NoNetwork: require('./NoNetwork').default,
      backViews: require('../vendor/back-view/back-views').default
    },
    data() {
      return {
        showLockOrder: false,  // 订单锁定弹框
        showPayWay2: true,     //  人脸支付显示
        selectPayWay: true,
        isshowguns: true,      // 是否显示枪号
        isshoworder: true,     // 是否显示订单，false显示无数据，true显示油品或者枪号
        ishavegun: false,
        selectnumindex: -1,    // 当前枪号id
        selectnum: [],         // 油枪列表
        oilorderindex: 0,      // 当前油品订单Id
        oilorder: [],          // 油品列表
        oilgunlist: [],        // 待支付油枪
        myClock: null,
        countText: 10,
        checkitem: {},         // 所点击的油品信息
        paytype: 0,
        facedata: [],          // 人脸支付信息
        isLoading: false,      // 是否显示加载中icon
        gunNo: '0',            // 查询的枪号
        freshCount: null,      // 自动刷新统计
        count: '',
        lastTime: null,        // 最后一次点击的时间
        currentTime: null,     // 当前点击的时间
        timeOut: 10000,        // 设置超时时间：10s
        // errortip: '获取订单失败，重新获取中控IP！', // 错误提示语
        errortip: '', // 错误提示语
        isShowError: false,    // 是否显示请求失败
        IsConnectShow: false,  // 是否显示无网络
        clickEvent: false,     // 设置为false,让setInterval执行
      }
    },
    methods: {
      // 刷新
      goRefresh () {
        this.getNoPayOrderGunNoList (0)
      },
      goHome () {
        this.closeCount(); // 清除定时刷新,不重新启动
        this.$router.push({
          name: '首页'
        })
      },
      goBack () {
        this.closeCount();
        this.freshCount = null;
        this.$store.state.pushedLength--;
        this.$router.go(-1)
      },
      // 隐藏油品订单列表，再重新开始定时
      goBack1 () {
        this.isshowguns = true;
        this.handleDocumentEvent()
      },
      dissLock (event) {
        if (event.target.disabled) {
         this.$Toast('点击太频繁了');
          return
        }
        this.showLockOrder = false;
        if (this.myClock) {
          window.clearInterval(this.myClock);
          this.myClock = null
        }
      },
      // 去除时间带T字母
      datasplit (item) {
        let str = item.C_PSAMASN;
        if (str) {
          let arr = str.split('T');
          return arr[1]
        } else {
          return ''
        }
      },
      // 检查该油枪是否有订单
      haveordergun (item) {
        for (let gunNo in this.oilgunlist) {
          if (this.oilgunlist[gunNo]==item.GunNo){
            return  false;
          }
        }
        return  true;
      },
      // 点击枪号
      oilnumchange (item, idx, event) {
        if (event.target.disabled) {
         this.$Toast('点击太频繁了');
          return
        }
        this.ishavegun = false;
        for (let gunNo in this.oilgunlist) {
          if (this.oilgunlist[gunNo] == item.GunNo){
            this.ishavegun = true;
            this.gunNo = item.GunNo
          }
        }
        if(this.ishavegun){
          this.selectnumindex = idx;
          this.isshowguns = false;
          for (let index in this.selectnum) {
            this.selectnum[index].check = false;
            if (item) {
              if (this.selectnumindex === index) {
                this.selectnum[index].check = true;
              }
            }
          }
          if (this.selectnumindex === -1) {
            this.getWaitPay(0, '', 0, 15,0);
            this.gunNo = '0';   // 将枪号保存，方便下拉刷新传参
            this.handleDocumentEvent()  // 开始定时
          } else {
            this.getWaitPay(this.selectnum[this.selectnumindex].GunNo, '', 0, 15,0);
            this.gunNo = this.selectnum[this.selectnumindex].GunNo;
            this.handleDocumentEvent()
          }
        }else {
          this.$Toast("该枪号下无订单")
        }
      },
      // 点击油品
      oilorderchange (item, idx,event) {
        if (event.target.disabled) {
         this.$Toast('点击太频繁了');
          return
        }
        this.oilorderindex = idx;
        for (let index in this.oilorder) {
          this.oilorder[index].check = false;
        }
        item.check = true;
        this.checkitem = item;
        this.LockAndUnLockOrder(1,item)
      },
      // 选择支付方式
      selectWay (type) { // type 0微信，1支付宝
        this.$router.push({
          name: '设置手机号',
          params: {
            orderitem: encodeURIComponent(JSON.stringify(this.checkitem)),
            paystyle: type
          }
        })
      },
      // 获取油站油枪是否有待支付订单接口
      getNoPayOrderGunNoList (type) { // 0显示加载框，1不显示
        if(type==0){
          this.$Loading.open('加载中');}
        let url = 'http://'+ this.$store.state.stationData.centralIP+':'+ this.$store.state.stationData.centralPort+'/'+this.$store.state.stationData.centerUrl+'/api/Terminal/GetNoPayOrderGunNoList';
        let params1 = {
          GunNo: 0,
          GasCode: '',
          Minutes:15,
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "Args": argsStr,
          "StationCode": this.$store.state.stationData.code,
          "DeviceCode": this.$store.state.commonargs.deviceId,
          "Sign": sign
        };
        this.$http.post(url, params).then(res => {
          this.$Loading.close();
          let data = res.data;
          if (data.ResultCode == 1) {
            this.oilgunlist = JSON.parse(data.ResultObj).OilGun;
            this.getOilGunInfo()
          } else {
            this.errortip = data.ErrMsg;
            this.showErrorMask();  // 显示错误弹框
          }
        }, error => {
          this.$Loading.close();
          this.showErrorMask()
          this.writeLog (url)
        })
      },
      // 获取油枪信息接口
      getOilGunInfo () { // 0显示加载框，1不显示
        let url = 'http://'+ this.$store.state.stationData.centralIP+':'+ this.$store.state.stationData.centralPort+'/'+this.$store.state.stationData.centerUrl+'/api/Terminal/GetOilGunInfo';
        let params1 = {
          GunNo: 0,
          GasCode: '',
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "Args": argsStr,
          "StationCode": this.$store.state.stationData.code,
          "DeviceCode": this.$store.state.commonargs.deviceId,
          "Sign": sign
        };
        this.$http.post(url, params).then(res => {
          this.$Loading.close();
          let data = res.data;
          if (data.ResultCode == 1) {
            this.isshoworder = true;
            this.IsConnectShow = false;
            this.selectnum =JSON.parse(data.ResultObj);
            this.handleDocumentEvent()  // 重新倒计时
          } else {
            this.errortip = data.ErrMsg;
            this.showErrorMask()
          }
        }, error => {
          this.$Loading.close();
          this.showErrorMask()
          this.writeLog (url)
        })
      },
      // 获取待支付订单接口
      getWaitPay (gunno, gascode, count, minutes, type) { //0显示加载框，1不显示
        if(type==0){
          this.$Loading.open('加载中')}
        let url = 'http://'+ this.$store.state.stationData.centralIP+':'+ this.$store.state.stationData.centralPort+'/'+this.$store.state.stationData.centerUrl+'/api/Terminal/GetWaitPay';
        let params1 = {
          GunNo: '' + gunno,
          GasCode: '' + gascode,
          Count: '' + count,
          Minutes: '' + minutes,
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);

        let params = {
          "Args": argsStr,
          "StationCode": this.$store.state.stationData.code,
          "DeviceCode": this.$store.state.commonargs.deviceId,
          "Sign": sign
        };
        this.$http.post(url, params).then(res => {
          this.$Loading.close();
          let data = res.data;
          if (data.ResultCode == 1) {
            this.oilorder = JSON.parse(data.ResultObj);
            this.IsConnectShow = false;
            if(this.oilorder.length==0){
              this.isshoworder = false;  // 显示无数据
              this.isShowError = false;
            }else {
              this.isshoworder = true;  // 显示油品列表
              this.isshowguns=false;
            }
          } else {
            this.errortip = data.ErrMsg;
            this.showErrorMask() // 显示错误弹框
          }
        }, error => {
          this.$Loading.close();
          this.showErrorMask()
          this.writeLog (url)
        })
      },
      // 锁定订单
      LockAndUnLockOrder (lockState,item) {  // lockState: 1锁定  0解锁
        let url = 'http://'+ this.$store.state.stationData.centralIP+':'+ this.$store.state.stationData.centralPort+'/'+this.$store.state.stationData.centerUrl+'/api/Terminal/LockAndUnLockOrder';
        let params1 = {
          RefueledID: '' + item.ID,
          LockState: lockState
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "Args": argsStr,
          "StationCode": this.$store.state.stationData.code,
          "DeviceCode": this.$store.state.commonargs.deviceId,
          "Sign": sign
        };
        this.$http.post(url, params).then(res => {
          this.$Loading.close();
          let data = res.data;
          if (data.ResultCode == 1) {
            if(lockState){
              this.closeCount();  // 锁定，显示支付方式
              this.$Bridgefunc.customPush({
                name: '设置手机号',
                params: {
                  orderitem: encodeURIComponent(JSON.stringify(this.checkitem))
                }
              })
            }else{
              this.handleDocumentEvent()  // 解锁，清除定时再重新开始定时
            }
          } else {
            this.showLockOrder = true;
            this.countText = 10;
            this.myClock = window.setInterval(() => {
              this.countText--;
              if (this.countText <= 0) {
                this.dissLock();
              }
            }, 1000)
          }
        }, error => {
          this.$Loading.close();
          this.$Toast("编号：13，请求数据失败!请您检查设备是否已连接网络！")
          this.writeLog (url)
        })
      },
      //发起人脸支付
      getToFacePay (faceimage) {
        let url;
          if( this.$store.state.isTest===1){
            url=this.$store.state.faceurltest;
          }else {
            url=this.$store.state.faceurl;
          }
        this.$Loading.open();
        let jsonData = {};
        jsonData.type = 'gethttpfacedata';
        jsonData.url = url;
        jsonData.jsonstr =faceimage ;
        this.$Bridgefunc.callBridge('phonebridge', jsonData, (response) => {
          this.$Loading.close();
          this.closeactivity();
          let data = JSON.parse(response);
          if (data) {
            this.facedata =data;
            if (this.facedata.RetCode===0){
              this.$Bridgefunc.customPush({
                path: 'password',
                query: {
                  orderitem:encodeURIComponent(JSON.stringify(this.checkitem)) ,
                  facedata: encodeURIComponent(JSON.stringify(this.facedata)),
                }
              })
            }else {
              this.$Toast(data.RetMsg)
            }
          } else {
            this.$Toast(data.RetMsg)

          }
        })
      },
      closeactivity () {
        let jsonData = {};
        jsonData.type = 'closefaceui';
        this.$Bridgefunc.callBridge('phonebridge', jsonData, (response) => {
        })
      },
      onRefresh (type) {  //type,0为枪号订单列表，1为枪号列表
        setTimeout(() => {
          this.handleDocumentEvent();  //刷新成功，清除定时再重新开始定时
          this.isLoading = false;
          if(type==0){
            let gunno= this.gunNo;
            this.getWaitPay(gunno, '', 0, 15,1)
          }else{
            this.getNoPayOrderGunNoList(1)
          }
        }, 1000);
      },
      // 页面点击事件,并重新启动倒计时
      handleDocumentEvent () {
        this.clickEvent = false;  // 设置为true,让setInterval执行
        window.clearInterval(this.freshCount);
        this.intervalFresh()  // 页面有操作后重新倒计时
      },
      // 关闭倒计时，不重新启动
      closeCount () {
        this.clickEvent = true;  // 设置为true,让setInterval不执行
        window.clearInterval(this.freshCount);  // 清除倒计时
      },
      // 定时刷新
      intervalFresh () {
        const TIME_COUNT = 10;
        if (this.clickEvent) {
          this.count = 0
        } else {
          this.count = TIME_COUNT
        }
        this.freshCount = window.setInterval(() => {
          if (this.count > 0 && this.count <= TIME_COUNT) {
            this.count--;
            if (this.count === 0) {
              this.handleDocumentEvent();  // 重新开始倒计时
              if(this.isshowguns){  // isshowguns为true加载枪号，为false加载订单
                this.getNoPayOrderGunNoList(1)
              }else{
                let gunno= this.gunNo;
                this.getWaitPay(gunno, '', 0, 15,1)
              }
            }
          }else {
            window.clearInterval(this.freshCount);
            this.freshCount = null;
          }
        }, 1000)
      } ,
      // 判断是否有网络
      getconnet (){
        let _this = this;
        _this.$Bridgefunc.registeBridge('getConnectStatus',function (response) { // 0有网络，1无网络
          if (response==='1') { // 无网络跳转
             _this.showConnectShow()
          }else{
            _this.Back()
          }
        })
      },
      // 显示错误弹框,并清除定时器
      showErrorMask (){
        this.IsConnectShow = false;
        this.isshoworder = false;
        this.isShowError = true;
        this.closeCount();
      },
      // 显示无网络,并清除定时器
      showConnectShow (){
        this.IsConnectShow = true;
        this.closeCount();
      },
      // 重新请求
      repair (event) {
        if (event.target.disabled) {
         this.$Toast('点击太频繁了');
          return
        }
        this.getZhongKongOildName(1)
      },
       // 无网络时，点击返回
      Back () {
        this.IsConnectShow = false
      },
      // 无网络时，点击“重新请求网络”
      Back1 () {
        this.getZhongKongOildName(0);  // 更新中控数据，再刷新页面
      },
      // 获取中控ip和端口(走云平台)
      getZhongKongOildName (type) {  // 0 “重新请求网络”，1“手动修复”
        let _this = this;
        this.closeCount(); // 清除定时刷新,不重新启动
        if (this.$store.state.stationData.code == ''|| this.$store.state.stationData.IP==''||this.$store.state.stationData.port==''||this.$store.state.commonargs.deviceId=='') {
          this.$Toast("请设置中控IP");
          setTimeout(function(){
            this.$router.push({
              path: '/'
            })
          },1500);
          return
        }
        let url;
        if (this.$store.state.isTest) {
          url = `http://${this.$store.state.stationData.IP}:${this.$store.state.stationData.port}/HandHeldPosApi/api/Terminal/GetIPAndPort`;
        } else {
          url = `http://10.191.8.110/HandHeldPosApi/api/Terminal/GetIPAndPort`;
        }
        let params1 = {
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "Args":argsStr,
          "StationCode": this.$store.state.stationData.code,
          "DeviceCode":this.$store.state.commonargs.deviceId,
          "Sign":sign
        };
        this.$Loading.open('加载中');
        this.$http.post(url, params).then(res => {
          let data = res.data;
          if (data.ResultCode == 1) {
            this.zkInfo = JSON.parse(data.ResultObj);
            this.$store.state.stationData.name = this.zkInfo.StationName;
            setTimeout(function(){
              _this.getNoPayOrderGunNoList(0);  // 刷新数据
            },500)
          } else {
            this.errortip = data.ErrMsg;
            this.showErrorMask()
          }
        }, error => {
          if(type){
            this.showErrorMask() // 显示错误弹框
          }else{
            this.showConnectShow() // 显示无网络
          }
          this.$Loading.close();
          this.writeLog (url)
        })
      },
      // 关闭支付方式框
      cancelClick () {
        let lockState = 0;
        let item = this.checkitem;
        this.LockAndUnLockOrder(lockState,item)  // 解锁订单
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
      },
      // 手动检测网络
      ping(ip) {
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
    created () {
      this.getNoPayOrderGunNoList(0);  // 0显示加载框，1不显示
      this.handleDocumentEvent();  // 开始倒计时
      this.getconnet();
      this.isshowguns = this.$route.query.type;
    },
    beforeDestroy () {
      // 刷新页面，清除倒计时
      if (this.freshCount) {
        this.closeCount()
      }
    }
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .cursor:hover{
    cursor: pointer
  }
  .payment {
    width 100%;
    height 100%
    position relative;
    overflow hidden;
    .payment-title {
      height 40px;
      width 1080px;
      .payment-text {
        position absolute;
        display flex;
        justify-content center;
        align-items center
        width 100%;
      }
      .tips {
        height 40px;
        background-color $tip-top-bg;
        font-size $font-size-small
      }
    }
    .payment-content {
      width 1080px;
      height 1654px;
      .content-left {
        width 140px;
        height 1654px;
        float left;
        background-color $setting-top-bg;
        overflow-y auto;
        overflow-x hidden
        font-size $font-size-medium-s;
        .item {
          width 10px
          display flex;
          justify-content center;
          padding 70px;
        }
        .type-item-oncheck {
          color $color-text-normal;
          background-color $setting-top-bg;
        }
        .type-item-check {
          color white
          background-color $bg-color;
        }
      }
      .payment-right {
        height 100%;
        overflow hidden
        background-color white;
        font-size $font-size-medium-x;
        .right-title {
          width 100%;
          text-align center;
          padding 30px;
          font-size 42px;
        }
        .top-scroll {
          overflow-x auto
          overflow-y hidden
          width: 100%;
          white-space: nowrap;
        }
        .right-select {
          display inline-block;
          padding 20px;
          text-align center;
          .select-oncheck {
            color $color-text-l;
          }
          .select-check {
            color $bg-color
          }
        }
        .right-oil-list-oil-num::-webkit-scrollbar,.right-oil-list::-webkit-scrollbar{
          display: none;
        }
        .small-list{
          padding 0 48px;
        }
        .big-list{
          padding 0 96px;
        }
        .right-oil-list-oil-num {
          height 1654px;
          overflow: scroll;
          overflow-x: hidden;
          overflow-y: auto;
          .small-list-item{
            width 14.67%;
            margin 25px 1% 0 1%;
            font-size $font-size-large-x;
            padding 20px 10px;
          }
          .big-list-item{
            width 21%;
            margin 48px 2% 0 2%;
            font-size $font-size-large-l;
            padding 20px;
          }
          .list-item-oil-num {
            height 124px;
            border-radius 8px;
            float left;
            overflow hidden
            .item-bottom {
              display flex;
              margin-top 10px;
              .item-bottom-left {
                flex 1;
              }
            }
          }
          .list-item-oncheck {
            display: flex;
            justify-content: center;
            align-items: center;
            border 1px solid $bg-color;
            background #79db87;
            text-align center;
            .list-item-text-oncheck {
              color $color-text-normal;
            }
            .list-item-text-guns{
              font-size 33px
              color #33703c
              border-top 1px solid #56905f
              margin-top 10px
              padding-top 5px
            }
          }
          .list-item-oncheck:active {
            background-color $bg-color;
            .list-item-text-oncheck {
              color white;
            }
          }
          .list_item_oncheck_noorder {
            display: flex;
            justify-content: center;
            align-items: center;
            border 1px solid $order-bg-color-noorder;
            background-color $order-bg-color-noorder;
            text-align center;
            .list-item-text-oncheck {
              color $color-text-gray;
            }
          }
          .list_item_oncheck_noorder:active {
            background-color $order-bg-color-noorder;
            .list-item-text-oncheck {
              color $color-text-gray!important;
            }
          }
        }
        .right-oil-list-bg{
          position absolute;
          width 100%
          text-align center;
          justify-content: center;
          align-items: center;
          top 25%;
          .right-oil-list-bg-text{
            color $color-text-l;
            p{
              line-height 40px
            }
            .error-tip{
              width 325px;
              text-align left;
              margin 0 auto;
            }
          }
          .right-oil-list-bg-img{
            margin-right 50px;
          }
        }
        .right-oil-list::-webkit-scrollbar{
          display: none;
        }
        .right-oil-list {
          padding 0 35px 110px 25px;
          height 1654px;
          overflow: scroll;
          overflow-x: hidden;
          overflow-y: auto;
          .list-item {
            padding 30px 20px;
            width 29.333%;
            height auto;
            border-radius 20px;
            margin 45px 2% 0 2%;
            float left;
            overflow hidden
            .item-bottom {
              display flex;
              margin-top 10px;
              .item-bottom-left {
                flex 1;
              }
            }
          }
          .list-item-new {
            padding 30px 20px;
            width 95%;
            height auto;
            border-radius 20px;
            margin 25px 3% 0 2%;
            float left;
            overflow hidden
            .disflex{
              display flex;
              justify-content space-between
            }
            .item-bottom {
              display flex;
              margin-top 10px;
              .item-bottom-left {
                flex 1;
              }
            }
          }
          .list-item-oncheck {
            border 1px solid #bfbfbf;
            .bothpad{
               padding 0 90px;
            }
            .list-item-text-black{
              color #4c4847!important;
              font-size 35px!important;
            }
            .list-item-amount-black {
              font-size 52px;
              color #4c4847;
              span{
                font-size 33px
              }
            }
            .list-item-text-oncheck {
              color #b7b7b7;
              font-size 30px
            }
            .list-item-amount-oncheck {
              font-size $font-size-large-x;
              color $color-text-amount;
              span{
                font-size 33px
              }
            }
            .list-item-line-oncheck {
              height 1px;
              width 100%;
              padding 0 20px;
              margin 70px 0 22px 0;
              background-color #d9d9d9;
            }
            .martop{
               margin-top 20px;
            }
            .martop1{
               margin-top 60px;
            }
          }
          .list-item-oncheck:active {
            background-color $bg-color;
            .list-item-amount-oncheck{
              margin-top 20px;
              font-size $font-size-large-x;
              color white;
            }
            .list-item-text-oncheck {
              color white;
              font-size 27px
            }
            .list-item-line-oncheck{
              height 1px;
              width 100%;
              padding 0 20px;
              margin 70px 0 22px 0;
              background-color white;
            }
          }
        }
        .refresh-img{
          position absolute
          top 222px
          right 10px
          z-index 9999
        }
      }
    }
    .dialog__wrapper {
      width: 100%
      height: 100%
      max-width: 1080px
      margin: 0 auto
      position: fixed;
      top: 0px;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 9998;
      background-color: rgba(0, 0, 0, 0.6);
      .dialog-new{
        position: absolute
        width: 100%
        height: 70vh
        bottom: 0
        background: #ffffff
        z-index: 9999
        .dialog-title {
          display: flex
          justify-content: center
          align-items: center
          height: 150px
          line-height: 150px
          width: 100%
          z-index: 10
          font-size: $font-size-large-l
          border-bottom: 1px solid #ebebeb
          .cancel-btn{
             position: absolute
             left: 60px
             font-size: $font-size-large-x
          }
        }
        .dialog-style{
          width: 100%
          height: 450px
          margin-top: 200px
          background-image: url('../../../static/images/peystyle_icon.png')
          display: flex
          div{
            width: 100%
          }
        }
        .love-tips {
          color: #4c4948;
          font-size: 30px;
          line-height: 50px;
          padding: 0 70px;
        }
      }
      .dialog {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        padding-top: 120px;
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
          height 120px;
          display flex;
          padding 0 40px;
          justify-content center;
          font-size $font-size-small;
          color $color-text-l;
          p{
            line-height 40px
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
        .dialog-content-pay {
          width 100%;
          display: flex;
          padding 0 40px;
          justify-content center;
          font-size: $font-size-medium;
          color $color-text-l;
          .printing-div-pay {
            justify-content: center;
            margin 1px 60px 50px;
            .pay-way-img {
              position relative;
              margin-top 15px;
            }
            .pay-way-img1 {
              position relative;
              .pay-way-img2 {
                position: absolute;
                left: 80px;
                top: 80px;
              }
            }
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
        }
        .btn-box-1 {
          border 1px solid $bg-color;
          color $bg-color;
        }
        .btn-box-1:active {
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
  }
</style>
