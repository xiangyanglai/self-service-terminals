/**Created by liaoyingchao on 2018/11/14.*/

<template>
  <div class="back-view">
    <div class="box">
      <!-- click.stop避免点击穿透 -->
      <div @click.stop="goBack">
        <img class="btn_back" src="static/images/FloatingWin_btn_back_normal.png">
      </div>
      <div @click.stop="goHome">
        <img class="btn_home" src="static/images/FloatingWin_btn_home_normal.png">
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "back-view",
    components: {},
    data() {
      return {}
    },
    methods: {
      goBack: function () {
        this.$emit('goBack')
      },
      goHome: function () {
        this.$emit('goHome')
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
    /* right: 0px; */
    left: 0px;
    z-index: 999;
    .box {
      float: left;
      background-image: url('../../../../static/images/FloatingWin_bgs.png');
    }
    .btn_back:active{
      background-image: url('../../../../static/images/FloatingWin_btn_back_pressed.png');
    }
    .btn_home:active{
      background-image: url('../../../../static/images/FloatingWin_btn_home_pressed.png');
    }
  }
</style>
