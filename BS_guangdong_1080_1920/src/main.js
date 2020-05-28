// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import "@/common/stylus/index.styl"
import store from './vuex/store'
import './assets/iconfont.css'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import bridgefunc from './utils/bridgefunc'
Vue.prototype.$Bridgefunc = bridgefunc

Vue.config.productionTip = false
//http请求
import http from './utils/http'
Vue.prototype.$http = http
import util from './utils/util'
// Vue.use(util)
Vue.prototype.$util = util;

import sign from './utils/sign'
Vue.prototype.$sign = sign
import Loading from './components/vendor/loading/index'

Vue.prototype.$Loading = Loading

import Toast from './components/vendor/toast/index'
Vue.prototype.$Toast = Toast

import backview from './components/vendor/back-view/index'
Vue.use(backview)


// 引入nav-top
import navtop from './components/commonui/nav-top/index'
Vue.use(navtop)


// 引入nav-content
import navcontent from './components/commonui/nav-content/index'
Vue.use(navcontent)

import VConsole from 'vconsole'
if (store.state.isTest) {
  const vConsole = new VConsole()
  console.log(vConsole.version)
}



import VueTouch from 'vue-touch'
Vue.use(VueTouch, {name: 'v-touch'})


// 点击延时处理
import fastClick from 'fastclick'
fastClick.attach(document.body)


// 全局注册自定义指令 解决多次点击
Vue.directive('preventReClick', {
  inserted (el, binding) {
    el.addEventListener('click', () => {
      if (!el.disabled) {
        el.disabled = true
        setTimeout(() => {
          el.disabled = false
        }, binding.value || 500)
      }
    })
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})



/*import VConsole from 'vconsole/dist/vconsole.min.js' //import vconsole
let vConsole = new VConsole() // 初始化*/
