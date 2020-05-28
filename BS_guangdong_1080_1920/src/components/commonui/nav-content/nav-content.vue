/**Created by liaoyingchao on 2018/10/24.*/

<template>
  <div class="nav-content" >
    <div class="content" :class="{'bt0':!isShowBt}">
      <slot></slot>
    </div>
    <p class="bttip" v-if="isShowBt">佛山加得利油站 &nbsp;&nbsp; 版本号: V1.7.6</p>
  </div>
</template>

<script>
  export default {
    name: "nav-content",
    props: {
      isShowBt: {
        type: Boolean,
        default: true
      },
    },
    components: {},
    data() {
      return {}
    },
    methods: {},
    created() {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped type="text/stylus">
  @import "~@/common/stylus/variable.styl"
  .nav-content {
    position absolute;
    top 150px
    left 0px;
    right 0px;
    bottom 0px;
    overflow hidden;
    .content{
      position absolute;
      top 0px
      left 0px;
      right 0px;
      bottom 50px
      overflow hidden;
    }
    .bt0{
      bottom 0px
    }
    .bttip{
      position absolute
      left 0
      bottom 0
      width 100%
      height 50px
      line-height 50px
      font-size $font-size-small-s
      color $color-text-l
      text-align center
      border-top 1px solid $color-text-lll
    }
  }
</style>
