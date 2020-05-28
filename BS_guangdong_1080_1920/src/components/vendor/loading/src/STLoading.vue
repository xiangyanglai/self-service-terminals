/**Created by steven on 2018/4/25.*/

<template>
  <transition name="st-indicator">
    <!-- new -->
    <div class="ui-loading"  v-show="visible" @touchmove.stop.prevent>
      <div class="loading-bg">
        <i>

        </i>
        <p class="alertmsg" v-if="message">{{message}}</p>
        <div class="ui-loading-mask">
        </div>
      </div>
    </div>
    <!-- old -->
   <!--  <div class="ui-loading"  v-show="visible" @touchmove.stop.prevent>
      <i>

      </i>
      <p class="alertmsg" v-if="message">{{message}}</p>
      <div class="ui-loading-mask">
      </div>
    </div> -->
  </transition>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
  .st-indicator-enter,
  .st-indicator-leave-active {
    opacity: 0;
  }
  .ui-loading{
    transition: opacity .2s linear;
    position:absolute;
    left:0;
    right 0
    top:0;
    bottom 0;
    z-index: 9999;
    .loading-bg{
      width: 64%;
      min-height 380px
      background rgba(35,35,35,0.7);
      border-radius 12px;
      position: absolute;
      z-index: 2
      left:50%
      top 50%
      transform translate(-50%,-50%)
    }
    .ui-loading-mask {
      position:absolute;
      top:0;
      left:0;
      background-color: #000;
      opacity: .2;
      z-index: 1
    }
    i{
      /*height: 50px;width:50px;*/
      height: 155px;width: 155px;
      display: block;
      background: url(loading2.gif) no-repeat center center;
      background-size:100% 100%;
      position: absolute;
      z-index: 2
      left:50%
      top 50%
      transform translate(-50%,-50%)
    }
    .alertmsg{
      width 100%
      height 50px
      text-align center
      /*font-size 16px*/
      font-size 36px
      position: absolute
      top:50%
      /*padding-top 30px*/
      padding-top 80px
      color white
    }
  }


</style>


<script>

  export default {
    name: "stloading",
    components: {

    },
    data () {
      return {
        visible: false,
        message:null
      }
    },
    methods: {

    },
    created () {
    }
  }
</script>
