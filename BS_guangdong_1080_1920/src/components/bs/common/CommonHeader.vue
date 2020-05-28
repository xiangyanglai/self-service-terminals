<template>
  <div class="header-wrapper">
    <p class="headerBack" @click="goBack"><span class="iconfont back">&#xe616;</span>返回</p>
    <div class="header-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: "CommonHeader",
    methods: {
      goBack: function () {
        this.$emit('goBack')
      }
    },
  }
</script>

<style scoped lang="stylus">
  .header-content >>> .title
    font-size: 46px
    color: #4b4a48
  .header-wrapper
    text-align center
    line-height: 150px
    background: #fff
    position relative
    .headerBack
      position absolute
      left 28px
      font-size: 42px
      color: #333333
      text-align center
      .back
        color: #343434
        font-size: 42px
    .header-content
      text-align center
</style>
