<template>
  <el-row class="main-content" type="flex" justify="center" align="middle">
    <el-row :gutter="20" type="flex" justify="center" align="middle" class="login-box">
      <el-col :span="24">
        <p class="g-logo"><img src="../../assets/logo.jpg">北海国际仲裁院</p>
        <el-card>
          <p class="logo-center">欢迎登录</p>
          <el-form :model="loginForm" :rules="loginRules">
            <el-form-item prop="username">
              <el-input v-model.trim="loginForm.username" placeholder="用户名">
                <i slot="prefix" class="fa fa-user-o login_icon"></i>
              </el-input>
            </el-form-item>
            <el-form-item prop="pwd">
              <el-input type="password" v-model="loginForm.pwd" auto-complete="off" placeholder="密码">
                <i slot="prefix" class="fa fa-lock fa-lg login_icon"></i>
              </el-input>
            </el-form-item>
            <el-form-item prop="verificationCode">
              <el-input v-model.trim="loginForm.verificationCode" @keydown.enter.native="submitForm()" auto-complete="off" placeholder="验证码">
                <i slot="prefix" class="fa fa-unlock-alt fa-lg login_icon2 login_icon"></i>
                <template slot="append">
                  <img :src="captchaUrl" class="codeImg" v-if="captchaUrl" alt="图形验证码" @click="refreshCode()">
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="remember">
              <el-row>
                <el-col align="middle">
                  <el-button type="primary" size="medium" :class={loginbtn:true} :loading="buttonLoading" @click="submitForm()" class="form-button">登录</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </el-row>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'
export default {
  data() {
    return {
      loginForm: {
        username: '',
        pwd: '',
        verificationCode: '',
        remember: false
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        pwd: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        verificationCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      },
      buttonLoading: false,
      captchaUrl: '',
      uuid: ''
    }

  },
  methods: {
    refreshCode() {
      var uuid = util.uuidfn();
      this.captchaUrl = api.getCodeUrl(uuid)
      this.uuid = uuid;
    },
    submitForm() {

      var publicKey = this.PublicKey;
      this.$JSEncrypt.setPublicKey('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCPfoCRJo068xVcIhYnigpb4sxMjSKlkXVZIgl0vTdkdda+Qu8n4VxiLv6P8mHPi9WLZENJQd4kSM6gvSMpm2PtkNRY7aLceTrroPd6tAjKxsa8hvClAFy97OEcpOzi+WqxL8ERSeZ62Rai3fVjIbMP4b1tXaPiUxoPGgdJ74/l/QIDAQAB');
      var loginForm_pwd = this.$JSEncrypt.encrypt(this.loginForm.pwd)
      if (this.loginForm.username == '') {
        this.$message.error('请填写用户名');
      } else if (this.loginForm.pwd == '') {
        this.$message.error('请填写密码');
      } else if (this.loginForm.verificationCode == '') {
        this.$message.error('请填写验证码');
      } else {
        this.buttonLoading = true;
        api.sysUserLogin({
          "username": this.loginForm.username,
          "password": loginForm_pwd,
          "verifyCode": this.loginForm.verificationCode,
          "uuid": this.uuid
        }).then((res) => {
          this.buttonLoading = false;
          if (res.data.code == '1') { //登录成功
            this.$store.commit('set_admin_token', res.data.headerAccessToken)
            this.$store.commit('set_admin_name', res.data.data.realname)
            this.$router.push({
              path: 'admin/home'
            })
          } else {
            this.loginForm.verificationCode = ''
            this.refreshCode();
            this.$message.error(res.data.msg);
          }
        })
      }
    }


  },
  mounted() {
    this.refreshCode();
  }
}

</script>
<style lang="scss">
.main-content {
  color: red;
  overflow-x: hidden;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  background-image: url(../../assets/admin/login_bg.jpg);
  background-size: cover;
  div.el-input-group__append {
    line-height: 0;
    font-size: 0;
    padding: 0;
  }
}

.page-container {
  margin-top: 150px;
}

.logo-center {
  text-align: center;
  font-size: 20px;
  margin-bottom: 25px;
  font-weight: 700;
  color: #0054A7;
}

.loginbtn {
  width: 100%;
}

.codeImg {
  height: 38px;
  width: 140px;
}

.center {
  img {
    width: 100%;
    margin-bottom: 20px;
  }
}

.login_icon {
  padding-left: 3px;
}

.login_icon2 {
  padding-top: 15px;
}

</style>
