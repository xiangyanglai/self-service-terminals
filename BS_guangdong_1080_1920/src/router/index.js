import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/bs'
    },
    {
      path: '/chargehome',
      name: '粤通卡充值',
      component: resolve => require(['@/components/charge/index'], resolve),
    },
    {
      path: '/chargepay',
      name: '支付',
      component: resolve => require(['@/components/charge/pay'], resolve),
    },
    {
      path: '/chargepayresult',
      name: '充值结果',
      component: resolve => require(['@/components/charge/payresult.vue'], resolve),
    },
    {
      path: '/bs',
      name: '',
      component: resolve => require(['@/components/bs'], resolve),
      children: [{
        path: '/',
        redirect: 'index'
      }, {
        path: 'index',
        name: '首页',
        component: resolve => require(['@/components/bs/index'], resolve)
      }, {
        path: 'noorder',
        name: '暂无订单',
        component: resolve => require(['@/components/bs/noorder'], resolve)
      }, {
        path: 'manual',
        name: '手册指引',
        component: resolve => require(['@/components/bs/manual'], resolve)
      }, {
        path: 'invoice',
        name: '电子发票',
        component: resolve => require(['@/components/bs/invoice'], resolve)
      }, {
        path: 'setting',
        name: '设置',
        component: resolve => require(['@/components/bs/setting'], resolve)
      }, {
        path: 'payment',
        name: 'payment交易结算',
        component: resolve => require(['@/components/bs/payment'], resolve)
      }, {
        path: 'paymentoilnum',
        name: '交易结算',
        component: resolve => require(['@/components/bs/paymentoilnum'], resolve)
      }, {
        path: 'paymentsetphone',
        name: '设置手机号',
        component: resolve => require(['@/components/bs/paymentsetphone'], resolve)
      }, {
        path: 'payorder',
        name: '订单支付',
        component: resolve => require(['@/components/bs/payorder'], resolve)
      }, {
        path: 'PayOrderDetail',
        name: '订单评价',
        component: resolve => require(['@/components/bs/PayOrderDetail'], resolve)
      }
      , {
        path: 'password',
        name: '石化钱包密码',
        component: resolve => require(['@/components/bs/password'], resolve)
      },{
        path: 'noneOilIndex',
        name: '非油首页',
        component: resolve => require(['@/components/bs/noneOilPage/noneOilIndex'], resolve)
      }
      ,{
        path: 'noneOilcode',
        name: '非油条形码',
        component: resolve => require(['@/components/bs/noneOilPage/noneOilcode'], resolve)
      },{
        path: 'noneOilpayStyle',
        name: '非油支付方式',
        component: resolve => require(['@/components/bs/noneOilPage/noneOilpayStyle'], resolve)
      },{
        path: 'noneOilpay',
        name: '非油支付',
        component: resolve => require(['@/components/bs/noneOilPage/noneOilpay'], resolve)
      }
      ,{
        path: 'paysuccess',
        name: '非油支付成功',
        component: resolve => require(['@/components/bs/noneOilPage/paySuccess'], resolve)
      }
      ,{
        path: 'noneOilInvoice',
        name: '非油开发票',
        component: resolve => require(['@/components/bs/noneOilPage/noneOilInvoice'], resolve)
      }
      // ,
      // {
      //   path: 'nonetwork',
      //   name: '网络错误',
      //   component: resolve => require(['@/components/bs/nonetwork'], resolve)
      // }
      ]
    }
  ],
  scrollBehavior (to, from, savedPosition) { //路由跳转，页面滚动到顶部
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
