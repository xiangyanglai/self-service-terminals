/**Created by steven on 2019/5/23.*/

<template>
  <div class="payresult">
    <nav-top @backEvent="$router.go(-1)"></nav-top>
    <nav-content>
      <toptitle title="粤通卡充值不开具发票"></toptitle>
      <div class="top-result">
        <img src="../../assets/icon_failure.png" alt="">
        <p class="title">支付失败</p>
      </div>
      <div class="desc-content">
        <div class="cell">
          <p class="left">粤通卡号</p>
          <p class="right">1100001112321321</p>
        </div>

        <div class="cell">
          <p class="left">充值金额(元)</p>
          <p class="right-deep">20000.00</p>
        </div>
        <div class="cell">
          <p class="left">支付结果</p>
          <p class="right-deep">支付成功</p>
        </div>
        <div class="cell">
          <p class="left">充值后余额</p>
          <p class="right">5000.00</p>
        </div>
        <div class="cell">
          <p class="left">充值前余额</p>
          <p class="right">3000.00</p>
        </div>
        <div class="cell">
          <p class="left">充值时间</p>
          <p class="right">2019/5/13</p>
        </div>
      </div>
      <div class="deal-div">
        <div class="cell">
          <p class="left">中心流水</p>
          <p class="right">1236329168972189</p>
        </div>
        <div class="cell">
          <p class="left">充值流水</p>
          <p class="right">1236329168972189</p>
        </div>
        <div class="cell">
          <p class="left">交易流水</p>
          <p class="right">1236329168972189</p>
        </div>
      </div>
      <p class="optip">发起充值失败，无需再扫码支付，请重新发起充值！</p>

      <p class="btn" @click="recharge">重新充值</p>
      <p class="btn" @click="close">关闭</p>
    </nav-content>

  </div>
</template>

<script>
  import toptitle from '../commonui/common-div/toptitle'

export default {
  name: "payresult",
  components: {
    toptitle,
  },
  data () {
    return {
    }
  },
  methods: {
    recharge:function () {

    },
    close:function () {

    }

  },
  created () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';

  .payresult {
    width 100%
    height 100%
    overflow hidden

    .top-result{
      margin-top 50px
      display flex
      align-items center
      justify-content center
      img{
        width 46px
        height 46px
      }
      .title{
        margin-left 8px
        font-weight $font-weight-x
        font-size $font-size-medium-x
      }
    }
    .desc-content {
      margin 84px 92px 0px 92px
      border-bottom 1px solid  $color-text-lll
      padding-bottom  48px

    }

    .cell {
      display flex
      justify-content space-between
      align-items center
      font-size $font-size-medium

      & + .cell {
        margin-top 48px
      }
      .left {
        color $color-text-l
      }
      .right {
        color $color-text-normal
      }

      .left-deep {
        color $color-text
        font-weight $font-weight-x
        font-size $font-size-medium-x
      }
      .right-deep {
        color $bg-color
        font-weight $font-weight-x
        font-size $font-size-medium-x
      }
    }


    .deal-div{
      margin 48px 92px 0px 92px
      .cell {
        & + .cell {
          margin-top 30px !important
        }
      }
    }
    .optip{
      margin 48px 92px 0px 92px
      color #ff2121
      font-size $font-size-medium-s
      width 100%
    }

    .btn{
      margin 80px 220px 0px 220px
      background-color white
      color $bg-color
      border 2px solid $bg-color
      font-size $font-size-medium-x
      text-align center
      padding 36px 0px
      border-radius 10px
      & + .btn{
        margin-top 60px
      }
    }
  }
</style>
