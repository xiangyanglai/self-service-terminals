<template>
  <transition name="mint-toast-pop">
    <div class="toast-bg" v-if="visible">
      <div class="mint-toast" :class="customClass" :style="{ 'padding': iconSrc === '' ? '10px' : '25px' }">
        <img :src="iconSrc" alt="">
        <span class="mint-toast-text" :style="{ 'padding-top': iconSrc === '' ? '0' : '20px' }">{{ message }}</span>
      </div>
    </div>
    <!-- old -->
   <!-- <div class="mint-toast" v-if="visible" :class="customClass" :style="{ 'padding': iconSrc === '' ? '10px' : '25px' }">
      <img :src="iconSrc" alt="">
      <span class="mint-toast-text" :style="{ 'padding-top': iconSrc === '' ? '0' : '20px' }">{{ message }}</span>
    </div> -->
  </transition>
</template>

<style lang="stylus" scoped>
  @import '~@/common/stylus/variable.styl';
  .mint-toast-pop-enter .mint-toast-pop-leave-active{
    opacity: 0;
  }
  .toast-bg{
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0);
    z-index: 9998;
  }
  .mint-toast{
    position: fixed;
    width: 68%;
    min-height 380px
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    box-sizing: border-box;
    text-align: center;
    z-index: 9999;
    transition: opacity .3s linear;
    display flex
    justify-content center
    align-items center
    flex-direction column
    border-radius 20px
  }
  .mint-toast-icon{
    display: block;
    text-align: center;
    font-size: 56px;
  }
  .mint-toast-text{
    font-size: $font-size-large
    display: block;
    text-align: center;
  }
  .is-placetop{
    top: 80px;
    left: 50%;
    transform: translate(-50%, 0);
  }
  .is-placemiddle{
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .is-placebottom{
    bottom: 80px;
    left: 50%;
    transform: translate(-50%, 0);
  }
</style>

<script type="text/babel">
  export default {
    props: {
      message: String,
      className: {
        type: String,
        default: ''
      },
      position: {
        type: String,
        default: ''
      },
      iconSrc: {
        type: String,
        default: ''
      }
    },

    data() {
      return {
        visible: false
      };
    },
    created () {
    },

    computed: {
      customClass() {
        var classes = [];
        switch (this.position) {
          case 'top':
            classes.push('is-placetop');
            break;
          case 'bottom':
            classes.push('is-placebottom');
            break;
          default:
            classes.push('is-placemiddle');
        }
        classes.push(this.className);

        return classes.join(' ');
      }
    }
  };
</script>
