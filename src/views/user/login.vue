<template>
  <div class="g-login">
    <div class="login-inner">
      <div class="g-logo"><img src="../../assets/logo.jpg" alt="">北海国际仲裁院</div>
      <div class="login-width">
        <img src="../../assets/cheng.jpg" alt="">
        <div class="login-box">
          <el-form :model="form" :rules="rules" ref="form">
            <el-form-item prop="tel" class="input-box">
              <span><img src="../../assets/user.png" alt=""></span>
              <el-input v-model.trim="form.tel" placeholder="登录名"></el-input>
            </el-form-item>
            <el-form-item prop="pass" class="input-box">
              <span><img src="../../assets/password.png" alt=""></span>
              <el-input type="password" v-model.trim="form.pass" auto-complete="off" placeholder="密码" onpaste="return false" oncontextmenu="return false" oncopy="return false" oncut="return false"></el-input>
            </el-form-item>
            <el-form-item prop="code" class="input-box">
              <span><img src="../../assets/code.png" alt=""></span>
              <el-input class="short-input" placeholder="验证码" v-model.trim="form.code" @keyup.enter.native="login"></el-input>
              <div class="codeImg"><img :src="codeUrl" @click="getCodeUrl" v-if="codeUrl" alt="验证码图片"></div>
            </el-form-item>
            <el-button class="login-submit" type="primary" @click="login" :loading="loading">登录</el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'
export default {
  data() {
    const validateTel = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入账号'))
      } else {
        callback()
      }
    }
    const validateTel2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入手机号码'))
      } else if (!/^1\d{10}$/.test(value)) {
        callback(new Error('请输入正确的手机格式'))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入验证码'))
      } else {
        callback()
      }
    }
    return {
      uuid: '',
      showLogin: false,
      codeUrl: '',
      loading: false,
      form: {
        tel: '',
        pass: '',
        code: ''
      },
      rules: {
        tel: [
          { validator: validateTel, trigger: 'blur' }
        ],
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        code: [
          { validator: validateCode, trigger: 'blur' }
        ]
      },

    }
  },
  methods: {
    getCodeUrl() {
      this.uuid = util.uuidfn();
      this.codeUrl = api.getCodeUrl(this.uuid);
    },
    login() {
      var publicKey=this.PublicKey;  //this.PublicKeyzai 是main.js里面定义的全局变量
      this.$JSEncrypt.setPublicKey(publicKey);
      var form_pass = this.$JSEncrypt.encrypt(this.form.pass)
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          api.userLogin({
            "password": form_pass,
            "username": this.form.tel,
            "uuid": this.uuid,
            "verifyCode": this.form.code
          }).then((res) => {
            this.loading = false
            const data = res.data
            if (data.code === '1') {
              this.$store.commit('set_user_token', data.headerAccessToken)
              this.$store.commit('set_user_name', data.data.realname)
              this.$store.commit('set_email', data.data.email)
              this.$store.commit('set_mobile', data.data.mobile)
              this.$router.push({
                path: '/user/arbitralList'
              })
              if(data.data.authStatus != 1){
                this.$alert('账号邮箱' +data.data.email+ '未验证，暂无法提交仲裁申请','',{
                  type: 'warning'
                })
              }
            } else {
              this.$message.error(data.msg);
              this.form.code = ''
            }
            this.getCodeUrl()
          })
        } else {

          return false
        }
      })
    }
  },
  mounted() {
    this.getCodeUrl();
  }
}

</script>
<style lang="scss" scoped>

</style>
