import Config from './../api/config'
import axios from 'axios'


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
})
Axios.interceptors.request.use(
  config => {
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
    // console.log(error);
    return Promise.reject(error);
  }
);

export default Axios;
