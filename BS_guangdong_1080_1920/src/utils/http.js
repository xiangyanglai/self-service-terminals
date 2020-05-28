import Config from './../api/config'
import axios from 'axios'
import sign from './sign'

import store from "../vuex/store"
import writelog from "./writelog"

const Axios = axios.create({
  // baseURL: Config.baseURL,
  timeout: 30000,
  responseType: 'json',
  allowCredentials:false,
  headers: {
    // 'Content-Type': 'application/x-www-form-urlencoded'
    'Content-Type': 'application/json',
    // 'timestamp': '',
    // 'sign': '',
  }
});
Axios.interceptors.request.use(
  config => {
    // 请求数据写入日志
    let msg = 'request' + " | url: " + config.url + " | args: " + JSON.stringify(config.data);
    let url = `http://${store.state.stationData.IP2}:21862/sys/api/SelfServiceSystem/WriteLog`;
    if (store.state.stationData.code !== '') {
      let stationCode;
      if (store.state.isTest) {
        stationCode = '33250001'
      } else {
        stationCode = store.state.stationData.code
      }
      let params1 = {
        OrgCode: stationCode,
        Message: JSON.stringify(msg),
      };
      let argsStr = JSON.stringify(params1);
      let signVal;
      if (store.state.isTest) {
        signVal = sign.signArgs(argsStr,0);
      } else {
        signVal = sign.signArgs(argsStr,1);
      }
      let params = {
        "JsonData": argsStr,
        "Sign": signVal
      };
      writelog.post(url, params).then(res => {
      }, error => {
      });
    }

    var time = new Date().getTime();
    let urlStr = config.url;
    if (urlStr.indexOf("?") == -1) {
      config.url = config.url+'?ver='+time;
    }else {
      config.url = config.url+'&ver='+time;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 返回状态判断(添加响应拦截器)
Axios.interceptors.response.use(
  res => {
    // 响应数据写入日志
    let msg = 'response' + " | url: " + res.config.url + " | args: " + JSON.stringify(res.data);
    let url = `http://${store.state.stationData.IP2}:21862/sys/api/SelfServiceSystem/WriteLog`;
    if (store.state.stationData.code !== '') {
      let stationCode;
      if (store.state.isTest) {
        stationCode = '33250001'
      } else {
        stationCode = store.state.stationData.code
      }
      let params1 = {
        OrgCode: stationCode,
        Message: JSON.stringify(msg),
      };
      let argsStr = JSON.stringify(params1);
      let signVal;
      if (store.state.isTest) {
        signVal = sign.signArgs(argsStr,0);
      } else {
        signVal = sign.signArgs(argsStr,1);
      }
      let params = {
        "JsonData": argsStr,
        "Sign": signVal
      };
      writelog.post(url, params).then(res => {
      }, error => {

      });
    }

    let data = res.data;
    //token  过期重新登录
    // if (data.errorCode == 1000) {
    //   store.state.login.token = '';
    //   let _this = this;
    //   bridgefunc.vuexStorage(function () {
    //     bridgefunc.resetPage({
    //       weburl: '/login',
    //     });
    //   })
    // }
    return res;
  },
  error => {
    return Promise.reject(error);
  }
);

export default Axios;
