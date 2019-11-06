import Vue from "vue";
import Vuex from "vuex";
import { Message, MessageBox } from 'element-ui'
import createPersistedState from 'vuex-persistedstate'
import router from '@/router'
Vue.use(Vuex);

const admin = {
  state: {
  	adminAccessToken: '',
  	adminName: ''
  },
  mutations: {
  	set_admin_token(state, token) {
  	  state.adminAccessToken = token
  	  localStorage.setItem('adminAccessToken', token)
  	},
  	set_admin_name(state, name) {
  	  state.adminName = name
  	  localStorage.setItem('adminName', name)
  	}
  }
}
const user = {
  state: {
  	userAccessToken: '',
    userName: '',
    email: '',
    mobile: ''
  },
  mutations: {
  	set_user_token(state, token) {
      state.userAccessToken = token
      localStorage.setItem('userAccessToken', token)
    },
    set_user_name(state, name) {
      state.userName = name
      localStorage.setItem('userName', name)
    },
    set_email(state, email) {
      state.email = email
      localStorage.setItem('email', email)
    },
    set_mobile(state, mobile) {
      state.mobile = mobile
      localStorage.setItem('mobile', mobile)
    },
  }
}
export default new Vuex.Store({
  modules: {
    admin: admin,
    user: user
  },
  state: {
    unreadNumber: 0
  },
  mutations: {
    setUnreadNumber(state, number) {
      let n = Number.parseInt(number)
      if(n<0) n = 0
      state.unreadNumber = n
    }
  },
  actions: {
    httpError({ state, commit }, res) {
      console.log('httpError')
      if (res.status === 401) {  // token过期或被顶掉
        Message.error({
          message: res.data?res.data.msg:'登录失效'
        })
        let current = router.history.current
        if (current.meta.hasOwnProperty('user') && current.meta.hasOwnProperty('user') === true) {
          // 判断为用户端
          commit('set_user_token', '')
          router.replace({
            path: '/userLogin'
          })
        }
        else {
          // 管理端
          commit('set_admin_token', '')
          router.replace({
            path: '/arbLogin'
          })
        }
      }
      else if (res.status === 500) {
        MessageBox.alert('500服务器错误','', {
          type: 'error'
        })
      }
      else if (res.status === 504) {
        MessageBox.alert('连接服务器超时','', {
          type: 'error'
        })
      }
      else if (res.status === 408) {
        MessageBox.alert('408请求超时','', {
          type: 'error'
        })
      }
      else if (res.status === 404) {
        MessageBox.alert('404错误','', {
          type: 'error'
        })
      }
    }
  },
  plugins: [createPersistedState()]
});
