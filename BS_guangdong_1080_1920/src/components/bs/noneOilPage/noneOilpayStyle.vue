<template>
  <div class="payorder">
    <!-- 支付方式界面 -->
    <div class="dialog__wrapper">
      <!-- new paystyle created on 2019.07.16-->
      <div class="dialog-new">
        <div class="dialog-title">
          <span class="cancel-btn" @click="closeBtn('')">取消</span>支付方式
        </div>
        <!-- selectWay 0微信，1支付宝 -->
        <div class="dialog-style">
          <div @click="selectWay(0)"></div>
          <div @click="selectWay(1)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "noneOilpayStyle",
    methods: {
      // 回首页
      backHome() {
        this.$router.push({
          name: '首页'
        })
      },
      // 关闭支付页
      closeBtn (paycont) {
        this.$emit('payStyleCallBack', paycont)
      },
      // 支付方式
      selectWay (type) { // type 0微信，1支付宝
        this.closeBtn(type)
      },
    }
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';

  .dialog__wrapper {
    width: 100%
    height: 100%
    max-width: 1080px
    margin: 0 auto
    position: fixed;
    top: 0px;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9998;
    background-color: rgba(76,73,72,0.5)
    .dialog-new{
      position: absolute
      width: 100%
      height: 70vh
      bottom: 0
      background: #ffffff
      z-index: 9999
      .dialog-title {
        display: flex
        justify-content: center
        align-items: center
        height: 150px
        line-height: 150px
        width: 100%
        z-index: 10
        font-size: $font-size-large-l
        border-bottom: 1px solid #ebebeb
        .cancel-btn{
           position: absolute
           left: 60px
           font-size: $font-size-large-x
        }
      }
      .dialog-style{
        width: 100%
        height: 450px
        margin-top: 200px
        background-image: url('../../../../static/images/peystyle_icon.png')
        display: flex
        div{
          width: 100%
        }
      }
    }
  }
</style>
