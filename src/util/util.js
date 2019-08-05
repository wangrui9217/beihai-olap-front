import { Pdf, Word } from '@/const//img'
import DICT from '@/const/dict'
const util = {
  uuidfn() { // uuid
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
  },
  getIcon(name) { // 得到文件类选图标
    var url = ''
    var lastName = name.substring(name.lastIndexOf('.')).toLowerCase()
    if (lastName == '.pdf') {
      url = Pdf
    } else {
      url = Word
    }
    return url
  },
  subtr(arg1, arg2) { // 小数计算
    var r1, r2, m, n;
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
  },
  exchangeIndex(num) { // 数字转换汉字
    num = '' + num;
    if(num.length > 2){
      return num
    }
    var china = new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九');
    var arr = new Array();
    var english = num.split("")
    for (var i = 0; i < english.length; i++) {
      arr[i] = china[english[i]];
    }
    if(arr.length>1){
      arr.splice(1,0,'十')
      if(arr[0]=='一'){
        arr.splice(0,1)
      }
      if(arr[arr.length-1]=='零'){
        arr.splice(arr.length-1,1)
      }
    }
    return arr.join("")
  },
  getStatus(arbStatus) {
    let status = ''
    let arr = DICT.arbStatus
    for (let i = 0, len = arr.length; i < len; i++) {
      let a = arr[i].value.split(',')
      arbStatus = '' + arbStatus
      if (a.indexOf(arbStatus) > -1) {
        status = arr[i].label
        break;
      }
    }
    return status
  },
  formatTime(date, fmt) { //author: meizz 
    var o = {
      "M+": date.getMonth() + 1, //月份 
      "d+": date.getDate(), //日 
      "h+": date.getHours(), //小时 
      "m+": date.getMinutes(), //分 
      "s+": date.getSeconds(), //秒 
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
      "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  },
  prefixInteger(num, length) { //设置前缀0
    return (Array(length).join('0') + num).slice(-length);
  },
  // 格式化数字为金额：每三位加逗号
  toThousands(num) {
    var num = (num || 0).toString(),
      result = '';
    while (num.length > 3) {
      result = ',' + num.slice(-3) + result;
      num = num.slice(0, num.length - 3);
    }
    if (num) { result = num + result; }
    return result;
  },
  encodeHTML(str) {
    if(typeof str === 'string'){
      return str.replace(/\n/g, '<br />')
    }
    else return ''
  },
  decodeTEXT(str) {
    if(typeof str === 'string'){
      return str.replace(/<br \/>/g, '\n')
    }
    else return ''
  }
}

export default util
