/**Created by wenhuarong on 2019/11/07 */

<template>
  <div class="back-view">
    <div class="box">
      <!-- click.stop避免点击穿透 -->
      <div @click.stop="goBack">
        <img class="btn_back" src="static/images/FloatingWin_btn_back_normal.png" alt="">
      </div>
      <div @click.stop="goHome">
        <img class="btn_home" src="static/images/FloatingWin_btn_home_normal.png" alt="">
      </div>
      <div @click.stop="goRefresh">
        <img class="btn_refresh" src="static/images/btn_refresh.png" alt="">
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "backView",
    components: {},
    data() {
      return {}
    },
    methods: {
      goBack () {
        this.$emit('goBack')
      },
      goHome () {
        this.$emit('goHome')
      },
      goRefresh () {
        this.$emit('goRefresh')
      }
    },
    created() {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped type="text/stylus">
  @import "~@/common/stylus/variable.styl"
  .back-view {
    position: absolute;
    bottom: 100px;
    left: 0px;
    z-index: 999;
    .box {
      float: left;
      background: url('../../../../static/images/nav_bg.png') no-repeat;
      text-align center
      height 285px
      border-top-right-radius 12px
      border-bottom-right-radius 12px
      img {
        position relative
      }
      img.btn_back {
        top: 15px
      }
      img.btn_home {
        top: 30px
      }
      img.btn_refresh {
        top: 55px
      }
      .btn_refresh {
        width: 35px
      }
    }
    .btn_back:active{
      background-image: url('../../../../static/images/FloatingWin_btn_back_pressed.png');
    }
    .btn_home:active{
      background-image: url('../../../../static/images/FloatingWin_btn_home_pressed.png');
    }
  }
</style>
