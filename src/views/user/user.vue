<template>
  <div>
    <header class="user-header">
      <el-row class="user-header-inner">
        <el-col :span="4">
          <div class="logo"><img src="../../assets/logo.jpg">北海国际仲裁院</div>
        </el-col>
        <el-col :span="10" class="nav">
          <router-link v-for="(item,index) in menus" :key="index" :to="item.path" @click="toggle(index)" :class="{'active':index ==checkindex }">{{item.name}}</router-link>
        </el-col>
        <el-col :span="10" style="text-align:right">
          <div class="btnwork">
            <span class="username">
              <em>欢迎登录，</em><b v-if="usernameLenth<=30">{{user_fullname}}</b>
              <el-tooltip v-else effect="light" :content="user_fullname" placement="bottom">
                <b>{{user_fullname}}</b>
              </el-tooltip>
            </span>
            <a style="cursor:pointer;margin-right: 10px;display: inline-block;vertical-align: bottom;" @click="goMsg()"><el-badge :value="unreadNO" :hidden="!unreadNO" :max="99"><i class="fa fa-bullhorn" aria-hidden="true"></i>我的消息</el-badge></a>
            <a style="cursor:pointer" @click.prevent="logout"><i class="fa fa-power-off" aria-hidden="true"></i>退出</a>
          </div>
        </el-col>
      </el-row>
    </header>
    <div class="user-container">
      <div class="user-main">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script>
import { api } from '@/api'
export default {
  data() {
    return {
      // user_fullname: '',
      // usernameLenth: 0,
      menus: [
        {
          path: '/user/arbitralList',
          name: '仲裁请求查询'
        },
        {
          path: '/user/userCenter',
          name: '用户中心'
        },
        {
          path: '/user/msg',
          name: '消息中心'
        }
      ],
      checkindex: 0
    }
  },
  computed: {
    user_fullname(){
      return this.$store.state.user.userName
    },
    unreadNO(){
      return this.$store.state.unreadNumber
    },
    usernameLenth(){
      return this.$store.state.user.userName.replace(/[^\x00-\xff]/g,"01").length
    },
  },
  methods: {
    toggle (index) {
      this.checkindex = index
    },
    logout(){
      api.logout().then(res => {
        this.$store.commit('set_user_token','')
        this.$router.push({
          path: '/userLogin'
        })
      })
    },
    goMsg(){
      this.$router.push({
        path:'/user/msg'
      })
    },
    queryUnread(){
      api.queryMessageListByType({
        pageSize: 10,
        type: 2,
        pageNo: 1
      }).then(res => {
        if(res.data.code == '1'){
          if(res.data.data){
            if(res.data.data.total>0){
              this.$store.commit('setUnreadNumber', res.data.data.total)
            }
          }
        }
        else{
          this.$store.commit('setUnreadNumber', 0)
        }
      })
    }
  },
  mounted() {
    this.queryUnread()
  }
};

</script>
<style scoped lang="scss">
.user-main{
  width: 1152px;
  margin: auto;
  background: #fff;
  box-sizing: border-box;
}
.user-header{
	color:#fff;
	height: 64px;
  line-height: 64px;
	background: #00182e;
	z-index: 1;
  .user-header-inner{
    width: 1152px;
    margin: auto;
    color: rgba(247, 247, 247, 0.65);
    a:hover{
      color: #fff;
    }
  }
}
.user-container{
  background: #f0f2f5;
  padding: 20px 0;
}
.logo{
  line-height: 60px;
  color: #fff;
  font-size: 20px;
  img{
    height: 36px;
    width: auto;
    vertical-align: middle;
    border-radius: 50%;
    margin-right: 5px;
  }
}
.nav{
  a{
    margin-left: 60px;
  }
  .router-link-active{
    color: #fff;
  }
}
.btnwork {
  line-height: 24px;
  padding: 20px 0;
  .username {
    display: inline-block;
    margin-right:15px;
    em{
      font-style: normal;
    }
    b {
      display: inline-block;
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: top;
      font-weight: normal;
    }
  }

  a {
    margin-right: 5px;
  }
  i {
    margin-right: 5px;
  }
}
</style>
