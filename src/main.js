
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import JSEncrypt from '@/util/jsencrypt'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.snow.css'
import 'element-ui/lib/theme-chalk/index.css'
import 'font-awesome/css/font-awesome.css'
import 'animate.css'
import * as Quill from 'quill'  //引入编辑器
import './scss/public.scss'
import './style/font.css';
import './style/size.css';
import './style/spacing.css';
import Spacing from './myQuill/spacing.js'
const fonts = ['SimSun', 'SimHei','FangSong','Microsoft-YaHei'];
const fontsizes = ['erhao', 'xiaoer','sanhao','xiaosan'];
const Font = Quill.import('formats/font');
const Size = Quill.import('formats/size');
Font.whitelist = fonts; //将字体加入到白名单
Size.whitelist = fontsizes;
Quill.register(Font, true);
Quill.register(Size, true);
Quill.register("formats/spacing", Spacing, true);

Vue.use(ElementUI)
Vue.use(VueQuillEditor)
Vue.config.productionTip = false
Vue.prototype.GLOBAL = {
	fonts: fonts,
	fontsizes: fontsizes
}
Vue.prototype.$JSEncrypt = new JSEncrypt()
Vue.prototype.PublicKey ='MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCPfoCRJo068xVcIhYnigpb4sxMjSKlkXVZIgl0vTdkdda+Qu8n4VxiLv6P8mHPi9WLZENJQd4kSM6gvSMpm2PtkNRY7aLceTrroPd6tAjKxsa8hvClAFy97OEcpOzi+WqxL8ERSeZ62Rai3fVjIbMP4b1tXaPiUxoPGgdJ74/l/QIDAQAB'
Vue.directive('scroll', {
  bind: (el, binding, vnode) => {
    // 是否执行回调事件
    let eventAction = true
    // 距离底部剩余距离开始触发回调
    let distance = 10 // (unit: px)
    // 监听滚动事件
    el.onscroll = (e) => {
        // 获取当前节点可滚动的距离   节点滚动条总高度 - 节点本身高度
       let scrollHeight = e.target.scrollHeight - e.target.offsetHeight
       // 获取节点剩余可滚动的高度   可滚动距离  -  已经滚动的距离
       let residualHeight = scrollHeight - e.target.scrollTop
       console.log()
      //  滚动到指定区域执行回调事件
       if ((typeof binding.value === 'function') && residualHeight < distance && eventAction) {
        // 执行事件回调函数   如果不明白此处的binding.value的同学请点击上面的链接,自行去官方查看
        binding.value()
        eventAction = false
      }  else if (residualHeight > distance) {
        eventAction = true
      }
    } 
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})