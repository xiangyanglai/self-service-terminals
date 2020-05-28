import store from "../vuex/store";
import router from "../router";
import config from "../api/config";
import ChargeDeal from './ChargeDeal'


var bridgefunc = {
  callBridge: function (bridgeOpStr, paras, callback) {
    // if (paras.type != 'writeLog' && paras.type != 'uploadLog') {
    //   bridgefunc.writeLog('bridgeEvent ' + JSON.stringify(paras))
    // }
    this.setupWebViewJavascriptBridge(function (bridge) {
      bridge.callHandler(bridgeOpStr, paras, function responseCallback(response) {
        // if (paras.type != 'writeLog' && paras.type != 'uploadLog') {
        //   bridgefunc.writeLog('bridgeEvent ' + JSON.stringify(paras) + ' ~~response~~' + response)
        // }
        if (callback) {
          callback(response);
        }
      })
    })
    // let webtype = store.state.webType;
    // if (webtype != '1') {
    //   if (callback) {
    //     callback(null);
    //   }
    // }
  },
  registeBridge: function (bridgeOpStr, callback) {
    this.setupWebViewJavascriptBridge(function (bridge) {
      bridge.registerHandler(bridgeOpStr, function (data, responseCallback) {
        if (callback) {
          callback(data, responseCallback);
        }
      })
    })
  },
  setupWebViewJavascriptBridge: function (callback) {
    if (window.WebViewJavascriptBridge) {
      return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () {
      document.documentElement.removeChild(WVJBIframe)
    }, 0)
  },
  // 尊重原数据结构，push
  customPush: function (pushData) {
    // let webtype = store.state.webType;
    // if (webtype != '1') {
    store.state.pushedLength++
    router.push(pushData)
    // return
    // }
    // let path = pushData.path
    // let pathBase = '/' + config.routeBase
    // if (path.indexOf(pathBase) != 0) {
    //   path = pathBase + path
    // }
    // path = path + '?'
    // let query = pushData.query
    // for (let key in query) {
    //   let value = query[key]
    //   path += key + '=' + value + '&';
    // }
    // path = path.substr(0, path.length - 1)
    // let paras = {
    //   weburl: path
    // }
    // bridgefunc.newPage(paras)
  },
  //新创建页面 jsonData里面包含跳转地址weburl、isnativetop（是否是原生上导航，不传默认是原生的）
  newPage: function (jsonData) {
    let webtype = store.state.webType;
    let weburl = jsonData.weburl
    if (typeof(weburl) == undefined) {
      return
    } else if (weburl.indexOf("http") != 0) {
      weburl = config.webBase + weburl
    }
    if (webtype != '1') {
      window.location.href = weburl
      return
    }
    jsonData.weburl = weburl
    jsonData.type = 'newpage'
    jsonData.isnativetop = '1'
    bridgefunc.callBridge('phonebridge', jsonData)
  },
  resetPage: function (jsonData) {
    let webtype = store.state.webType;
    let weburl = jsonData.weburl
    if (typeof(weburl) == undefined) {
      return
    } else if (weburl.indexOf("http") != 0) {
      weburl = config.webBase + weburl
    }
    // if (webtype != '1') {
    //   window.location.replace(weburl)
    //   return
    // }
    jsonData.weburl = weburl
    jsonData.type = 'resetpage'
    jsonData.isnativetop = '0'
    bridgefunc.callBridge('phonebridge', jsonData)
  },
  // 尊重原数据结构，返回
  customGo: function (n) {
    // let webtype = store.state.webType;
    // if (webtype == '1') {
    store.state.pushedLength += n
    router.go(n)
    // return
    // }
    // bridgefunc.turnBack(n)
  },
  //pop到第几层 如果n为0 或 不传则默认pop到上一层
  turnBack: function (n) {
    let webtype = store.state.webType;
    let jsonData = {};
    if (n && typeof n === 'number') {
      if (webtype != '1') {
        window.history.go(n)
        return
      }
      jsonData.type = 'turnback'
      jsonData.index = n + ''
      bridgefunc.callBridge('phonebridge', jsonData)
    } else {
      if (webtype != '1') {
        window.history.go(-1)
        return
      }
      jsonData.type = 'turnback'
      bridgefunc.callBridge('phonebridge', jsonData)
    }
  },
  //获取公共参数
  getCommonargs: function (callback) {
    let jsonData = {};
    jsonData.type = 'commonargs'
    bridgefunc.callBridge('phonebridge', jsonData, callback)
  },
  //百度导航  传入起始点startlong startlat 和终点的经纬度 endlong  endlat
  baiduNav: function (jsonData) {
    if (!jsonData || !jsonData.startlong || !jsonData.startlat || !jsonData.endlong || !jsonData.endlat) {
      return;
    }
    jsonData.type = 'nav'
    bridgefunc.callBridge('phonebridge', jsonData)
  },
  //页面展示
  registePageShow: function (callback) {
    bridgefunc.registeBridge('pagewillshow', function () {
      callback()
    })
  },
  //存item
  setItem: function (key, value, callback) {
    let jsonData = {};
    jsonData.type = 'storeitem'
    jsonData.key = key;
    jsonData.value = value;
    bridgefunc.callBridge('phonebridge', jsonData, callback)
  },
  setItems: function (keyvalues, callback) {
    let webtype = store.state.webType;
    if (webtype != '1') {
      for (let i = 0; i < keyvalues.length; i++) {
        let keyvalue = keyvalues[i];
        window.localStorage.setItem(keyvalue.key, keyvalue.value);
      }
      if (callback) {
        callback();
      }
      return
    } else {
      let jsonData = {};
      jsonData.type = 'storeitems'
      jsonData.keyvalues = keyvalues;
      bridgefunc.callBridge('phonebridge', jsonData, callback)
    }
  },
  removeItem: function (key, callback) {
    let webtype = store.state.webType;
    if (webtype != '1') {
      window.localStorage.removeItem(key);
      if (callback) {
        callback();
      }
      return
    } else {
      let jsonData = {};
      jsonData.type = 'removeitem'
      jsonData.key = key;
      bridgefunc.callBridge('phonebridge', jsonData, callback)
    }
  },
  getItem: function (key, callback) {
    let jsonData = {};
    jsonData.type = 'getitem'
    jsonData.key = key;
    bridgefunc.callBridge('phonebridge', jsonData, callback);
  },
  getItems: function (keys, callback) {
    let webtype = store.state.webType;
    if (webtype != '1') {
      if (callback) {
        let result = {};
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          result[key] = window.localStorage.getItem(key);
        }
        callback(result);
      }
      return
    } else {
      let jsonData = {};
      jsonData.type = 'getitems'
      jsonData.keys = keys;
      bridgefunc.callBridge('phonebridge', jsonData, callback);
    }
  },
  vuexStorage: function (callback) {
    let jsonString = encodeURIComponent(JSON.stringify(store.state))
    // setItem:function (key,value,callback)
    bridgefunc.setItem('vuex', jsonString, callback)
  },
  vuexRead: function (callback) {
    bridgefunc.getItem('vuex', function (result) {
      if (!result) {
        if (callback) {
          callback()
        }
        return;
      }
      let jsonString = decodeURIComponent(result);
      let jsonData = JSON.parse(jsonString)
      if (jsonData) {
        bridgefunc._loopState(jsonData, store.state, true);
      } else {
        bridgefunc.vuexStorage()
      }
      if (callback) {
        callback()
      }
    })
  },

  _loopState: function (jsonData, toData, isFrist) {

    for (let key in jsonData) {
      if (toData.hasOwnProperty(key) || !isFrist) {
        if (typeof jsonData[key] != 'object' || !toData[key]) {
          toData[key] = jsonData[key];
        } else {
          this._loopState(jsonData[key], toData[key]);
        }
      }
    }

  },


  //微信分享 title标题 sharetext副标题 imageurl图标url   detailurl链接url
  wechatShare: function (jsonData) {
    jsonData.type = 'wechatshare',
      bridgefunc.callBridge('phonebridge', jsonData);
  },
  //人脸识别，获取图片base串
  getFaceData: function (callback) {
    let jsonData = {};
    jsonData.type = 'getfacedata'
    bridgefunc.callBridge('phonebridge', jsonData, callback)
  },
  // writeLog: function (log) {
  //   let jsonData = {};
  //   jsonData.type = 'writeLog'
  //   let logString = util.dateFtt("yyyy-MM-dd hh:mm:ss:S", new Date()) + ' | ' + encodeURIComponent(log)
  //   jsonData.logcontent = logString;
  //   bridgefunc.callBridge('phonebridge',jsonData)
  // },
  // uploadLog: function (logname) {
  //   let jsonData = {};
  //   jsonData.type = 'uploadLog'
  //   jsonData.logname = logname
  //   bridgefunc.callBridge('phonebridge',jsonData)
  // }
/*  qrscan: function (callback) {
    let jsonData = {};
    jsonData.type = 'qrscan'
    bridgefunc.callBridge('phonebridge', jsonData, (response) => {
      if (callback) {
        callback(response)
      }
    })
  },
  qrscan: function (callback, printjson) {
    let jsonData = {};
    jsonData.type = 'printdata',
      jsonData.printjson = printjson,//打印的信息json串，必要时可转码
      bridgefunc.callBridge('phonebridge', jsonData, (response) => {
        if (callback) {
          callback(response)
        }
      })
  },*/
  //读卡
  readCard: function () {
    return new Promise((resolve) => {

      let jsonData = {};
      jsonData.type = 'readCard';
      bridgefunc.callBridge('phonebridge', jsonData, (response) => {
        resolve(ChargeDeal.dataDeal(response));
      })

    });
  },
  //打开卡
  openCard: function () {
    return new Promise((resolve) => {
      let jsonData = {};
      jsonData.type = 'openCard';
      bridgefunc.callBridge('phonebridge', jsonData, (response) => {
        resolve(ChargeDeal.dataDeal(response));
      })
    });
  },


  //写卡
  writeCard: function (strCommandText) {
    return new Promise((resolve, reject) => {
      let jsonData = {};
      jsonData.type = 'sendCardData';
      //粤通卡指令
      jsonData.instruct = strCommandText;
      bridgefunc.callBridge('phonebridge', jsonData, (response) => {
        resolve(ChargeDeal.dataDeal(response));
      })
    });
  },

  printTicket: function (stationInfo, cardInfo) {
    // let pdata = {
    //   "ID": data.TSalBill.$id,
    //   "WorkDay": data.TSalBill.XSDATE,
    //   "Shift": data.TSalBill.$id,
    //   "GunNo": data.TSalBill.$id,
    //   "GasCode":data.TSalBill.$id,
    //   "GasName": data.TSalBill.$id,
    //   "Qty": data.TSalBill.$id,
    //   "Price": data.TSalBill.$id,
    //   "Amount": data.TSalBill.$id,
    //   "HasPayAmount": data.TSalBill.$id,
    //   "DisAmount": data.TSalBill.$id,
    //   "POSTTC": data.TSalBill.$id,
    //   "C_PSAMASN": data.TSalBill.$id,
    //   "CardNo": data.TSalBill.$id,
    // }

  }


}

export default bridgefunc
