import store from "../vuex/store";
import writelog from "./writelog";

var errorLog = {
  logRecord (errMsg) {
    let msg = `errMsg:${errMsg}`;
    let url = `http://${store.state.stationData.IP2}:${store.state.stationData.port2}/sys/api/SelfServiceSystem/WriteLog`;
    let params = {
      OrgCode: store.state.stationData.noOilCode,
      Message: JSON.stringify(msg),
    };
    writelog.post(url, params).then(res => {
    }, error => {
    });
  }
};
export default errorLog
