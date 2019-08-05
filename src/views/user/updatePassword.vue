<template>
  <div class="lost-pass" v-loading="loading">
    <div class="reg-width">
      <h2 class="g-title">修改密码</h2>
      <el-container>
        <el-main>
          <el-steps :active="steps" finish-status="success" align-center>
            <el-step title="邮箱认证" description=""></el-step>
            <el-step title="修改密码" description=""></el-step>
            <el-step title="修改成功" description=""></el-step>
          </el-steps>
          <el-form :model="form1" label-position="left" ref="form1" label-width="100px" v-if="steps == 1">
            <el-form-item label="邮 箱" >
              <span>{{email}}</span>
            </el-form-item>
            <el-form-item label="验证码" prop="code" :rules="rules.code">
              <el-input class="short-input" v-model="form1.code" placeholder="输入验证码"></el-input>
              <div class="codeImg"><img :src="codeUrl" alt="验证码图片" @click="getCodeUrl"></div>
            </el-form-item>
            <el-form-item label="邮箱验证码" prop="emailCode" :rules="rules.emailCode">
              <el-input class="short-input" v-model="form1.emailCode" placeholder="邮箱验证码"></el-input>
              <el-button @click.prevent="sendCode()" :type="codeSendedStyle" style="font-size:12px" :loading="buttonloading">{{emailCodeText}}</el-button>
            </el-form-item>
            <p class="tips" v-if="isSended">我们已向<span>{{email}}</span>发送验证码，请登录邮箱获取验证码</p>
            <el-button class="nextStep" type="primary" @click="verifyEmailCode()">下一步</el-button>
          </el-form>
          <el-form :model="form2" label-position="left" ref="form2" label-width="100px" v-else-if="steps == 2">
            <el-form-item label="设置密码" prop="pass" :rules="rules.pass">
              <el-input type="password" v-model="form2.pass" auto-complete="off" placeholder="设置密码" onpaste="return false" oncontextmenu="return false" oncopy="return false" oncut="return false"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass" :rules="rules.checkPass">
              <el-input type="password" v-model="form2.checkPass" auto-complete="off" placeholder="确认密码" onpaste="return false" oncontextmenu="return false" oncopy="return false" oncut="return false" ></el-input>
            </el-form-item>
            <el-form-item label="验证码" prop="code" :rules="rules.code">
              <el-input class="short-input" v-model="form2.code" placeholder="输入验证码" @keyup.enter.native="updatePassword"></el-input>
              <div class="codeImg"><img :src="codeUrl" v-if="codeUrl" alt="验证码图片" @click="getCodeUrl"></div>
            </el-form-item>
            <el-button class="nextStep" type="primary" @click="updatePassword">下一步</el-button>
          </el-form>
          <transition name="el-fade-in-linear" v-else>
            <div class="flex">
              <img src="../../assets/finish-reg.png" alt="">
              <h3>修改密码成功</h3>
              <el-button type="primary" @click="$router.go(-1)">返回</el-button>
            </div>
          </transition>
        </el-main>
      </el-container>
    </div>
  </div>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'

export default {
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请设置密码'))
      } else if (!/^[a-zA-Z\d]{6,20}$/.test(value)) {
        callback(new Error('可使用数字、大写字母、小写字母组合，6-20位'))
      } else {
        if (this.form2.checkPass !== '') {
          this.$refs['form2'].validateField('checkPass')
        }
        callback()
      }
    }
    const validateCheckPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请确认密码'))
      } else if (value !== this.form2.pass) {
        callback(new Error('两次输入的密码不一致!'))
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
      steps: 1, // el-steps参数，设置步骤
      codeUrl: '',
      loading: false,
      buttonloading: false,
      time: 60, // 发送验证码时间间隔
      emailCodeText: '获取验证码',
      isSended: false,
      form1: { // 表单字段
        emailCode: '',
        code: ''
      },
      form2: {
        pass: '',
        checkPass: '',
        code: ''
      },
      // isSendEmail: false,
      rules: {
        emailCode: { required: true, trigger: 'blur', message: '请输入邮箱验证码' },
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validateCheckPass, trigger: 'blur' }
        ],
        code: [
          { validator: validateCode, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    mobile(){
      return this.$store.state.user.mobile
    },
    email(){
      return this.$store.state.user.email
    },
    codeSendedStyle(){
      return this.isSended?'info':'primary'
    }
  },
  methods: {
    getCodeUrl() {
      this.uuid = util.uuidfn()
      this.codeUrl = api.getCodeUrl(this.uuid);
    },
    sendCode() {
      if (!this.isSended) {
        this.$refs['form1'].validate((valid) => {
          this.buttonloading = true
          api.sendEmailUpdatePassword({
            "kaptchaUuid": this.uuid,
            "email": this.email,
            "verifyCode": this.form1.code
          }).then((res) => {
            this.buttonloading = false
            this.getCodeUrl()
            if (res.data.code == '1') {
              this.isSended = true
              this.countDown(this.time)
            } else {
              this.$message.error(res.data.msg);
              this.emailCodeText = '获取验证码'
            }
          })
        })
      }
    },
    updatePassword() {
      this.$refs['form2'].validate((valid) => {
        if (valid) {
          this.loading = true
          var publicKey=this.PublicKey;
            this.$JSEncrypt.setPublicKey(publicKey); 
            var form_checkPass = this.$JSEncrypt.encrypt( this.form2.checkPass)
            var form_pass = this.$JSEncrypt.encrypt( this.form2.pass)
          api.updatePassword({
            "confirmPassword": form_checkPass,
            "password": form_pass,
            "username": this.mobile,
            "uuid": this.uuid,
            "verifyCode": this.form2.code
          }).then((res) => {
            this.loading = false
            const data = res.data
            if (data.code == '1') {
              this.step3()
            } else {
              this.getCodeUrl()
              this.$message.error(data.msg)
            }
          })
        }
      })
    },
    
    verifyEmailCode() {
      this.$refs['form1'].validate((valid) => {
        if (valid) {
          this.loading = true
          api.verifyEmailCode({
            "email": this.email,
            "emailCode": this.form1.emailCode
          }).then((res) => {
            this.loading = false
            this.getCodeUrl()
            if (res.data.code == '1') {
              this.step2()
            } 
            else {
              this.$message.error(res.data.msg)
            }
          })
        }
      })
    },
    countDown(time) {
      if (time > 0) {
        setTimeout(() => {
          time--
          this.emailCodeText = time + '秒后重新获取'
          this.countDown(time)
        }, 1000)
      } else {
        this.isSended = false
        this.emailCodeText = '获取验证码'
      }
    },
    step2() {
      this.steps = 2;
    },
    step3() {
      this.steps = 3;
    }
  },
  mounted() {
    this.getCodeUrl()
  }
}

</script>
<style lang="scss">
.lost-pass {
  .tips{
    font-size: 12px;
    color: #999;
    margin-bottom: 20px;  
    span{
      color: orange;
    }
  }
  .reg-width {
    padding: 50px 0 200px;
    width: 760px;
    margin: auto;
    .reg-select {
      margin-top: 40px;
      text-align: center
    }
    .el-form {
      width: 420px;
      margin: auto;
      padding-top: 50px;
    }
    .flex {
      height: 500px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      img {
        margin-bottom: 20px;
      }
      h3 {
        margin-bottom: 50px;
      }
    }
    .el-step__title.is-process,
    .el-step__head.is-process {
      color: #c0c4cc;
      border-color: #c0c4cc;
    }
    .el-radio-button__inner {
      padding: 15px 74px;
    }
    .nextStep {
      width: 100%;
    }
    .short-input {
      width: 215px;
      float: left;
      margin-right: 3px;
    }
    .short-input+.el-button {
      width: 100px;
      padding-left: 0;
      padding-right: 0;
      text-align: center;
      margin-left: 2px;
    }
    .codeImg {
      width: 100px;
      text-align: center;
      float: right;
      line-height: 0;
      img {
        width: 100%;
        height: 40px;
      }
    }
  }
}

</style>
