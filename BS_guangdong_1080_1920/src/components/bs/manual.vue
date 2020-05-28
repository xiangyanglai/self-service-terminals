<template>
  <div class="manual">
    <div class="manual-content">
      <div class="manual-text">
        <div class="tips">如需发票请下载“加油广东”APP，“我的发票”里开具发票</div>
        <div class="tag">手册指引</div>
      </div>
      <img class="manual-img" src="../../../static/images/img_guide.jpg" alt=""/>
    </div>
    <back-view @goBack="goBack" @goHome="goHome"></back-view>
  </div>
</template>

<script>
  export default {
    name: "manual",
    components: {},
    data() {
      return {}
    },
    methods: {
      showButton () {
        alert('asdasdad')
      },
      clearLoop () {
        alert('123')
      },
      goHome () {
        this.$router.go(-this.$store.state.pushedLength)
      },
      goBack () {
        this.$store.state.pushedLength--;
        this.$router.go(-1)
      },
    },
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .manual {
    width 100%;
    height 100%
    position relative;
    .manual-text {
      position absolute;
      text-align center;
      top 0;
      left 0;
      width 100%;
    }
    .tips {
      padding 10px;
      background-color $tip-top-bg;
      font-size $font-size-small
    }
    .tag {
      padding 20px;
      color white;
      font-size $font-size-medium
    }
    .manual-img {
      display block;
      width 100%;
      height 100%;
    }
    .tag:active {
      background red
    }
  }
</style>
