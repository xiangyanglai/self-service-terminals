import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

var store = new Vuex.Store({
  state: {
    commonargs:{
      deviceId: 'SBXCC4B736FB58A', // 正式  梅州城南 33250795
      // deviceId: 'SBX8CFCA0140B19', // 正式  土华西 33250077
      // deviceId: 'V1011648005860', // 测试 土华西 33250077
      appVersion: '',
      IpAddress:'',
      iswifi: 1,
    },
    stationData: {
      indexAdImg: [],
      isOpenNOOILPay: '',
      oilModelShow: true,
      totalYsMoney: 0,
      isSave: false,
      name: '',
      address: '',
      code: '',  // 油站编码
      centralIP: '',
      centralPort: '',
      centerUrlTest: 'SinopecGMISWebApiTest',
      centerUrl: 'HandheldPosApi',
      saleNo: '',
      noOilCode: '33251219',  // 非油便利店编码
      noOilSaleNo: '9166',    // 非油品销售终端号
      //------正式----//
      IP: '10.191.8.154',
      port: '8080',
      IP2: '10.191.8.200',    // 非油品Ip
      IP2s: '192.168.2.110',  // 本地端的IP
      port2: '21862',
      //------测试----//
      // IP: '10.191.8.201',
      // port: '80',
    },
    // 粤通卡充值
    YTIP:'10.191.8.200',
    YTPort: '21862',
    isTest: 0, // 1为测试，0为正式
    version: 2.2,
    webType: '1',
    pushedLength: 0,
    signKey: '',
    updateTime: '',
    orderInTime: 10,
    offlineTime: '',
    deviceInfo: {
      code: ''
    },
    gunsPageData: {
      gunData: [],
      lineData: [],
      sizeRatio: 10
    },
    position: {
    },
    indexAds: [],
    indexBtns: [],
    oilGuns: [],
    isSelectgun: '1', // 是否显示油枪
    isSelectoil: '1',
    faceurltest: 'http://10.191.253.218:65501/GDAPITest/FaceSearch/GetUserInfo',
    faceurl: 'http://10.191.253.218:65501/ECAPI/FaceSearch/GetUserInfo',
    registerurltest: 'http://10.191.253.218:65501/GDAPITest/FaceSearch/UserRegisterAuto',
    registerurl: 'http://10.191.253.218:65501/ECAPI/FaceSearch/UserRegisterAuto',
    isweixin: true,
    faceSearch: 'http://10.191.253.218:65501/ECAPI/FaceSearch',   // 生产
    // faceSearch: 'http://10.191.253.231:65501/GDAPITest/FaceSearch',  // 测试
    sysCurrentInfo: Object,  // 终端号信息
  },
  getters: {
  },
  mutations: {
  }
});

export default store
