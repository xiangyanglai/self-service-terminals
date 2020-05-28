<template>
  <div class="pay-detail-wrapper" >
    <div>
      <p class="icon-wrapper"><img src="../../../static/images/payOrderDetail/icon.png" alt=""></p>
      <div class="detail-wrapper">
        <p class="title">
          <span>支付成功!</span>
          <span>请将小票交予加油员!</span>
        </p>
        <div class="pay-detail">
          <p class="pay-item">
            <span class="real-pay">实收金额（元）</span>
            <span class="real-pay-money">{{hasPayAmount.toFixed(2)}}</span>
          </p>
        </div>
      </div>
      <div class="ticket-wrapper">
        <p class="text-content">如需开发票（已填写手机号），请微信扫描下方二维码或搜索<span>“大家来加油”</span>小程序</p>
        <div><img src="../../../static/images/payOrderDetail/支付结果-1_r2_c2.jpg" alt=""></div>
      </div>
      <div class="evaluation-wrapper">
        <p>请您对我们的服务进行评价哦</p>
        <div class="evaluation-detail">
          <div class="evaluation-detail-content">
            <el-rate
              v-model="evaluationValue1"
              :texts="texts"
              show-text>
            </el-rate>
          </div>
        </div>
        <div class="eva-text-wrapper">
          <span v-for="(item, index) of evaText" :key="index" :class="{btnActive:item.bOn}" @click="evaSelect(index)">{{item.content}}</span>
        </div>
      </div>
      <p class="confirm-button" v-preventReClick="1500" @click.prevent.stop="getSurveyInfoByID($event,1)">确认评价</p>
      <p class="confirm-button back-to-home">
        <span v-show="show" @click.stop="backToHome">首页</span>
        <span v-show="!show" class="count" @click.stop="backToHome">首页 (<strong>{{count}}</strong>s)</span>
      </p>
    </div>
    <el-dialog
      title="评价结果"
      :visible.sync="centerDialogVisible"
      center
      :close-on-click-modal="modelState"
      :close-on-press-escape="modelState"
      :show-close= false
      @close="closeCount"
    >
      <!-- 评价中 -->
      <div v-if="!pingStatus">
        <div class="close-img"  @click.prevent.stop="closeMask1($event,0)">
          <img src="../../../static/images/payorder/btn_close.png" alt="" /></div>
        <div><img src="../../../static/images/payorder/loading.gif" alt="" /></div>
        <span>{{pingtip}}</span>
      </div>
      <!-- 评价成功或失败 -->
      <div v-if="pingStatus">
        <div  class="close-img" @click.stop="closeMask(1)"><img src="../../../static/images/payorder/btn_close.png" alt="" v-if="isShowBtn" /></div>
        <span>{{pingtip}}</span>
        <div class="self-btn">
          <span class="scan-again" v-if="!isShowBtn" @click.stop="closeMask(0)">继续评价(<strong>{{count2}}</strong>s)</span>
          <span class="scan-again" v-if="isShowBtn" @click.stop="closeMask(1)">回首页(<strong>{{count2}}</strong>s)</span>
        </div>
      </div>
    </el-dialog>
    <back-view @goBack="goBack" @goHome="goHome"></back-view>
    <!-- 底部 -->
    <div class="footer">
      <Footer></Footer>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Rate, Dialog } from 'element-ui';
  import Footer from './common/Footer'
  import md5 from 'js-md5';
  Vue.use(Rate);
  Vue.use(Dialog);

  export default {
    name: "PayOrderDetail",
    components: {
      Footer
    },
    data () {
      return {
        payDetail: {},        // 油品信息
        resultObj: {},        // 商品支付详情
        hasPayAmount: '0.01', // 实际支付的金额
        disAmount: '0.01',    // 优惠的金额
        evaluationValue1: 0,  // 选中星星数
        texts: ['很不满意','不满意','基本满意','很不错','棒棒哒'], // 星星评价文字
        pingtip: '评价中',    // 品添加提示语
        centerDialogVisible: false, // 弹出层
        isShowBtn: true,            // 评价弹框按钮
        pingStatus: false,          // 评价状态
        show: true,
        count: '',
        timer: null,
        SurveyInfo: '',       // 问卷信息
        tmid: '',             // 定时器
        acctID: '',           // 手机注册用户id
        clickEvent: false,    // 设置为false,让setInterval执行
        modelState: false,    // 阻止点击模态框遮罩或esc关闭
        evaText: [],          // 评价选填内容
        AnswerContentArr: [],
        AnswerContentStr: [], // 传输后台评价选填内容
        stopPush: false,
        count2: '',
        timer2: null
      }
    },
    computed: {
      // 总金额
      totalAmount () {
        return this.hasPayAmount + this.disAmount
      }
    },
    watch: {
      evaluationValue1 (val) {
        window.clearInterval(this.timer);
        this.countDown(15,val);
        this.evaFun(val)
      }
    },
    methods: {
      // 弹窗关闭回调
      closeCount () {
        window.clearInterval(this.timer);
      },
      // 左下角返回按钮
      goHome () {
        window.clearInterval(this.timer);
        if (!this.evaluationValue1) {
          this.$router.push({
            path: '/'
          });
        } else {
          this.getSurveyInfoByID('', 1, 1);
          this.$router.push({
            path: '/'
          });
        }
      },
      // 左下角返回按钮
      goBack () {
        window.clearInterval(this.timer);
        this.freshCount = null;
        if (!this.evaluationValue1) {
          this.$router.push({
            path: '/'
          });
        } else {
          this.getSurveyInfoByID('', 1, 1);
          this.$router.push({
            path: '/'
          });
        }
      },
      // 点击页面“回首页”按钮
      backToHome () {
        window.clearInterval(this.timer);
        if (!this.evaluationValue1) { // 未选中星星
          this.$router.push({
            path: '/'
          });
        } else { // 选中星星
          this.getSurveyInfoByID('', 1, 1);
          this.$router.push({
            path: '/'
          });
        }
        this.$Loading.close();
      },
      // 倒计时10s 后回到首页
      countDown (timeDetail, val, key) {
        const TIME_COUNT = timeDetail;
        this.count = TIME_COUNT;
        this.show = false;
        this.timer = setInterval(() => {
          if (this.count > 0 && this.count <= TIME_COUNT) {
            this.count--;
            if (key) {
                this.$router.push({
                    path: '/'
                  });
              return
            }
            if (this.count === 0) {
              if (val) { // 选中星星
                this.getSurveyInfoByID('', 1)
              } else { // 未选中星星
                this.$Loading.close();
                window.clearInterval(this.timer);
                  this.$router.push({
                    path: '/'
                  });
              }
            }
          } else {
            this.show = true;
            window.clearInterval(this.timer);
            this.timer = null;
          }
        }, 1000)
      },
      // 倒计时2
      countDown2 (key, errTip) {
        const TIME_COUNT = 10;
        this.count2 = TIME_COUNT;
        this.timer2 = setInterval(() => {
          if (this.count2 > 0 && this.count2 <= TIME_COUNT) {
            this.count2--;
            if (this.count2 ===0 && key === 1) {
              this.centerDialogVisible = false;
              this.$router.push({
                path: '/'
              });
            }
          } else {
            clearInterval(this.timer2);
            this.timer2 = null
          }
        }, 1000)
      },
      // 获取问卷信息
      // type 1正常，0首次评价失败后点击关闭按钮执行  backClick 点击返回触发评价
      getSurveyInfoByID(event, type, backClick) {
        window.clearInterval(this.timer);
        if (event) {
          if (event.target.disabled) {
            return
          }
        }
        if (!this.evaluationValue1) {
          this.$Toast("请先选择星数，才可以评价哦！");
          this.countDown(15)
        } else {
          if (!backClick) { // 非点击返回按钮执行
            this.centerDialogVisible = true;  // 显示评价弹框
          }
          let params1 = {
            SurveyID: '7'
          };
          let argsStr = JSON.stringify(params1);
          let decodeStr = decodeURI(argsStr);   // 逆编译，避免浏览器请求失败
          // 测试
          // let url = `http://10.191.253.231:65501/GDAPITest/FaceSearch/GetSurveyInfoByID?jsonData=${decodeStr}`;
          // 生产
          let url = `${this.$store.state.faceSearch}/GetSurveyInfoByID?jsonData=${decodeStr}`
          let timestamp = this.$util.dateFtt("yyyyMMddhhmmss", new Date());
          let signval = "jsonData=" + argsStr + '&timestamp=' + timestamp + '&secretKey=xi8(I4Y=aFVXSsgX';
          let signMd5 = md5(signval);
          let params = {
            'jsonData': decodeStr
          };
          this.$http.post(
            url, params, {
              headers: {
                'timestamp': timestamp,
                'sign': signMd5
              }
            }) .then(res => {
            if(!res.data.RetCode){
              this.SurveyInfo = JSON.parse(res.data.Data);
              if (!backClick) {
                this.isSubmitSurvey(type, 0) // 是否评价
              } else {
                this.isSubmitSurvey(type, 1) // 是否评价
              }
            }else{
              if (!backClick) {
                if(type){
                  this.centerDialogVisible = false;
                  this.$Toast(res.data.RetMsg)
                }
              }
            }
          }, error => {
            if (!backClick) {
              if(type){
                this.showFail('评价失败')
              }
            }
            this.writeLog (url)
          })
        }
      },
      // 检测是否已经评价
      isSubmitSurvey (type, backClick) {
        window.clearInterval(this.timer);
        let _this = this;
        let params1 = {"TradeNo": this.resultObj.RefueledID};
        let argsStr = JSON.stringify(params1);
        // 测试
        // let url = 'http://10.191.253.231:65501/GDAPITest/FaceSearch/IsSubmitSurvey?jsonData='+ argsStr;
        // 生产
        let url = ''+this.$store.state.faceSearch+'/IsSubmitSurvey?jsonData='+ argsStr;
        let timestamp = this.$util.dateFtt("yyyyMMddhhmmss", new Date());
        let signval = "jsonData=" + argsStr + '&timestamp=' + timestamp + '&secretKey=xi8(I4Y=aFVXSsgX';
        let signMd5 = md5(signval);
        let params = {
          'jsonData': params1
        };
        this.$http.post(
          url, params, {
            headers: {
              'timestamp': timestamp,
              'sign': signMd5
            }
          }) .then(res => {
          let rs = res.data;
          if(rs.Data === "True"){ // 返回true为已经评价，false未评价
            if(type){
              _this.$Loading.close();
              if (!backClick) {
                _this.centerDialogVisible = true;
              }
              _this.pingStatus = true;
              _this.pingtip = '已经评价，无需再次评价';
              _this.isShowBtn = true;
              this.countDown2(1)
            }
          }else{
            if (!backClick) {
              _this.sureEvaluate(type, 0) // 评价
            } else {
              _this.sureEvaluate(type, 1) // 评价
            }
          }
        }, error => {
          if (!backClick) {
            if(type){
              this.showFail('评价失败')
            }
          }
          this.writeLog (url)
        })
      },
      // 去评价
      sureEvaluate (type, backClick) {
        let _this = this;
        if(this.acctID==undefined){
          this.acctID = ''
        }
        let signvals = "UserId="+this.acctID+"&UserType=01&TradeNo="+this.resultObj.RefueledID+"";
        let signs = md5(signvals);
        let params1 = {
          "SurveyID": this.SurveyInfo.SurveyID,
          "UserType": "01",
          "UserID": this.acctID,
          "RefuelType": "1",
          "Channel": "1",
          "TradeNo": this.resultObj.RefueledID,
          "Sign": signs,
          "AnswerList":"[{" +
            "\"QuestionID\":\""+this.SurveyInfo.QuestionList[0].QuestionID+"\"," +
            "\"AnswerContent\":\""+this.AnswerContentStr+"\"," +
            "\"Score\":"+this.evaluationValue1+"" +
            "}]",
          "UniversalCode":this.$store.state.stationData.code,
          "MaterialCode":this.payDetail.GasCode,
          "Qty":this.payDetail.Qty,
          "Amount":this.payDetail.Amount,
          "TTC":this.payDetail.GunNo,
          "RefuelTime":this.payDetail.WorkDay,
          "UserCardNo":"",
          };
        let argsStr = JSON.stringify(params1);
        // 生产地址
        let url = ''+this.$store.state.faceSearch+'/SubmitUserSurveyV2?jsonData='+ argsStr;
        // 测试地址
        // let url = 'http://10.191.253.231:65501/GDAPITest/FaceSearch/SubmitUserSurveyV2?jsonData='+ argsStr;
        let timestamp = this.$util.dateFtt("yyyyMMddhhmmss", new Date());
        let signval = "jsonData=" + argsStr + '&timestamp=' + timestamp + '&secretKey=xi8(I4Y=aFVXSsgX';
        let signMd5 = md5(signval);
        let params = {
          'jsonData': params1
        };
        this.$http.post(
          url, params, {
            headers: {
              'timestamp': timestamp,
              'sign': signMd5
            }
          }) .then(res => {
          let rs = res.data;
          if(type){
            if(!rs.RetCode){
              if (!backClick) {
                _this.centerDialogVisible = true;
              }
              _this.pingStatus = true;
              _this.pingtip ='评价成功！';
              _this.isShowBtn = true;
              _this.$Loading.close();
              this.stopPush = true;
              this.countDown2(1)
            }else{
              if (!backClick) {
                this.showFail(res.data.RetMsg)
              }
            }
          }else{
            this.showFail()
          }
        }, error => {
          if (!backClick) {
            if(type){ this.showFail('评价失败') }
          }
          this.writeLog (url)
        })
      },
      // 评价失败弹窗
      showFail (pingtip) {
        window.clearInterval(this.timer);  // 清除倒计时
        this.centerDialogVisible = true;
        this.pingStatus = true;
        this.pingtip = pingtip;
        this.isShowBtn = false;
        this.$Loading.close();
        this.countDown2()
      },
      // 评价结果弹框  type: 0 继续评价 1回首页
      closeMask (type) {
        window.clearInterval(this.timer);  // 清除倒计时
        this.centerDialogVisible = false;
        this.$Loading.close();
        if(type){ // 关闭弹窗返回首页
          this.$router.push({  // 返回首页
            path: '/'
          })
        } else {
          this.countDown(15,'',1);
        }
      },
      //  2评价中弹框关闭
      closeMask1 (event,type) {
        this.centerDialogVisible = false;
        this.$Loading.close();
        this.getSurveyInfoByID(event, 0);  // 重新评价
        this.$router.push({  // 返回首页
          path: '/'
        })
      },
      // 评价选填内容
      evaFun (key) {
        var evaTextList = [];
        if (key === 0) {
          evaTextList = [];
          this.AnswerContentArr = []
        } else if (key === 1) {
          this.AnswerContentArr = [];
          evaTextList = [
            {content: '态度恶劣', bOn:false},
            {content: '脏乱差洗手间异味', bOn:false},
            {content: '等候时间长', bOn:false},
            {content: '无指引', bOn:false},
            {content: '过度推销', bOn:false}]
        } else if (key === 2) {
          this.AnswerContentArr = [];
          evaTextList = [
            {content: '态度恶劣', bOn:false},
            {content: '脏乱差洗手间异味', bOn:false},
            {content: '等候时间长', bOn:false},
            {content: '无指引', bOn:false},
            {content: '过度推销', bOn:false}]
        } else if (key === 3) {
          this.AnswerContentArr = [];
          evaTextList = [
            {content: '态度一般', bOn:false},
            {content: '一般整洁', bOn:false},
            {content: '需提高效率', bOn:false},
            {content: '有指引', bOn:false}]
        } else if (key === 4) {
          this.AnswerContentArr = [];
          evaTextList = [
            {content: '态度友好', bOn:false},
            {content: '整洁干净洗手间无异味', bOn:false},
            {content: '非常顺畅', bOn:false},
            {content: '指引到位', bOn:false},
            {content: '油品质优量足', bOn:false}
            ]
        } else if (key === 5) {
          this.AnswerContentArr = [];
          evaTextList = [
            {content: '态度友好', bOn:false},
            {content: '整洁干净洗手间无异味', bOn:false},
            {content: '非常顺畅', bOn:false},
            {content: '指引到位', bOn:false},
            {content: '油品质优量足', bOn:false}]
        }
        this.evaText = evaTextList
      },
      // 点击评价选填内容
      evaSelect(index) {
        window.clearInterval(this.timer);  // 清除倒计时
        this.countDown(15);
        this.evaText[index].bOn = !this.evaText[index].bOn;
        if (this.evaText[index].bOn) {
          this.AnswerContentArr.push(this.evaText[index].content);
          this.AnswerContentStr = this.AnswerContentArr.join('|');
        }
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
      this.payDetail = this.$route.params.payDetail; // 油品信息
      this.resultObj = JSON.parse(this.$route.params.resultObj);   // 接收传过来的商品支付详情数据
      this.hasPayAmount = this.resultObj.HasPayAmount;  // 实际支付的金额（元）
      this.disAmount = this.resultObj.DisAmount; // 优惠的金额（元）
      this.acctID = this.$route.params.acctID;
      this.evaFun(0)
    },
    mounted() {
      this.countDown(15);
    },
    destroyed() {
      window.clearInterval(this.timer);  // 清除倒计时
      window.clearInterval(this.timer2);  // 清除倒计时
    }
  }
</script>

<style scoped lang="stylus">
  @import '~@/common/stylus/common.styl';
  /* 服务评价 */
  .evaluation-wrapper >>> .el-rate {
    line-height: 115px;
    .el-rate__item {
      position: relative;
      top: 25px;
      margin-right: 20px;
      .el-icon-star-on:before {
        content: url("../../../static/images/payOrderDetail/icon_rating_selected.png");
      }
      .el-icon-star-off:before {
        content: url("../../../static/images/payOrderDetail/icon_rating_normal.png");
      }
    }
    .el-rate__text {
      color: $fc-48!important;
      font-size: 40px;
    }
  }
  /* 服务评价 end */

  /* 支付结果提示语 */
  .pay-detail-wrapper >>> .el-dialog__wrapper {
    .el-dialog {
      width: 912px;
      height: 582px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius 10px;
      margin: 0!important;
      .el-dialog__header{
        padding-top 56px;
        .el-icon-close {
          margin: 10px 15px 0 0;
        }
        .el-icon-close:before {
          content: url("/static/images/payorder/btn_close.png");
        }
        .el-dialog__title {
          font-size: 45px;
          color: #4c4948;
          font-weight: 500;
        }
      }
      .el-dialog__body {
        padding: 90px 60px 98px;
        font-size: 39px;
        color: #4c4948;
        text-align: center;
        i {
          display: inline-block;
          width: 46px;
          height: 46px;
          vertical-align middle;
        }
        i.fail {
          background: url("/static/images/oil/pay_failure11.png") no-repeat;
        }
        i.succ {
          background: url("/static/images/oil/icon_successful.png") no-repeat;
        }
        span {
          display: inline-block;
          height: 100px;
          line-height: 50px;
        }
      }
      .self-btn {
        margin-top: 90px;
        span {
          display inline-block;
          width: 360px;
          height: 102px;
          line-height: 102px;
          border: 1px solid #6EC773;
          font-size: 39px;
          border-radius: 10px;
        }
        .scan-again {
          color: #39b240;
          margin: 20px;
          cursor pointer
        }
        .scan-again:hover {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          transform: translate3d(0, -2px, 0);
        }
        .scan-again:active {
          color: #ffffff
          background: #39B23F;
          -webkit-transition-duration: 0;
          transition-duration: 0;
          -webkit-box-shadow: rgba(0, 0, 0, 0.2);
          box-shadow: rgba(0, 0, 0, 0.2);
        }
        .check-pay {
          color: #ffffff;
          background: #39b240;
        }
      }
      .close-img{
        position: absolute;
        top: 20px;
        right: 20px;
      }
    }
  }
  /* 支付结果提示语 end */
  .pay-detail-wrapper {
    height: 100%;
    padding-top: 50px;
    text-align: center;
    .icon-wrapper {
      margin-bottom: 30px;
    }
    .detail-wrapper {
      padding: 0 90px 55px;
      .title {
        font-size: $fz45;
        color: $fc-48;
        font-weight: 500;
        margin-bottom: 30px;
        display: flex;
        flex-direction: column;
        span {
          flex: 1;
          line-height: 56px;
        }
      }
      .pay-detail {
        line-height: 60px;
        color: #9EA09F;
        text-align: left;
        border-bottom: 1px solid #C0C0C0;
        padding-bottom: 28px;
        .pay-item {
          display: flex;
          span {
            flex: 1
            font-size: 46px;
          }
        }
        .real-pay {
          color: #9EA09F;
        }
        .real-pay-money {
          color: #4c4948;
          text-align: right;
        }
      }
    }
    .ticket-wrapper {
      .text-content {
        font-size: 36px;
        color: #4c4948;
        padding: 0 88px;
        text-align: left;
        line-height: 56px;
        span {
          color: #fd6802;
        }
      }
    }
    .evaluation-wrapper {
      padding: 65px 0 0 90px;
      color: $fc-48;
      font-size: 40px;
      text-align: left;
      .evaluation-detail {
        overflow: hidden;
        margin-top: 15px;
        .evaluation-detail-content {
          line-height: 115px;
          height: 115px;
          .detail-item {
            float: left;
            margin-right: 125px;
          }
        }
      }
      .eva-text-wrapper {
        height: 355px
        span {
          padding: 25px;
          display: inline-block;
          border-radius: 50px;
          border: 1px solid #888888;
          margin-right: 20px;
          margin-bottom: 25px;
        }
        span:hover {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          transform: translate3d(0, -2px, 0);
        }
      }
    }
    .confirm-button {
      width: 640px;
      line-height: 120px;
      margin: 0 auto;
      color: #39B23F;
      border-radius: 15px;
      border 1px solid #39B23F;
      text-align: center;
      font-size: 42px;
      margin-bottom 10px
      cursor pointer
    }
    .confirm-button:hover {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      transform: translate3d(0, -2px, 0);
    }
    .confirm-button:active {
      color: #ffffff
      background: #39B23F;
      -webkit-transition-duration: 0;
      transition-duration: 0;
      -webkit-box-shadow: rgba(0, 0, 0, 0.2);
      box-shadow: rgba(0, 0, 0, 0.2);
    }
    .back-to-home {
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      border: none;
      color: #38B341;
      background: #fff;
      span {
        display: inline-block;
        width: 100%;
        height: 100%;
        strong {
          display: inline-block;
          width: 55px;
        }
      }
    }
    #footer {
      border-top: 1px solid $bo-color;
    }
    .btnActive {
      background-color: #41b341
      color: #ffffff
    }
  }
</style>
