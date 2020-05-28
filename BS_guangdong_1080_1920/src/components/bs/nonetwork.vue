<template>
  <div class="network-wrap" >
    <div class="botline">
      <common-header @goBack="goBack"><span class="title">连接失败</span></common-header>
    </div>
      <div class="network">
        <img class="network-img" src="../../../static/images/defaultPage_NetworkError.png" alt=""/>
        <div class="network-tip">网络出小差啦，请检查网络是否正常！</div>
        <div class="network-btn cursor" @click="Back1">重新请求网络</div>
      </div>
  </div>
</template>

<script>
  export default {
    name: "network",
    components: {
      CommonHeader: require('./common/CommonHeader').default
    },
    methods: {
      goHome () {
        this.$router.go(-this.$store.state.pushedLength)
      },
      goBack () {
        this.$emit('Back')
      },
      Back1(){
        this.$emit('Back1')
      },
    },
  }
</script>

<style lang="stylus" scoped type="text/stylus">
  @import '~@/common/stylus/variable.styl';
  .cursor:hover{
    cursor: pointer
  }
  .network-wrap {
    width 100%;
    height 100%
    position absolute
    top 0
    left 0
    background white
    overflow hidden;
    .botline{
      border-bottom: 1px solid #ECECEC
    }
    .network{
      text-align center
      .network-img{
        margin-top 100px
      }
      .network-tip{
        font-size: 26px
        color #9fa0a0
      }
      .network-btn{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50%;
        height: 100px;
        font-size: 26px;
        background-color white;
        border-radius 10px;
        border 1px solid $bg-color;
        color $bg-color;
        margin 500px auto 0 auto;
      }
    }
  }
</style>
