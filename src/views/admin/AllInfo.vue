<template>
  <div>
    <header class="user-header">
      <el-row class="user-header-inner">
        <el-col :span="4">
          <div class="logo"><img src="../../assets/logo.jpg">北海国际仲裁院</div>
        </el-col>
        <el-col :span="10" :offset="10" style="text-align:right">
          <div class="btnwork">
            <span class="username">
              <em>欢迎登录，</em><b>{{user_fullname}}</b>
            </span>
            <a style="cursor:pointer;margin-right: 10px;display: inline-block;vertical-align: bottom;" @click="goMsg()"><el-badge :value="unreadNO" :hidden="!unreadNO" :max="99"><i class="fa fa-bullhorn" aria-hidden="true"></i>我的消息</el-badge></a>
          </div>
        </el-col>
      </el-row>
    </header>
    <div style="background: #f0f2f5;">
      <div class="info-box">
        <arbitral-info end-Name="admin"></arbitral-info>
      </div>
    </div>
  </div>
</template>
<script>
  import { api } from '@/api'
import arbitralInfo from '@/views/common/arbitralInfo'
export default {
  components: { arbitralInfo },
  data() {
    return {

    }
  },
  computed: {
    user_fullname(){
      return this.$store.state.admin.adminName
    },
    unreadNO(){
      return this.$store.state.unreadNumber
    },
  },
  methods: {
    goMsg(){
      this.$router.push({
        path:'/admin/manage/adminMsg'
      })
    },
    msgUnread() {
      var params = {
        pageSize: 10,
        type: 2,
        pageNo: 1
      }
      api.queryMessageListByType(params).then((res) => {
        if (res.data.code == '1') {
          let data = res.data.data
          let msglenth = data.total;
          if (msglenth > 0) {
            this.$store.commit('setUnreadNumber', msglenth)
          }
        }
      })
    }
  },
  mounted() {
   this.msgUnread()
  }
}

</script>
<style lang="scss" scoped>
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
.info-box{
  padding-top: 30px;
  width: 1152px;
  margin: 20px auto 0;
  background: #fff;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
</style>
