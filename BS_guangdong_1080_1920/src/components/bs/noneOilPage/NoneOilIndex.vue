<template>
  <div class="none-oil-wrapper">
    <div class="none-oil-header">
      <span class="logo"></span><span class="handle-time" v-if="!scantipOrGoodslist" @click="cancelTrade">取消交易（{{count}}s）</span>
    </div>
    <div class="scroll-wrapper">
      <div class="handle-scan" :style="scantipOrGoodslist ? 'background: #fff;':'background: #f0f2ef;'">
        <!-- 扫码提示页 -->
        <div class="handle-scan-tips" v-show="scantipOrGoodslist">
          <p class="scan-title">请扫入商品码</p>
          <p class="scan-tip">将条形码对准扫码口，逐次扫描所有商品</p>
          <p class="scan-img"><img src="../../../../static/images/noneOil/img.png" alt=""></p>
        </div>
        <!-- 扫码提示页 end -->

        <!-- 商品详情页 -->
        <div class="goods-wrapper" v-if="!scantipOrGoodslist">
          <div class="box" v-for="(item,index) in scanGoodsList" :key="index">
            <div class="goods-img">
              <img src="../../../../static/images/noneOil/0902-img.png" alt="">
              <span class="index-num">{{(index+1) < 10 ? ('0'+ (index+1)) : (index+1)}}</span>
            </div>
            <div class="goods-content">
              <div class="goods-ad">
                <span>{{item.Name}}</span>
                <!-- 按钮 删除 -->
                <i @click="deleteConfirmFunc(item,index)"></i>
              </div>
              <div class="goods-count-handle">
                <span class="unit">¥{{item.Price.toFixed(2)}}/{{item.Unit}}</span>
                <div class="input-number-wrapper">
                  <!-- 按钮 减 -->
                  <i class="decrease"
                     v-preventReClick="500"
                     @click.prevent="goodsDecrease(item, index, $event)"
                     :class="{decrease1:changeImg(item.XsCount)}"
                  ></i>
                  <input class="count-input" type="text" v-model="item.XsCount" maxlength="3" oninput="value=value.replace(/[^\d]/g,'')" @blur="goodsNumChange(item, index)" />
                  <!-- 按钮 加 -->
                  <i class="increase" v-preventReClick="500" @click.prevent="goodsIncrease(item, index, $event)"></i>
                </div>
                <span class="count">¥{{((item.XsCount*10000*item.Price)/10000).toFixed(2)}}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 商品详情页 end -->

        <!--摄像头入口-->
         <p class="barCode" style="position: absolute;top:0;left: 0;opacity: 1" v-if="this.$store.state.isTest">
          <label>
            <input style='background: skyblue' id='inputId' v-model="scanValue" @keyup.enter="scanDoodsCode(scanValue)" autocomplete="off" />
          </label>
        </p>
      </div>
    </div>
    <div class="handle-other clearfloat">
      <p class="use-quan" @click="openCoupon"><i></i><span>使用优惠券</span></p>
      <p class="input-code" @click="codeEntrance"><i></i><span>输入条形码</span></p>
    </div>
    <div class="goods-detail" v-if="scantipOrGoodslist">
      <p>当前购物车为空，请扫码或手动输入商品条形码</p>
    </div>
    <div class="goods-pay-detail" v-if="!scantipOrGoodslist">
      <p class="top"><span class="use-free-pay" v-show="usedCoupon">已用抵扣券 {{couponNum}} 张</span><span class="already-pay">已优惠 ¥ {{totalYhAmounts.toFixed(2)}}</span></p>
      <p class="detail-pay">共 {{totalGoodsQuantities}} 件商品，合计</p>
      <p class="discount">¥ {{sjysAmountsFun}}</p>
      <p class="count">¥ {{totalYsAmount.toFixed(2)}}</p>
      <p class="line"></p>
      <p class="pay-btn" @click="goToPayment">结算</p>
    </div>
    <!-- 正在识别商品loading -->
    <div class="loading-wrappers">
      <el-dialog
        :visible.sync="loadingWrapper"
        center
        :show-close="false"
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
      >
        <i></i>
        <span class="content">正在识别商品</span>
      </el-dialog>
    </div>

    <!-- 正在核销优惠券loading -->
    <div class="loading-wrappers">
      <el-dialog
        :visible.sync="usingCoupon"
        center
        :show-close="false"
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
      >
        <i></i>
        <span class="content">正在核销优惠券，请耐心等待</span>
      </el-dialog>
    </div>
    <!-- 正在核销优惠券loading end -->

    <!-- 扫描优惠券入口 -->
    <coupon v-if="centerDialogVisible" @couponCallBack="couponCallBack" :scanGoodsList="scanGoodsList" :scantipOrGoodslist="scantipOrGoodslist"></coupon>
    <!-- 输入条形码入口 -->
    <noneOilcode v-if="inputCodeEntrance" @codeCallBack="codeCallBack"></noneOilcode>
    <!-- 支付方式入口 -->
    <noneOilpayStyle v-if="selectWayPay" @payStyleCallBack="payStyleCallBack"></noneOilpayStyle>
    <!-- 扫码支付入口 -->
    <noneOilpay v-if="goToPay" @payCallBack="payCallBack" :payDetailObj="payDetailObj"></noneOilpay>
    <!-- 确认商品删除 -->
    <div class="goods-delete-wrapper">
      <el-dialog
        title="是否确定删除商品？"
        :visible.sync="goodsDeleteConfirm"
        center
        :show-close="false"
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
      >
        <span class="confirm-content">删除商品后，请将商品放置回收区域或交给收银员!</span>
        <div class="confirm-btn">
          <span class="cancel-pay" @click="goodsDelete(2)">确定删除({{count1}}s)</span>
          <span class="continue-pay" @click="deleteConfirm(2)">取消</span>
        </div>
      </el-dialog>
    </div>
    <!-- 页面停留过长 -->
    <div class="handle-too-long">
      <el-dialog
        :visible.sync="handleTooLong"
        center
        :show-close="false"
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
        @open="handleStayLong"
      >
        <span class="confirm-content">页面停留时间过长，是否继续结算?</span>
        <div class="confirm-btn">
          <span class="cancel-pay" @click="cancelPay">取消支付({{count1}}s)</span>
          <span class="continue-pay" @click="continuePay">继续结算</span>
        </div>
      </el-dialog>
    </div>
    <!-- 扫描优惠券前的提示框 -->
    <div class="before-scan-quan">
      <el-dialog
        :visible.sync="beforeScanQuan"
        center
        :show-close="false"
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
      >
        <span class="title">请先录入商品后再使用优惠券！</span>
        <div class="close-btn"><span @click="scanQuanBefore">关闭({{count}}s)</span></div>
      </el-dialog>
    </div>
    <!-- 返回按钮 -->
    <back-view @goHome="backHome" @goBack="goBack"></back-view>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Dialog } from 'element-ui'
  Vue.use(Dialog);
  Vue.directive('preventReClick', {
    inserted (el, binding) {
      el.addEventListener('click', () => {
        if (!el.disabled) {
          el.disabled = true
          setTimeout(() => {
            el.disabled = false
          }, binding.value || 2000)
        }
      })
    }
  });
  export default {
    name: "NoneOilIndex",
    components: {
      Coupon: require('./Coupon').default,  // 优惠券组件
      noneOilcode: require('./noneOilcode').default,  // 输入条形码组件
      noneOilpay: require('./noneOilpay').default, // 支付组件
      noneOilpayStyle: require('./noneOilpayStyle').default // 支付方式组件
    },
    data () {
      return {
        centerDialogVisible: false,   // 优惠券入口对话框
        inputCodeEntrance: false,     // 输入条形码入口
        goodsDeleteConfirm: false,    // 商品删除对话框
        handleTooLong: false,         // 页面停留时间过长对话框
        scantipOrGoodslist: true,     // 显示扫码提示页true或商品列表页false
        scanValue: '',                // 扫码值
        scanGoodsList: [],            // 扫码商品信息
        modelState: false,            // 阻止点击模态框遮罩或esc关闭
        count: 120,                   // 页面停留时间太长倒计时（大页面）
        timer: null,                  // 页面停留时间太长倒计时（状态框）
        count1: 15,                   // 删除操作倒计时
        timer1: null,                 // 定时器
        totalGoodsQuantities: 0,      // 总商品数量
        totalYhAmount: 0,             // 商品总优惠金额
        totalYsAmount: 0,             // 商品总应收金额
        totalSjysAmount: 0,           // 总实际应收金额
        comItem: {},                  // 当前操作项商品信息
        comIndex: '',                 // 当前操作项商品下标
        loadingWrapper: false,        // 加载中提示框
        beforeScanQuan: false,        // 扫描优惠券前的提示框
        goToPay: false,               // 去支付入口
        selectWayPay: false,          // 支付方式入口
        payDetailObj: [],             // 传给支付页的数组对象
        WayType: 0,                   // 支付方式选择
        couponNum: 0,                 // 优惠券数量
        couponTotal: 0,               // 优惠券优惠
        usedCoupon: false,            // 使用优惠券后显示
        totalYhAmounts: 0,            // 总优惠（商品+优惠券）
        usingCoupon: false,           // 正在核销优惠券loading
        stationCode: '',              // 油站编码
      }
    },
    watch: {
      totalYsAmount (val) {
        if (this.$store.state.stationData.totalYsMoney !== val) {
          this.cancelECoupon ();
          this.usedCoupon = false;
          this.$store.state.stationData.saleNo = ''
        }
      }
    },
    computed: {
      sjysAmountsFun () {
        let a = (this.totalYsAmount - this.totalYhAmounts).toFixed(2)
        return a
      }
    },
    methods: {
      // 回首页
      backHome () {
        this.$store.state.stationData.saleNo = '';
        this.scanEvent (0);
        this.$router.push({
          name: '首页'
        })
      },
      // 回首页
      goBack () {
        this.$store.state.stationData.saleNo = '';
        this.scanEvent (0);
        this.$router.push({
          name: '首页'
        })
      },
      // 优惠券入口
      openCoupon () {
        window.clearInterval(this.timer);
        this.scanQuanBefore ()
      },
      // 扫描优惠券前的提示框
      scanQuanBefore () {
        if (this.scanGoodsList.length) {
          this.centerDialogVisible = true;
          this.scanEvent (1)
        } else {
          window.clearInterval(this.timer);
          this.beforeScanQuan = !this.beforeScanQuan;
          if (this.beforeScanQuan) {
            this.countDown(5, 2)
          }
        }
      },
      // 输入条形码入口
      codeEntrance () {
        window.clearInterval(this.timer);
        this.inputCodeEntrance = true;
        this.scanEvent (0)
      },
      // 减商品
      goodsDecrease (item, index, event) {
        if (event) {
          if (event.target.disabled) {
            // 点击太频繁了
            console.log('点击太频繁了')
            return
          }
        }
        window.clearInterval(this.timer);
        if (this.scanGoodsList[index].XsCount > 1) {
          this.scanGoodsList[index].XsCount = this.scanGoodsList[index].XsCount - 1;
          this.goodsNumChange(item, index)
        }
      },
      // 加商品
      goodsIncrease (item, index, event) {
        if (event) {
          if (event.target.disabled) {
            // 点击太频繁了
            console.log('点击太频繁了')
            return
          }
        }
        if (item.XsCount < 999) {
          item.XsCount++;
        }
        console.log('item.XsCount',item.XsCount)
        this.loadingWrapper = false;
        this.goodsNumChange(item, index)
      },
      // 弹出商品删除确认提示框
      deleteConfirmFunc (item, index) {
        this.scanEvent (0);
        window.clearInterval(this.timer);
        this.countDownStay(15, 2);
        this.goodsDeleteConfirm = true;
        this.comItem = item;
        this.comIndex = index
      },
      // 删除确认提示框关闭回调
      deleteConfirm (type) {
        window.clearInterval(this.timer);
        window.clearInterval(this.timer1);
        this.goodsDeleteConfirm = false;
        this.scanEvent (1);
        if (type === 2) {
          this.countDown (120)
        }
      },
      // 删除商品
      goodsDelete (val) {
        window.clearInterval(this.timer);
        window.clearInterval(this.timer1);
        this.goodsDeleteConfirm = false;
        this.scanEvent (1);
        if(this.scanGoodsList.length === 0) {
          this.scanEvent (1);
          this.scantipOrGoodslist = true;
          this.usedCoupon = false;
          this.totalYhAmounts = 0;
          this.$store.state.stationData.saleNo = ''
        }
        this.scanGoodsList.splice(this.comIndex, 1);
        if (val === 2) {
          window.clearInterval(this.timer);
          this.countDown (120);
          if(this.scanGoodsList.length === 0) {
            window.clearInterval(this.timer);
            this.handleTooLong = false;
            this.scantipOrGoodslist = true;
            this.usedCoupon = false;
            this.totalYhAmounts = 0;
            this.$store.state.stationData.saleNo = '';
            this.scanEvent (1)
          }
        } else if (val === 3) {
          window.clearInterval(this.timer);
          this.scanGoodsList.length = 0;
          this.handleTooLong = false;
          this.scantipOrGoodslist = true;
          this.usedCoupon = false;
          this.totalYhAmounts = 0;
          this.scanEvent (1)
        }
        this.totalGoodsQuantities = this.totalGoodsQuantities - this.comItem.XsCount;
        this.totalYhAmount = this.totalYhAmount - this.comItem.YhAmount;
        this.totalYsAmount = this.totalYsAmount - this.comItem.YsAmount;
        this.totalSjysAmount = this.totalSjysAmount - this.comItem.SjysAmount
      },
      // 扫码进来的数据
      receivable (item, index) {
        let sumYh = 0, sumYs = 0, numSj = 0, sumNum = 0;
        this.scanGoodsList.forEach((value,i) => {
          sumYh += value.YhAmount;
          sumYs += value.YsAmount;
          numSj += value.SjysAmount;
          sumNum += value.XsCount
        });
        this.totalGoodsQuantities = sumNum; // 扫码进来的总商品数量
        this.totalYhAmount = sumYh; // 扫码进来的总优惠金额
        this.totalSjysAmount = numSj;  // 扫码进来的总实际应收金额
        this.totalYsAmount = sumYs; // 扫码进来的总应收金额
        this.totalYhAmounts = this.totalYhAmount
      },
      // 根据商品条码查询商品信息
      scanDoodsCode (scanValue) {
        this.scanValue = scanValue;
        this.scanEvent (0);
        window.clearInterval(this.timer);
        this.loadingWrapper = true;
        if (this.scanGoodsList.length > 0) {
          for(var i in this.scanGoodsList){
            if(this.scanGoodsList[i].BarCode === this.scanValue || this.scanGoodsList[i].Code === this.scanValue) {
              this.scanEvent (1);
              this.goodsIncrease(this.scanGoodsList[i], i);
              return
            }
          }
        }
        let url = `http://${this.$store.state.stationData.IP2}:21862/sale/api/SelfServiceSale/GetPluByCode`;

        let params1 = {
          "OrgCode": this.stationCode,
          "Code": this.scanValue
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params).then(
          res => {
            if(res.data.IsSuccess === true) {
              this.loadingWrapper = false;
              this.countDown(120);
              this.scantipOrGoodslist = false;
              let posSalPluObj = res.data.Data.PosSalPlu;
              this.scanGoodsList.push(posSalPluObj);
              this.receivable();
              this.scanEvent (1);
            } else {
              this.loadingWrapper = false;
              if (res.data.Message.includes('库存不足')) {
                this.$Toast(res.data.Message);
              } else if (res.data.Message.includes('Object reference not')) {
                this.$Toast(res.data.Message);
              } else {
                this.$Toast("条码有误，未找到对应商品!");
              }
              this.countDown(120);
              let _this = this
              setTimeout(function () {
                _this.scanEvent (1);
              },2000)
            }
          }, error => {
            this.scanEvent (1);
            this.loadingWrapper = false;
            this.$Loading.close();
            this.$Toast("编号：3，请求数据失败! 请您检查设备是否已连接网络！")
            this.writeLog (url)
          })
      },
      // 计算商品优惠（商品数量发生改变重新计算优惠）
      goodsNumChange (item, index) {
        if (item.XsCount === '' || item.XsCount === 0) {
          item.XsCount = 1
        }
        window.clearInterval(this.timer);
        let itemXsCount = item.XsCount, itemBarCode = item.BarCode;
        let url = `http://${this.$store.state.stationData.IP2}:21862/sale/api/SelfServiceSale/CalculateAmount`;
        let params1 = {
          "OrgCode": this.stationCode,
          "ListPlu": [{
            "PluCode": itemBarCode,
            "XsCount": itemXsCount
          }]
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params).then(
          res => {
            this.countDown(120);
            let countObj = res.data.Data;
            item = countObj.ListPosSalPlu[0];
            this.scanGoodsList.splice(index,1,item);
            this.receivable()
          }, error => {
            this.$Loading.close();
            this.$Toast("编号：04，请求数据失败! 请您检查设备是否已连接网络！")
            this.writeLog (url)
          })
      },
      // 首页倒计时
      countDown (timeVal, type) {
        window.clearInterval(this.timer);
        const TIME_COUNT = timeVal;
        this.count = TIME_COUNT;
        this.timer = setInterval(() => {
          if (this.count > 0 && this.count <= TIME_COUNT) {
            this.count--;
            if (this.count === 0) {
              if (type === 2) {
                this.beforeScanQuan = false;
                this.scanEvent (1)
              } else {
                window.clearInterval(this.timer);
                this.handleTooLong = true;
                this.scanEvent (0)
              }
            }
          } else {
            clearInterval(this.timer);
            this.timer = null
          }
        }, 1000)
      },
      // 页面停留时间过长状态框倒计时
      countDownStay (timeVal, type) {
        const TIME_COUNT1 = timeVal;
        this.count1 = TIME_COUNT1;
        this.timer1 = setInterval(() => {
          if (this.count1 > 0 && this.count1 <= TIME_COUNT1) {
            this.count1--;
            if (this.count1 === 0) {
              window.clearInterval(this.timer);
              if (type === 2) {
                this.goodsDelete(2)
              } else {
                this.goodsDelete(3)
              }
            }
          } else {
            clearInterval(this.timer1);
            this.timer1 = null
          }
        }, 1000)
      },
      // 状态框打开时开始倒计
      handleStayLong () {
        window.clearInterval(this.timer);
        this.countDownStay(15, 3)
      },
      // 取消支付
      cancelPay () {
        this.$store.state.stationData.saleNo = '';
        window.clearInterval(this.timer);
        window.clearInterval(this.timer1);
        this.scanGoodsList.length = 0;
        this.handleTooLong = false;
        this.scanEvent (1);
        this.scantipOrGoodslist = true;
        if (this.count1 === 0) {
          this.scanGoodsList.length = 0;
          this.handleTooLong = false;
          this.scantipOrGoodslist = true
        }
      },
      // 继续支付
      continuePay () {
        window.clearInterval(this.timer1);
        this.handleTooLong = false;
        this.countDown(120);
        this.scanEvent (1)
      },
      // 关闭条形码入口
      codeCallBack (msg) {
        if (msg) {
          this.scanDoodsCode (msg)
        }
        this.inputCodeEntrance = false;
        this.countDown(120);
        this.scanEvent (1)
      },
      // 关闭优惠券入口
      couponCallBack (obj) {
        this.scanEvent (1);
        this.centerDialogVisible = false;
        this.countDown(120);
        if (obj.couponStatus) {
          window.clearInterval(this.timer);
          window.clearInterval(this.timer1);
          this.selectWayPay = true
        }
        this.couponTotal = obj.couponTotal;
        this.couponNum = obj.couponNum;
        if (this.couponTotal || this.couponNum) {
          this.totalYhAmounts = this.totalYhAmount + this.couponTotal;
          this.usedCoupon = true
        } else {
          this.usedCoupon = false;
          this.totalYhAmounts = this.totalYhAmount
        }
      },
      // 取消交易
      cancelTrade () {
        window.clearInterval(this.timer);
        this.scanGoodsList.length = 0;
        this.scantipOrGoodslist = true;
        if (this.$store.state.stationData.saleNo) {
          this.cancelECoupon ();
          this.usedCoupon = false;
          this.totalYhAmounts = 0;
          this.$store.state.stationData.saleNo = ''
        }
      },
      // 撤销电子券
      cancelECoupon () {
        let url = `http://${this.$store.state.stationData.IP2}:21862/pay/api/SelfServicePay/CancelECoupon`;
        let params1 = {
          "OrgCode": this.stationCode,
          "SaleNo": this.saleNo,
        };
        let argsStr = JSON.stringify(params1);
        let sign = this.$sign.signArgs(argsStr,0);
        let params = {
          "JsonData": argsStr,
          "Sign": sign
        };
        this.$http.post(url, params)
          .then(res => {
            let rs = res.data;
            if(!rs.ErrorCode){  // 撤销成功
            }else{
            }
          }, error => {
            this.$Toast("编号：10，请求数据失败! 请您检查设备是否已连接网络！")
            this.writeLog (url)
          })
      },
      // 去结算
      goToPayment () {
        window.clearInterval(this.timer);
        this.selectWayPay = true
      },
      // 点击支付方式页面
      payStyleCallBack (val) {
        this.selectWayPay = false;
        this.countDown(120);
        if (val === 0 || val === 1) {
          window.clearInterval(this.timer);
          this.goToPay = true;
          this.payDetailObj = {
            'totalGoodsQuantities': this.totalGoodsQuantities,
            'totalYhAmount': this.totalYhAmounts,
            'totalYsAmount': this.totalYsAmount,
            'totalSjysAmount': this.sjysAmountsFun,
            'scanGoodsList': this.scanGoodsList,
            'typeWay': val,
          }
        }
      },
      // 点击关闭扫码结算页面
      payCallBack () {
        this.goToPay = false;
        this.countDown(120)
      },
      // 减号更换背景图
      changeImg (val) {
        return val === 1;
      },
      // 原生方法获取焦点扫码
      scanEvent (type) {
        let jsonData = {};
        if (type) { // 1是开启
          jsonData.type = 'scancode'  // 开启摄像头
        } else {  // 0是关闭
          jsonData.type = 'closescan'  // 关闭摄像头
        }
        let _this = this;
        this.$Bridgefunc.callBridge('phonebridge', jsonData, function (scanValue) {
          if (scanValue) {
            _this.scanDoodsCode(scanValue);
          }
        });
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
      }
    },
    created () {
      if (this.$store.state.isTest) {
        this.stationCode = '33250001';
      } else {
        this.stationCode = this.$store.state.stationData.code;
      }
    },
    mounted () {
      this.scanEvent (1)
    },
    destroyed () {
      window.clearInterval(this.timer);
      this.scanEvent (0)
    }
  }
</script>

<style scoped lang="stylus">
  /* 确认商品删除 */
  .goods-delete-wrapper,
  .handle-too-long
    >>> .el-dialog
      position absolute
      left: 50%;
      top: 50%;
      margin: -276px 0 0 -457px!important;
      width: 914px
      height: 552px
      border-radius: 12px
      .el-dialog__header
        margin-bottom 25px
        .el-dialog__title
          font-size: 44px
          color: #4b4a48
          line-height: 128px
        .el-icon-close
          font-size: 50px
      .el-dialog__body
        padding: 25px 75px 30px
        .confirm-content
          text-align left
          font-size: 38px
          color: #4b4a48
          line-height: 62px
        .confirm-btn
          display flex
          text-align center
          line-height: 100px
          margin-top 75px
          span
            flex 1
            font-size: 38px
            border-radius 12px
          .cancel-pay
            color: #888888
            margin-right 52px
            border 1px solid #D2D2D2
          .continue-pay
            color: #fff
            background: #39B23F
  /* 确认商品删除 end */

  /* 页面停留过长 */
  .handle-too-long  >>> .el-dialog{
      .el-dialog__header {
        margin-bottom 100px
      }
      .el-dialog__body {
        padding: 40px 75px 30px;
      }
    }
  /* 页面停留过长 end */

  /* 加载中 */
  .loading-wrappers >>> .el-dialog {
      position absolute
      left: 50%;
      top: 50%;
      margin: -276px 0 0 -457px!important;
      width: 914px
      height: 552px
      border-radius: 12px
      .el-dialog__body{
        padding-top 70px
        display flex
        flex-direction column
        text-align center
        i {
          flex: 1
          display inline-block
          width: 222px
          height: 222px
          margin 0 auto
          background: url("../../../../static/images/noneOil/loading.gif") no-repeat
        }
        span {
          flex 1
          font-size: 40px
          line-height: 130px;
        }
      }
    }
  /* 加载中 end */

  /* 扫描优惠券前的提示框 */
  .before-scan-quan >>> .el-dialog {
      position absolute
      left: 50%;
      top: 50%;
      margin: -276px 0 0 -457px!important;
      width: 914px
      height: 552px
      border-radius: 12px
      .el-dialog__body {
        text-align center
        .title {
          font-size: 50px
          line-height: 290px
        }
        .close-btn {
          width: 360px
          height: 100px
          margin 0 auto
          line-height: 100px
          border-radius 12px
          background: #39b23f
          color: #ffffff
          font-size: 50px
        }
      }
  }
  /* 扫描优惠券前的提示框 end */

  .none-oil-header
    height: 148px
    line-height: 148px
    border-bottom 1px solid #ebebed
    .handle-time
      color: #333333
      font-size: 39px
      float: right
      width: 330px
    .logo
      display inline-block
      width: 419px
      height: 103px
      background: url("../../../../static/images/noneOil/img_logo.png") no-repeat center
      background-size: cover;
      vertical-align middle
  .scroll-wrapper
    height: 1200px
    width: 100%
    position: relative;
    overflow: hidden;
    .handle-scan::-webkit-scrollbar {
      display: none;
    }
    .handle-scan { -ms-overflow-style: none; }
    .handle-scan
      text-align center
      padding 23px 30px 0
      height: 1200px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-x: hidden;
      overflow-y: scroll;
      .handle-scan-tips
        padding-top 14px
        .scan-title
          font-size: 60px
          color: #4c4948
          line-height: 150px
        .scan-tip
          font-size: 39px
          color: #4c4948
          margin-bottom 170px
        .scan-img
          margin-bottom 212px
      .goods-wrapper
        width: 100%
        .box
          padding 20px 20px 20px 10px
          text-align left
          border-radius 16px
          background: #fff
          display flex
          margin-bottom 20px
          .goods-content
            flex 1
            display flex
            flex-direction column
            .goods-ad
              flex 1
              display flex
              height: 76px
              span
                flex 1
                font-size: 39px
                color: #4c4948
              i
                box-sizing border-box
                display inline-block
                width: 182px
                height: 60px
                background: url("../../../../static/images/noneOil/btn_delete.png") no-repeat center right
            .goods-count-handle
              display flex
              flex 1
              margin-top 40px
              line-height: 56px
              box-sizing border-box
              .unit
                font-size: 36px
                color: #b7b7b7
              div.input-number-wrapper
                flex 1
                display flex
                text-align center
                .count-input {
                  width: 120px
                  font-size: 39px
                  text-align center
                  color: #4c4948
                }
                span
                  flex 1
                  font-size: 45px
                  color: #4c4948
                  line-height: 60px
                i
                  display inline-block
                  width: 60px
                  height: 60px
                .decrease
                  background: url("../../../../static/images/noneOil/bt_reduce_normal.png") no-repeat
                  background-size cover
                .decrease1
                  background: url("../../../../static/images/noneOil/bt_reduce_Disabled.png") no-repeat
                  background-size cover
                .increase
                  background: url("../../../../static/images/noneOil/btn_add.png") no-repeat
                  background-size cover
              span
                flex 1
                font-size: 38px
                color: #b8b8b8
              .count
                text-align right
                font-size: 45px
                color: #28c228
          .goods-img
            width: 164px
            height: 164px
            margin-right 18px
            position relative
            .index-num {
              position: absolute;
              left: 50%;
              top: 40%;
              transform: translate(-50%);
              font-size: 50px
              color: #fff
            }
  .clearfloat:after
    display: block
    clear: both
    content: ""
    visibility: hidden
    height: 0
  .clearfloat
    zoom: 1
  .handle-other
    background: #E2E2E2
    padding 20px 10px 20px 0
    p
      box-sizing border-box
      width: 286px
      line-height: 78px
      border-radius 8px
      background: #fff
      float: right
      padding-left 20px
      margin-right 18px
      font-size: 36px
      color: #4c4948
    i
      display inline-block
      width: 60px
      height: 60px
      vertical-align middle
      margin-right 8px
    .input-code
      i
        background: url("../../../../static/images/noneOil/icon_BarCode.png") no-repeat 0 1px
    .use-quan
      i
        background: url("../../../../static/images/noneOil/icon_coupons.png") no-repeat 0 1px
  .goods-detail
    line-height: 414px
    font-size: 39px
    text-align center
    color: #888888
  .goods-pay-detail
    text-align center
    .top
      padding: 0 30px;
      display flex
      line-height: 80px
      border-bottom 1px solid #DCDCDC
      span
        flex 1
        font-size: 30px;
        color: #4d4948;
      .use-free-pay
        font-size: 33px
        color: #ff9c01
        text-align left
      .already-pay
        text-align right
        font-size: 33px
        color: #4c4948
    .line
      position absolute
      left: 43%
      bottom: 190px
      margin-left -50px
      width: 250px
      height: 20px
      border-bottom 2px solid #b7b7b7
    .detail-pay
      color: #4c4948
      font-size: 33px
      line-height: 88px
    .discount
      color: #28c228
      font-size: 75px
    .count
      margin-bottom 20px
      color: #b7b7b7
      font-size: 46px
    .pay-btn
      background: #39b240
      border-radius 12px
      margin 0 auto
      width: 640px
      line-height: 118px
      font-size: 45px
      color: #ffffff
      height: 118px
</style>
