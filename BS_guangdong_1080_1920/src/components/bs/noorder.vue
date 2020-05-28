<template>
  <div class="noorder">
    <div class="noorder-content">
    <img src="../../../static/images/defaultPage_NoOrder.png" alt=""/>
    <div class="noorder-text">暂无订单,可能您的订单正在加油中！</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "noorder",
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .noorder{
    width 100%;
    height 100%
    justify-content center;
    background-color white;
    align-items center;
    text-align center
    display flex;
    .noorder-content{
      margin-top -260px;
      .noorder-text{
        margin-left 50px;
        font-size $font-size-medium;
      }
    }
  }
</style>
