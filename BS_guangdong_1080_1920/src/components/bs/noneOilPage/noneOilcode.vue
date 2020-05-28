<template>
  <div class="payorder" @click="handleDocumentEvent()">
    <div class="payorder-cont">
      <p class="close-btn"><img @click="closeBtn('')" src="../../../../static/images/payorder/btn_close.png" alt=""></p>
      <!-- 密码框 -->
      <div class="pay-tool" >
        <div class="pay-tool-cont">
          <div class="pay-tool-title border-bottom">
            <img src="../../../../static/images/noneOil/code_icon.png" alt="">
          </div>
          <input class="code-input placeholder" type="text" v-model="codecont" placeholder="请先输入商品包装上的条形码" />
        </div>
        <div class="pay-tool-keyboard">
          <ul>
            <li class="cursor" @click="keyUpHandle($event,index)" v-for="(val,index) in keys" :key="index">
              {{ val }}
            </li>
          </ul>
        </div>
      </div>
      <button class="surebtn" @click="sureBtn">确认</button>
    </div>
  </div>
</template>

<script>
  const keys = () => [1, 2, 3, 4, 5, 6, 7, 8, 9, '清空', 0,'X']; // 声明键盘数值
  export default {
    name: "noneOilcode",
    data () {
      return {
        items: [0, 1, 2, 3, 4, 5],
        keys: keys(),
        Span:-1,
        password: [], // 输入值数组
        codecont: '', // 输入值
        index: '' ,
        showmask: false,  // 弹框背景
        timer: null,
      }
    },
    methods: {
      // 回首页
      backHome() {
        this.$router.push({
          name: '首页'
        })
      },
      goBack () {
        this.$router.go(-1)
      },
      //  页面点击事件,并重新启动倒计时
      handleDocumentEvent () {
        this.show = true;
        this.clickEvent = false;
        window.clearInterval(this.timer);
      },
      // 关闭支付页
      closeBtn (codecont) {
        this.$emit('codeCallBack', codecont)
      },
      keyUpHandle (e) {
        if(e.currentTarget.innerText === '清空'){
          this.clearPasswordHandle(); return
        }
        if(e.currentTarget.innerText === 'X'){
          this.delHandle(); return
        }
        let text = e.currentTarget.innerText;
        let len = this.password.length;
        this.password.push(text);
        this.codecont = this.password.join('').replace(/\s/g, '');
        this.Span = len
      },
      // 清空
      clearPasswordHandle () {
        this.password = [];
        this.codecont = ''
      },
      // 清除
      delHandle () {
        if (this.password.length <= 1) {this.password = [];this.codecont = '' ; return false }
        this.password.pop(); // 删除最后一项
        this.codecont = this.password.join(' ').replace(/\s/g, '');
        this.Span--;
      },
      // 检查输入条形码   // 00131  38318
      checkPassword (codecont) {
        let _this = this;
        if (codecont) {
          _this.closeBtn(codecont)
        } else {
          _this.$Toast('请输入商品条形码！')
        }
      },
      // 点击“确认”
      sureBtn () {
        this.checkPassword(this.codecont)
      },
    },
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/common.styl';

  .payorder {
    width: 100%;
    height: 100%
    text-align: center
    position: fixed
    top: 0
    left: 0
    background-color: rgba(76,73,72,0.5)
    z-index: 99
    .payorder-cont::-webkit-scrollbar{
      display: none;
    }
    .payorder-cont{
      width: calc(100% - 160px)
      height: 70vh
      margin: 0 80px
      padding: 0 65px
      position: absolute
      bottom: 12vh
      background: #ffffff
      border-radius: 15px
      z-index: 999
      overflow scroll
      .close-btn{
        height: 100px
        text-align: right
        img{
          margin: 35px 0
        }
      }
      /* 数字键盘 start */
      .pay-tool {
        width: 100%;
        height: auto;
        margin: 0 auto;
        .pay-tool-cont{
          width: 100%;
          height: auto;
          background: #ffffff;
          border-radius: 0.5rem;
          margin:  0 auto;
          border: 0.1rem solid #fff
        }
        .code-input{
          width: 100%
          height: 130px
          line-height: 130px
          font-size: 34px
          color: #4D4948
          border: 1px solid #BFBFBF
          border-radius: 12px
          text-indent: 1em
          margin-bottom: 50px
        }
        .placeholder::-webkit-input-placeholder {
          color: #CDCBCC;
        }
        .placeholder:-moz-placeholder{
          color: #CDCBCC;
        }
        .placeholder::-moz-placeholder {
          color: #CDCBCC;
        }
        .placeholder:-ms-input-placeholder {
          color: #CDCBCC;
        }
        &-title {
          width: 100%;
          height: auto;
          text-align: center;
          overflow: hidden;
          margin: -50px auto 40px auto;
          img{
             width: 280px
             height: 180px
          }
        }
        &-content {
          .pay-tool-inputs {
            width: 76%;
            height: 6.5rem;
            margin: 0 auto;
            border: 0.1rem solid #979797;
            border-radius: 0.6rem;
            display: flex;
            .item {
              width: 16.66666666%;
              height: 6.3rem;
              border: none;
              border-right: 0.1rem solid #CACACA;
              line-height: 6.3rem;
              text-align: center;
              font-size: 2rem;
              background: #F7F7F7;
              &:last-child {
                border-right: none;
              }
            }
            .item:first-child{
              border-top-left-radius: 0.6rem;
              border-bottom-left-radius: 0.6rem;
            }
            .item:last-child{
              border-top-right-radius: 0.6rem;
              border-bottom-right-radius: 0.6rem;
            }
          }
        }
        .pay-tool-keyboard {
          left: 0;
          bottom: 0;
          width: 100%;
          background: #ffffff;
          ul {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: center
            li {
              width: 31.33333%;
              height: 134px;
              line-height: 134px;
              text-align: center;
              border: none;
              border-radius: 0.5rem;
              border-shadow:0 0.2rem 0.3rem -0.1rem #000;
              background: #F0F2EF;
              margin-bottom: 24px;
              color: #4D4948;
              font-size: 33px
              &:nth-child(2), &:nth-child(5), &:nth-child(8), &:nth-child(11) {
                margin: 0 3%
              }
              &:nth-child(1):active,&:nth-child(2):active,&:nth-child(3):active,&:nth-child(4):active,&:nth-child(5):active,&:nth-child(6):active,&:nth-child(7):active,&:nth-child(8):active,&:nth-child(9):active,&:nth-child(10):active,&:nth-child(11):active,&:nth-child(12):active {
                background-color: #F0FCF0;
                color: #979998
              }
            }
            .icon-del{margin-top: 2rem}
          }
        }
      }
      /* 数字键盘 end */
      .surebtn{
        width: 100%
        height: 120px
        line-height: 120px
        text-align: center
        font-size: 36px
        color: #ffffff
        border-radius: 12px
        background: #39B23F
        margin-top: 55px
      }
    }
  }
</style>
