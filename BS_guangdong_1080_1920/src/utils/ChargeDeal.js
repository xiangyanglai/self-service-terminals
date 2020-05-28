/**
 * Created by steven on 2019/5/30.
 */
var ChargeDeal= {
  dataDeal:function (res) {
    console.log('数据处理'+res);
    res = JSON.parse(res);
    let dic = {};
    dic.code = res.code;
    dic.msg = this.getMsg(parseInt(res.code));
    dic.data = res.data && res.data.length? JSON.parse(decodeURIComponent(res.data)):{};
    return dic;
  },
  getMsg:function(exceptionCode){
    switch(exceptionCode) {
      case -11:
        return "返回非9000数据";
      case -10:
        return "获取jni env失败异常";
      case -9:
        return "关闭串口异常";
      case -8:
        return "打开串口异常";
      case -7:
        return "接收发现异常";
      case -6:
        return "串口参数有误";
      case -5:
        return "串口未打开";
      case -4:
        return "串口异常";
      case -3:
        return "发送发现异常";
      case -2:
        return "接收数据有误";
      case -1:
        return "接收超时";
      case 0:
        return "命令执行成功";
      case 1:
        return "非法命令";
      case 2:
        return "参数错误";
      case 3:
        return "秘钥错误";
      case 4:
        return "响应超时";
      case 5:
        return "无卡";
      case 6:
        return "多卡";
      case 7:
        return "异常卡片";
      case 8:
        return "打开卡片失败";
      case 9:
        return "未打开卡片";
      case 10:
        return "卡片ID错误";
      case 11:
        return "BCC校验错误";
      case 12:
        return "CRC校验错误";
      case 13:
        return "奇偶校验错误";
      case 14:
        return "协议错误";
      case 15:
        return "溢出错误";
      case 16:
        return "位数统计错误";
      case 17:
        return "禁止访问";
      case 18:
        return "系统繁忙";
      case 19:
        return "未知错误";
      case 9000:
        return "操作成功";
      default:
        return "其他错误";
    }
  },

};
// 返回在vue模板中的调用接口
// export default {
//   install: function (Vue,Option) {
//     Object.defineProperty(Vue.prototype,'$util',{ value: util });
//   }
// }
export default ChargeDeal
