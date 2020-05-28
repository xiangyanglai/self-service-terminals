/**Created by steven on 2019/5/23.*/

<template>
  <div class="toptitle">
    <p  class="titledesc" v-if="title">{{title}}</p>
  </div>
</template>

<script>

export default {
  name: "toptitle",
  props: ['title',],
  components: {

  },
  data () {
    return {
    }
  },
  methods: {

  },
  created () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';

  .toptitle {
    width 100%
    height 70px
    overflow hidden
    background-color #F7F7F7;
    .titledesc{
      height 100%;
      line-height 70px;
      text-align center
      font-size $font-size-small;
      color $color-text-l;
    }

  }
</style>
