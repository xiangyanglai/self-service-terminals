import Vue from 'vue';

import load from './src/STLoading'
const Loading = Vue.extend(load);
let instance;
export default {
  open(options = {}) {

    // 请注意，在实例化extends组件构造器时，传入属性必须是propsData、而不是props哦
    if (!instance) {
      instance = new Loading();
    }
    instance.message = typeof options === 'string' ? options : options.message;
    if (instance.visible) return;
    instance.$mount();
    document.body.appendChild(instance.$el);
    Vue.nextTick(() => {
      instance.visible = true;
    });
    this.setTime = setTimeout(function(){   // 设置30秒无相应，关闭loading
      instance.visible = false;
    },30000)
  },

  close() {
    Vue.nextTick(() => {
      if (instance) {
        instance.visible = false;
        clearTimeout(this.setTime) // 清除setTimeout
      }
    });
    
  },
  clickTap () {
    console.log('aa')
  }
};
