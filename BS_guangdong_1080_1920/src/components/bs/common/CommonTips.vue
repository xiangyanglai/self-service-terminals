<template>
  <div class="ticket-tip-wrapper">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: "CommonTips"
  }
</script>

<style scoped lang="stylus">
  .ticket-tip-wrapper  >>> .ticket
    color: #39B240
  .ticket-tip-wrapper
    line-height: 66px
    background: #F7F7F7
    font-size: 26px
    color #9fa0a0
    text-align center
</style>
