/**
 * Created by steven on 2019/5/30.
 */

import Bridgefunc  from '../../../utils/bridgefunc'
import signFunc  from '../../../utils/sign'
import http from  '../../../utils/http'
import Toast from '../../vendor/toast/index'
import store from '../../../vuex/store'
import Router from 'vue-router'
import Loading from '../../vendor/loading/index'


var charge= {

  cardData:{},
  //发起转账通知
  tranceNotice(initCommandCallBack) {
    debugger
    let url = 'http://' + store.state.YTIP + ':' + store.state.YTPort + '/etc/api/SelfServiceETC/TransactionNotice'
    var info = {
      "CardNo": this.cardData.CardNo,
      "CardNetNo": this.cardData.CardNetNo,
      "CardBalance": this.cardData.CardBalance,
      "MF0015": this.cardData.MF0015,
      "CardValidityStart": this.cardData.CardValidityStart,
      "CardValidityEnd": this.cardData.CardValidityEnd,
      "instructionSet": '',
      "UniversalCode": store.state.stationData.code,
      "OrgCode": store.state.stationData.code,

      "TradeAmount": this.cardData.TradeAmount,
      "DownLimit": this.cardData.AmtLowerLimit,
      "UpperLimit": this.cardData.AmtUpperLimit,
      "ZFCode": '63',
      "ZFName": '粤通卡微信',
      //"OrderPayNo": '4420048'+saleNO,
      "OrderPayNo": store.state.stationData.code + this.cardData.Saleno,
      "Saleno": this.cardData.Saleno,
      "SysMaxAmount": this.cardData.SysMaxAmount
    };
    let sign = signFunc.signArgs(JSON.stringify(info));
    var params = {
      "JsonData": JSON.stringify(info),
      "Sign": sign
    };

    Loading.open();
    http.post(url, params).then(res => {

      Loading.close();
      let data = JSON.parse(res.data.Data);
      console.log('转账通知code:' + data.Code)
      if (data.Code == '00') {
        if(initCommandCallBack){
          initCommandCallBack();
        }
      } else {  //其他错误提示
        Toast(data.Msg)
      }
    }, error => {
      Loading.close() //关闭弹框遮罩
    })
  },
  //获取初始化指令
  GetInitCommand:function(WriteCardBack,RechBack) {
    let RechTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

    let url = 'http://' + store.state.YTIP + ':' + store.state.YTPort + '/etc/api/SelfServiceETC/GetInitCommand'
    var info = {
      "CardNo": this.cardData.CardNo,
      "CardNetNo": this.cardData.CardNetNo,
      "CardBalance": this.cardData.CardBalance,
      "MF0015": this.cardData.MF0015,
      "CardValidityStart": this.cardData.CardValidityStart,
      "CardValidityEnd": this.cardData.CardValidityEnd,
      "instructionSet": this.cardData.instructionSet,
      // "OrgCode": this.cardData.OrgCode,
      "OrgCode": store.state.stationData.code,
      "UniversalCode": store.state.stationData.code,

      "YCRechSerialNo": this.cardData.YCRechSerialNo,
      "CircleSaveAmount": this.cardData.CircleSaveAmount,
      "TraceNo": this.cardData.TraceNo,
      "TradeNo": this.cardData.TradeNo,
      "TradeAmount": this.cardData.TradeAmount,
      "RechTime": RechTime,
      "Saleno": this.cardData.Saleno,
      "TransactionNoticeTime": this.cardData.TransactionNoticeTime
    };
    let sign = signFunc.signArgs(JSON.stringify(info));

    var params = {
      "JsonData": JSON.stringify(info),
      "Sign": sign
    };
    Loading.open();
    http.post(url, params).then(res => {
      Loading.close();
      let data = JSON.parse(res.data.Data);
      console.log('初始化指令code:' + data.Code)
      if (data.Code == '00') {  //初始化指令成功
        if(WriteCardBack){
          WriteCardBack(data.CommandText);
        }
      } else if (data.Code == '-100') {
        Toast(data.Msg)
      } else if (data.Code == '-1') {
        Toast(data.Msg)
      } else {  //其他错误提示
        if(RechBack){
          RechBack();
        }
      }
    }, error => {
      Loading.close();
    })
  },
  //初始化指令成功 去写卡
  async initCommandWithWriteCard(CommandText,callback) {

    //写卡,第二个参数，初始化指令集、验卡返回51情况，写卡时传入true,执行圈存指令时传入false（充值写卡3次）
    let res = await Bridgefunc.writeCard(CommandText);
    console.log('初始化写卡ErrorCode：' + res.Data.Code)
    if (res.Data.Code == '0' || res.Data.Code == '1') {
      let commandText = res.Data.CommandResult; //alert(res.Data.CommandResult)
      if(callback){
        callback(commandText);
      }
    } else {
      Toast(res.Message)
    }
  },

  circleSaveTimes:0,

  //圈存确认前重新读卡
  async CircleSaveReadCard(commandText,cardInfoBack) {
    let data = await Bridgefunc.readCard();
    if(cardInfoBack){
      cardInfoBack(data);
    }
    if (data.ErrorCode == '0') { //0：成功，非0：失败
      let cardBalance = data.Data.CardBalance;
      this.circleSaveTimes = 0;
      this.CircleSaveAffirm(commandText, cardBalance)
    } else {
      Toast(data.Message)
    }
  },
  //获取圈存指令
  GetCircleSaveCommand(commandText,writeBack,rechBack) {

    let url = 'http://' + store.state.YTIP + ':' + store.state.YTPort + '/etc/api/SelfServiceETC/GetCircleSaveCommand'
    var info = {
      "CardNo": this.cardData.CardNo,
      "CardNetNo": this.cardData.CardNetNo,
      "CardBalance": this.cardData.CardBalance,
      "MF0015": this.cardData.MF0015,
      "CardValidityStart": this.cardData.CardValidityStart,
      "CardValidityEnd": this.cardData.CardValidityEnd,
      "instructionSet": this.cardData.instructionSet,
      // "OrgCode": this.cardData.OrgCode,
      "OrgCode": store.state.stationData.code,
      "UniversalCode": store.state.stationData.code,

      "YCConsumeSerialNo": this.cardData.YCConsumeSerialNo,
      "TradeAmount": this.cardData.TradeAmount,
      "CommandResult": commandText,
      "TraceNo": this.cardData.TraceNo,
      "TradeNo": this.cardData.TradeNo,
      "Saleno": this.cardData.Saleno
    };
    let sign = signFunc.signArgs(JSON.stringify(info));
    let params = {
      "JsonData": JSON.stringify(info),
      "Sign": sign
    };

    Loading.open();
    http.post(url, params).then(res => {
      Loading.close();
      let data = JSON.parse(res.data.Data);
      console.log('获取圈存code:' + data.Code);
      if (data.Code == '00') {  //获取圈存指令成功
        if(writeBack){
          writeBack(data.commandText);
        }
      } else if (data.Code == '-100') {
        // this.closeMaskSuccess()
      } else if (data.Code == '-1') {
        // this.closeMaskSuccess()
      } else {  //其他错误提示
        if(rechBack){
          rechBack();
        }
      }
    }, error => {
      Loading.close();
    })
  },

  //获取圈存指令成功写卡
  async getCommandsWithWriteCard(commandText,saveBack) {
    let res = await Bridgefunc.writeCard(commandText);  //写卡
    if (res.Data.Code == '1') {
      let newCommandText = res.Data.CommandResult;
      if(saveBack){
        saveBack(newCommandText);//圈存确认前，重新读卡
      }
    } else {
      Toast(res.Message);
    }
  },
  //冲正
  RechReversal(getBack) {

    let url = 'http://' + store.state.YTIP + ':' + store.state.YTPort + '/etc/api/SelfServiceETC/RechReversal'
    var info = {
      "CardNo": this.cardData.CardNo,
      "CardNetNo": this.cardData.CardNetNo,
      "CardBalance": this.cardData.CardBalance,
      "MF0015": this.cardData.MF0015,
      "CardValidityStart": this.cardData.CardValidityStart,
      "CardValidityEnd": this.cardData.CardValidityEnd,
      "instructionSet": this.cardData.instructionSet,
      // "OrgCode": this.cardData.OrgCode,
      "OrgCode": store.state.stationData.code,
      "UniversalCode": store.state.stationData.code,

      "TradeAmount": this.cardData.TradeAmount,
      "TransactionNoticeTime": this.cardData.TransactionNoticeTime,
      "TraceNo": this.cardData.TraceNo,
      "TradeNo": this.cardData.TradeNo,
      "Saleno": this.cardData.Saleno
    };
    let sign = signFunc.signArgs(JSON.stringify(info));
    var params = {
      "JsonData": JSON.stringify(info),
      "Sign": sign
    };

    http.post(url, params).then(res => {
      Loading.close();
      let data = JSON.parse(res.data.Data);

      if (data.Code == '00') {
        if(getBack){
          getBack();
        }
      } else if (data.Code == '-1') {  //错误提示
        Toast(data.Msg);
      } else {
        Toast(data.Msg);
        //打印小票
        Bridgefunc.printTicket()
      }
    }, error => {
      Loading.close();
    })
  },

  //圈存确认
  CircleSaveAffirm(commandText, cardBalance) {

    let url = 'http://' + store.state.YTIP + ':' + store.state.YTPort + '/etc/api/SelfServiceETC/CircleSaveAffirm'
    var info = {
      "CardNo": this.cardData.CardNo,
      "CardNetNo": this.cardData.CardNetNo,
      "CardBalance": cardBalance,
      "MF0015": this.cardData.MF0015,
      "CardValidityStart": this.cardData.CardValidityStart,
      "CardValidityEnd": this.cardData.CardValidityEnd,
      "instructionSet": this.cardData.instructionSet,
      // "OrgCode": this.cardData.OrgCode,
      "OrgCode": store.state.stationData.code,
      "UniversalCode": store.state.stationData.code,

      "YCConsumeSerialNo": this.cardData.YCConsumeSerialNo,
      "CommandResult": commandText,
      "TraceNo": this.cardData.TraceNo,
      "TradeNo": this.cardData.TradeNo,
      "Saleno": this.cardData.Saleno
    };
    let sign = signFunc.signArgs(JSON.stringify(info));
    var params = {
      "JsonData": JSON.stringify(info),
      "Sign": sign
    };

    Loading.open();
    http.post(url, params).then(res => {
      Loading.close();
      let data = JSON.parse(res.data.Data);
      console.log('圈存确认:' + data); //alert('圈存确认msg:'+data.Msg) ;
      if (data.Code == '00') {  //获取圈存指令成功
        this.cardData = data;
        Toast('充值成功')
        // this.$router.push({
        //   path: 'chargepayresult',
        //   query: {
        //     type: true,
        //     cardData: JSON.stringify(encodeURIComponent())
        //   }
        // })
      } else if (data.Code == '-1') {
        Toast(data.Msg)
        // this.closeMaskSuccess()
      } else if (data.Code == '103' || data.Code == '203') {
        this.circleSaveTimes += 1;
        if(this.circleSaveTimes <= 5){   //返回103重复请求圈存确认5遍
          this.CircleSaveAffirm (commandText,cardBalance)
        }else{
          Toast(data.Msg)
          //  打印小票
          // _this.$print.printTicket(_this.stationInfo,_this.cardData)  //打印粤通卡充值小票
        }
      } else {  //其他错误提示
        Toast(data.Msg)
        // this.closeMaskSuccess()
        // this.$print.printTicket(this.stationInfo,this.cardData)  //打印粤通卡充值小票
      }
    }, error => {
      Loading.close();
    })
  },


  //查询销售明细
  QuerySalBill(saleNO) {
    let url = 'http://' + store.state.YTIP + ':' + store.state.YTPort + '/sale/api/SelfServiceSale/QuerySalBill';
    var info = {
      "Saleno": saleNO,
      "OrgCode": store.state.stationData.code
    };

    let sign = signFunc.signArgs(JSON.stringify(info));
    var params = {
      "JsonData": JSON.stringify(info),
      "Sign": sign
    };
    Loading.open();
    http.post(url, params).then(res => {
      Loading.close();
      let data = JSON.parse(res.data.Data);
      if (res.data.ErrorCode == 0) {
        Bridgefunc.printerTest()
      }
    }, error => {
      Loading.close();
    })
  },

};

export default charge
