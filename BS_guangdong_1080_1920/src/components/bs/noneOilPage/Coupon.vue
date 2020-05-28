<template>
  <div class="coupon_wrapper">
    <!-- 优惠券入口 -->
    <div class="el-dialog-wrapper">
      <el-dialog
        :visible.sync="centerDialogVisible"
        width="100%"
        top="350px"
        center
        @close= "couponCallBack(0)"
      >
        <p class="quan-title" @click="cancelECoupon(1)">请扫描优惠券</p>
        <!-- 未扫描优惠券 -->
        <div v-if="!isCoupon" class="coupon">
          <p class="quan-tip">请在加油广东APP [首页]>[领券中心]>点击优惠券，扫描优惠券二维码</p>
          <div class="quan-step"></div>
        </div>
        <!-- 使用券列表 -->
        <div v-if="isCoupon" class="coupon1">
          <div class="coupon-num">已使用<strong> {{couponNum}} </strong>张券，共优惠 <strong>{{couponTotal.toFixed(2)}} </strong>元 <span class="allCancel"  @click="deleteCoupon()">一键撤销</span> </div>
          <div class="coupon-list">
            <p v-for="(item,index) in couponList" :key="index">
              <span class="coupon-content"><i class="img-coupon"></i>{{item.Title}}</span>
              <span class="coupon-amount">-￥{{item.Value.toFixed(2)}}</span>
            </p>
          </div>
          <div class="scan-end-btn" @click="couponCallBack(1)">扫描优惠券完毕，提交支付</div>
        </div>
        <!--摄像头入口  1是支付，0查询-->
         <p class="barCode" v-if="this.$store.state.isTest">
          <label>
            <input id='inputId' v-model="scanValue" @keyup.enter="payECoupon()" autocomplete="off" />
          </label>
        </p>
      </el-dialog>
    </div>
    <!-- 删除提示框 -->
    <div class="delete-dialog-wrapper">
      <el-dialog
        title="是否确定撤销优惠券？"
        :visible.sync="isDeleteCoupon"
        center
        :close-on-click-modal="modelState"
        :close-on-press-escape="modelState"
      >
        <i class="fail"></i>
        <span>优惠券撤销后可再次核销使用</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="noDelete">取消</el-button>
          <el-button  type="primary" @click="sureDelete">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Dialog } from 'element-ui'
  Vue.use(Dialog);

    export default {
      name: "Coupon",
      data () {
        return {
          centerDialogVisible: true,   // 优惠券入口对话框
          isCoupon: false,             // 是否使用了优惠券
          couponList: [],
          scanValue: '',               // 扫码值
          isDeleteCoupon: false,       // 删除弹框
          modelState: false,           // 阻止点击模态框遮罩或esc关闭
          billNo: '',                  // 优惠券号
          couponTotal: 0,              // 总优惠
          couponNum: 0,                // 优惠数目
          totalYsAmount: 0,            // 商品总应收金额
          stationCode: '',             // 油站编码
        }
      },
      props: {
        scanGoodsList: Array,  // 商品信息
        scantipOrGoodslist: Boolean,  // true撤销电子券，false不撤销
      },
      methods: {
        // 点击关闭
        couponCallBack (type) {
          let couponInfo = {
            couponTotal : this.couponTotal,  // 总优惠
            couponNum : this.couponNum,      // 优惠数目
            couponStatus: type,              // 0关闭 1提交支付
          };
          this.$emit('couponCallBack', couponInfo)
        },
        // 系统挂单
        SysSuspendBill (key) {
          let payUrl = `http://${this.$store.state.stationData.IP2}:21862/checkout/api/SelfServiceCheckOut/SuspendBill`;
          let params1 = {
            "OrgCode": this.stationCode,
            "Bill": {
              "Number": null,
              "VipNo": null,
              "PosNo": '9166',
              "ClsCloudUserId": this.$store.state.sysCurrentInfo.ClsCloudUserId,
              "Amount": 0.0,
              "YsAmount": 0.0,
              "SjysAmount": 0.0,
              "YhAmount": 0.0,
              "SsAmount": 0.0,
              "YisAmount": 0.0,
              "DaisAmount": 0.0,
              "ZlAmount": 0.0,
              "ZfAmount": 0.0,
              "PluList": this.scanGoodsList,
              "PayList": [],
              "ECouponList": []
            }
          };
          let argsStr = JSON.stringify(params1);
          let sign = this.$sign.signArgs(argsStr,0);
          let params = {
            "JsonData": argsStr,
            "Sign": sign
          }
          this.$http.post(payUrl, params)
            .then(res => {
              let rs = JSON.parse(res.data.Data);
              this.saleNo = rs.SaleNo;
              this.$store.state.stationData.saleNo = rs.SaleNo;  //保存流水号，使用优惠券后，支付页不用请求流水号
              if (key) {
                this.payECoupon()
              }
            }, error => {
              this.$Toast("编号：5，请求数据失败! 请您检查设备是否已连接网络！")
              this.writeLog (url)
          })
        },
        // 电子券支付
        payECoupon() {
          if (!this.saleNo) {
            this.SysSuspendBill (1)
            return
          }
          this.scanEvent(0);
          this.$Loading.open('优惠券核销中');
          let payECouponUrl = `http://${this.$store.state.stationData.IP2}:21862/pay/api/SelfServicePay/PayECoupon`;
          let params1 = {
            "OrgCode": this.stationCode,
            "SaleNo": this.saleNo,
            "QrCode": this.scanValue
          };
          let argsStr = JSON.stringify(params1);
          let sign = this.$sign.signArgs(argsStr,0);
          let params = {
            "JsonData": argsStr,
            "Sign": sign
          }
          this.$http.post(payECouponUrl, params)
            .then(res => {
              this.scanValue = '';
              if(res.data.IsSuccess === true) {
                this.GetECouponRecored()
              }else {
                this.$Loading.close();
                this.scanEvent(0);
                this.$Toast(res.data.Message);
              }
          }, error => {
            this.$Loading.close();
            this.scanEvent(0);
            this.$Toast("编号：8，请求数据失败! 请您检查设备是否已连接网络！")
            this.writeLog (url)
         })
        },
        // 电子券撤销
        cancelECoupon(type) {  // type 1一键撤销  0金额变化撤销
          if(type){ this.$Loading.open('撤销优惠券中') }
          let url = `http://${this.$store.state.stationData.IP2}:21862/pay/api/SelfServicePay/CancelECoupon`;
          let params1 = {
            "OrgCode": this.stationCode,
            "SaleNo": this.saleNo
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
              this.$Loading.close();
              this.scanEvent(1);
              this.scanValue ='';
              if(!rs.ErrorCode){  // 撤销成功
                this.isCoupon = false;
                this.couponTotal = 0;  // 优惠金额
                this.couponNum = 0; // 优惠数目

                this.GetECouponRecored();  // 核销成功更新电子券
                if(type){
                  this.$Toast('撤销优惠券成功')
                  this.$store.state.stationData.saleNo = '';  // 撤销优惠券后，清空流水号
                  this.saleNo = ''
                }
              }else{
                if(type){ this.$Toast('撤销优惠券失败') }
              }

          }, error => {
              this.$Loading.close();
              this.scanEvent(1);
              this.$Toast("编号：10，请求数据失败! 请您检查设备是否已连接网络！")
              this.writeLog (url)
         })
        },
        // 获取用券记录
        GetECouponRecored() {
          let url = `http://${this.$store.state.stationData.IP2}:21862/pay/api/SelfServiceSale/GetECouponRecored`;
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
              if(res.data.IsSuccess){
                this.$Loading.close();
                let json = res.data.Data;
                this.couponList = json.Items;
                if(json.Count >= 1){
                  this.isCoupon = true;
                  let sum = 0;
                  this.couponList.forEach((item) => {
                     sum += item.Value;
                  });
                  this.couponTotal = sum; // 优惠金额
                  this.couponNum = json.Count // 优惠数目
                }
                this.scanEvent(1)
              }else{
                this.$Loading.close();
                this.scanEvent(1);
                this.$Toast('获取用券记录失败')
              }
          }, error => {
              this.$Toast("编号：9，请求数据失败! 请您检查设备是否已连接网络！")
              this.writeLog (url)
         })
        },
        // 取消撤销优惠券
        noDelete () {
          this.isDeleteCoupon = false
        },
        // 确定撤销优惠券
        sureDelete () {
          this.isDeleteCoupon = false;
          this.cancelECoupon(1)
        },
        // 点击删除优惠券
        deleteCoupon () {
          this.isDeleteCoupon = true
        },
        // 原生方法获取焦点扫码
        scanEvent (type) {
          let jsonData = {};
          if (type) { // 其他是开启
            jsonData.type = 'scancode'  // 开启摄像头
          } else {  // 0是关闭
            jsonData.type = 'closescan'  // 关闭摄像头
          }
          let _this = this;
          this.$Bridgefunc.callBridge('phonebridge', jsonData, function (response) {
            if (response) {
              _this.scanValue = response;
              _this.payECoupon()  // 使用电子券
            }
          });
        },
        // 检查金额是否变化，变化撤销优惠券，重新获取流水号
        checkPriceChange() {
          let saveSumYs = sessionStorage.getItem('saveSumYs');
          if(this.totalYsAmount == saveSumYs){
            this.GetECouponRecored()
          }else{
            this.cancelECoupon(0);
            this.SysSuspendBill();
            sessionStorage.setItem('saveSumYs',this.totalYsAmount)
          }
        },
        // 获取订单总额
        getTotal () {
          let sumYs = 0;
          this.scanGoodsList.forEach((value,i) => {
            sumYs += value.YsAmount;
          });
          this.totalYsAmount = sumYs;
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
      created() {
        if (this.$store.state.isTest) {
          this.stationCode = '33250001';
        } else {
          this.stationCode = this.$store.state.stationData.code;
        }
        this.getTotal();
        if(!this.$store.state.stationData.saleNo){
          this.SysSuspendBill();
          sessionStorage.setItem('saveSumYs',this.totalYsAmount)  // 将订单总额缓存
        }else{
          this.saleNo = this.$store.state.stationData.saleNo;
          this.checkPriceChange()
        }
      },
      mounted() {
        this.scanEvent(1)  // 进入页面开启摄像头
      },
      beforeDestroy() {
        this.scanEvent(0)  // 离开页面关闭摄像头
      },
    }
</script>

<style scoped lang="stylus">
  @import '~@/common/stylus/common.styl';
  /* 优惠券入口 */
  .el-dialog-wrapper >>> .el-dialog {
   padding 157px 60px 44px
   margin 355px auto 0
   border-top-left-radius: 24px;
   border-top-right-radius: 24px;
   .el-dialog__header {
     padding 0
     .el-dialog__close {
       font-size: 70px
       top: 55px
       right: 45px
     }
   }
   .el-dialog__body {
     padding 0
     text-align center
     .quan-title {
       font-size: 54px
       color: #4c4948
       line-height: 100px
     }
     .coupon {
       box-sizing border-box
       text-align left
       .quan-tip {
         font-size: 39px
         color: #979696
         line-height: 50px
       }
       .quan-step {
         height: 1169px
         margin 0 auto
         background: url("../../../../static/images/noneOil/scanstep.jpg") no-repeat center
         background-size cover
         img{
           width 100%
           height auto
         }
       }
     }
     .coupon1 {
       box-sizing border-box
       height 1269px
       .coupon-num {
         text-align left
         font-size: 45px
         color: #4c4948
         line-height: 180px
         .allCancel {
           float: right
           color: #0e0eff
         }
         strong {
           font-weight: 600
         }
       }
       .coupon-list {
         height: 900px
         overflow hidden
         overflow-y: scroll;
         margin-bottom 50px
         p {
           display flex
           line-height: 120px
           border-bottom 1px solid #dcdcdc
           span {
             font-size: 36px
             color: #4c4948
             i {
               display inline-block
               width: 60px
               height: 60px
               vertical-align middle
             }
           }
           .coupon-content {
             text-align left
             flex 2
             i {
               background: url("../../../../static/images/noneOil/img_coupons.png")
               background-size cover
               margin-right 36px
             }

           }
           .coupon-amount {
             text-align right
             flex 1
             i {
               background: url("../../../../static/images/noneOil/btn_delete.png")
               background-size cover
               margin-left 72px
             }

           }
         }
       }
       .coupon-list::-webkit-scrollbar {
         display: none;
       }
       .scan-end-btn {
         width: 640px
         height: 120px
         line-height: 120px
         background: #39B240
         color: #ffffff
         border-radius 12px
         font-size: 45px
         margin 0 auto
       }
     }
     .barCode {
       position absolute
       top:0
       input {
         background: skyblue
         line-height: 50px
         width: 500px
       }
     }
   }

 }
  /* 优惠券入口 end */

  /* 删除弹框提示语 */
  .delete-dialog-wrapper >>> .el-dialog {
    width: 912px
    height: 582px
    position: absolute;
    top: 50%
    left: 50%
    transform: translate(-50%, -50%);
    border-radius 10px
    margin: 0!important
    .el-dialog__header{
      padding-top 56px
      .el-icon-close {
        margin 10px 15px 0 0
      }
      .el-icon-close:before {
        content: url("/static/images/payorder/btn_close.png")
      }
      .el-dialog__title {
        font-size: $fz45
        color: $fc-48
        font-weight 500
      }
    }
    .el-dialog__body {
      padding: 90px 60px 98px;
      font-size: 39px
      color: $fc-48
      text-align: center
      i {
        display inline-block
        width: 40px
        height: 40px
        vertical-align middle
      }
      i.fail {
        background: url("/static/images/payorder/pay_failure11.png") no-repeat
      }
      i.succ {
        background: url("/static/images/payorder/icon_successful.png") no-repeat
      }
      span {
        display inline-block
        height: 100px
        line-height: 50px
      }
    }
    .dialog-footer {
      .el-button {
        width: 360px
        height: 102px
        border 1px solid #6EC773
        font-size: 39px
        border-radius 10px
      }
      .el-button--default {
        color: #39b240
        margin-right 50px
      }
      .el-button--primary {
        color: $fc-white
        background: #39b240
      }
    }
  }
  /* 删除弹框提示语 end */
</style>
