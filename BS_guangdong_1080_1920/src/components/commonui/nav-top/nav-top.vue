<template>
  <div class="nav-top " >
    <div class="navcontent" >
      <div v-if="!noTitle" class="title-div"  >{{this.title?this.title:$route.name}}</div>
      <div v-if="!noBack" class="nav-back-btn"  @click="backEvent">
        <img src="./back.png" alt="">
        <p>返回</p>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'nav-top',
    props: ['noTitle', 'noBack','title',],//isMust 无视所有的情况显示出来
    components: {},
    data() {
      return {
      }
    },
    methods: {
      backEvent: function () {

        this.$emit('backEvent')
      }
    },
    created() {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped type="text/stylus">
  @import "~@/common/stylus/variable.styl"
  .nav-top {
    position absolute;
    width 100%;
    height 150px;
    overflow hidden
    font-size 0px;
    z-index 5;

    .navcontent{
      width 100%
      height 100%
      overflow hidden;
      .title-div {
        position absolute;
        left 50px;
        right 50px;
        bottom 0px;
        text-align center;
        font-weight $font-weight-x
        font-size $font-size-medium-x;
        height 100%
        line-height 150px;
      }

      .nav-back-btn {
        position absolute;
        top 0px
        left 0px;
        bottom 0px;
        z-index 10;
        display flex
        align-items center
        justify-content center
        img{
          height 40px
          width 40px
          margin-left 20px
        }
        p{
          font-size $font-size-medium
          margin-left 8px
        }

        //background url("../static/image/mall/nav-back.png")
      }
    }

    .title-right {
      position absolute;
      right 0px;
      width 25px
      bottom 0px;
      text-align center;
      font-weight  $font-weight-m
      font-size $font-size-medium;
      height 100%
    }

  }
</style>
