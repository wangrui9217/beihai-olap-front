<template>
  <el-dialog :visible.sync="userInfoDialog" title="完善资料" width="900px" :close-on-click-modal="false" v-loading.fullscreen="loading">
    <div class="editbox">
	    <el-form :model="userCoInfoForm" ref="userInfoForm" label-width="140px">
	      <div class="el-row">
	        <el-col :span="12">
	          <el-form-item label="企业名称：">
	          	<span>{{userCoInfoForm.coName}}</span>
	          </el-form-item>
	        </el-col>
	        <el-col :span="12">
	          <el-form-item label="统一信用代码：">
	          	<span>{{userCoInfoForm.coIdnum}}</span>
	          </el-form-item>
	        </el-col>
          <el-col :span="12">
            <el-form-item label="企业地址" prop="coAdress" :rules="rules.addressRule">
              <el-input v-model.trim="userCoInfoForm.coAdress" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="约定送达地址" prop="coArrivedAddress" :rules="rules.addressRule">
              <el-input v-model.trim="userCoInfoForm.coArrivedAddress" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>  
	        <el-col :span="12">
	          <el-form-item label="邮编" prop="coZipcode" :rules="rules.zipcodeRule">
	            <el-input v-model.trim="userCoInfoForm.coZipcode" placeholder="邮编"></el-input>
	          </el-form-item>
	        </el-col>
	        <el-col :span="12">
	          <el-form-item label="法定代表人" prop="coLegalPerson" :rules="rules.realnameRule">
	            <el-input v-model.trim="userCoInfoForm.coLegalPerson" placeholder="法定代表人"></el-input>
	          </el-form-item>
	        </el-col>
	        <el-col :span="12">
	          <el-form-item label="代表人手机号" prop="coPhone" :rules="rules.phoneRule">
	            <el-input v-model.trim="userCoInfoForm.coPhone" placeholder="手机号"></el-input>
	          </el-form-item>
	        </el-col>
          <el-col :span="12">
            <el-form-item label="代表人身份证号" prop="coLegalPersonIdnum" :rules="rules.coLegalPersonIdnumRule">
              <el-input v-model.trim="userCoInfoForm.coLegalPersonIdnum" placeholder="身份证号"></el-input>
            </el-form-item>
          </el-col>
	        <el-col :span="12">
	          <el-form-item label="法定代表人邮箱" prop="coEmail" :rules="rules.emailRule">
	            {{userCoInfoForm.coEmail}}
	          </el-form-item>
	        </el-col>
	        <el-col :span="24">
	          <el-form-item label="营业执照和身份证明（选填）" class="upload-co-img">
	            <ul>
	              <li>
	                <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userCoInfoForm, 'coLicenceAttach')" list-type="picture-card" :before-upload="imgFilter">
	                  <img class="g-upload-img" v-if="userCoInfoForm.coLicenceAttachUrl" :src="userCoInfoForm.coLicenceAttachUrl" alt="">
	                  <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
	                  <div class="el-upload__tip px12" slot="tip">营业执照</div>
	                </el-upload>
	              </li>
	              <li>
	                <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userCoInfoForm, 'coIdPaperAttach')" list-type="picture-card" :before-upload="imgFilter">
	                  <img class="g-upload-img" v-if="userCoInfoForm.coIdPaperAttachUrl" :src="userCoInfoForm.coIdPaperAttachUrl" alt="">
	                  <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
	                  <div class="el-upload__tip px12" slot="tip">身份证明</div>
	                </el-upload>
	              </li>
	              <li>
	                <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userCoInfoForm, 'coIdAttachFornt')" list-type="picture-card" :before-upload="imgFilter">
	                  <img class="g-upload-img" v-if="userCoInfoForm.coIdAttachForntUrl" :src="userCoInfoForm.coIdAttachForntUrl" alt="">
	                  <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
	                  <div class="el-upload__tip px12" slot="tip">身份证正面</div>
	                </el-upload>
	              </li>
	              <li>
	                <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userCoInfoForm, 'coIdAttachRear')" list-type="picture-card" :before-upload="imgFilter">
	                  <img class="g-upload-img" v-if="userCoInfoForm.coIdAttachRearUrl" :src="userCoInfoForm.coIdAttachRearUrl" alt="">
	                  <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
	                  <div class="el-upload__tip px12" slot="tip">身份证反面</div>
	                </el-upload>
	              </li>
	            </ul>
	            <div class="px12">只能上传jpg/png/pdf文件，且不超过10M</div>
	          </el-form-item>
	        </el-col>
	      </div>
	    </el-form>
	    <div class="openAgent" @click="openAgent" v-if="hideAgent">+ 添加代理人</div>
	    <div class="agent-box" v-else>
	      <h3>代理人信息 <span @click="deleteAgent" class="delete-agent">删除代理人</span></h3>
	      <el-form :model="userAgentInfoRequest" ref="userAgentInfoRequest" label-width="140px" >
	        <div class="el-row">
	          <el-col :span="12">
	            <el-form-item label="姓名：" prop="agentRealname" :rules="rules.realnameRule">
	              <el-input v-model.trim="userAgentInfoRequest.agentRealname" placeholder="请输入"></el-input>
	            </el-form-item>
	          </el-col>
	          <el-col :span="12">
	            <el-form-item label="职务：" prop="agentJob" :rules="rules.agentJobRule">
	              <el-input v-model.trim="userAgentInfoRequest.agentJob" placeholder="请输入"></el-input>
	            </el-form-item>
	          </el-col>
            <el-col :span="12">
              <el-form-item label="手机号：" prop="agentPhone" :rules="rules.phoneRule">
                <el-input v-model.trim="userAgentInfoRequest.agentPhone" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
	          <el-col :span="12">
	            <el-form-item label="执业证号：">
	              <el-input v-model.trim="userAgentInfoRequest.agentIdnum" placeholder="请输入"></el-input>
	            </el-form-item>
	          </el-col>
	          <el-col :span="12">
	            <el-form-item label="邮箱（选填）：" prop="agentMail" :rules="emailRule">
	              <el-input v-model.trim="userAgentInfoRequest.agentMail" placeholder="请输入"></el-input>
	            </el-form-item>
	          </el-col>
	          <el-col :span="24">
	            <el-form-item label="身份证（选填）" class="upload-co-img">
	              <ul>
	                <li>
	                  <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentLawyerAttach')" list-type="picture-card" :before-upload="imgFilter">
	                    <img class="g-upload-img" v-if="userAgentInfoRequest.agentLawyerAttachUrl" :src="userAgentInfoRequest.agentLawyerAttachUrl" alt="">
	                    <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
	                    <div class="el-upload__tip px12" slot="tip">律师证照片</div>
	                  </el-upload>
	                </li>
	                <li>
	                  <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentProxyAttach')" list-type="picture-card" :before-upload="imgFilter">
	                    <img class="g-upload-img" v-if="userAgentInfoRequest.agentProxyAttachUrl" :src="userAgentInfoRequest.agentProxyAttachUrl" alt="">
	                    <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
	                    <div class="el-upload__tip px12" slot="tip">授权委托书</div>
	                  </el-upload>
	                </li>
	                <li>
	                  <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentCounselAttach')" list-type="picture-card" :before-upload="imgFilter">
	                    <img class="g-upload-img" v-if="userAgentInfoRequest.agentCounselAttachUrl" :src="userAgentInfoRequest.agentCounselAttachUrl" alt="">
	                    <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
	                    <div class="el-upload__tip px12" slot="tip">律所所函</div>
	                  </el-upload>
	                </li>
	                <li>
	                  <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentIdAttachFornt')" list-type="picture-card" :before-upload="imgFilter">
	                    <img class="g-upload-img" v-if="userAgentInfoRequest.agentIdAttachForntUrl" :src="userAgentInfoRequest.agentIdAttachForntUrl" alt="">
	                    <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
	                    <div class="el-upload__tip px12" slot="tip">身份证正面</div>
	                  </el-upload>
	                </li>
	                <li>
	                  <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentIdAttachRear')" list-type="picture-card" :before-upload="imgFilter">
	                    <img class="g-upload-img" v-if="userAgentInfoRequest.agentIdAttachRearUrl" :src="userAgentInfoRequest.agentIdAttachRearUrl" alt="">
	                    <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
	                    <div class="el-upload__tip px12" slot="tip">身份证反面</div>
	                  </el-upload>
	                </li>
                  <li>
                    <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentJobAttach')" list-type="picture-card" :before-upload="imgFilter">
                      <img class="g-upload-img" v-if="userAgentInfoRequest.agentJobAttachUrl" :src="userAgentInfoRequest.agentJobAttachUrl" alt="">
                      <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                      <div class="el-upload__tip px12" slot="tip">职务证明</div>
                    </el-upload>
                  </li>
                  <li>
                    <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentContractAttach')" list-type="picture-card" :before-upload="imgFilter">
                      <img class="g-upload-img" v-if="userAgentInfoRequest.agentContractAttachUrl" :src="userAgentInfoRequest.agentContractAttachUrl" alt="">
                      <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                      <div class="el-upload__tip px12" slot="tip">劳动合同</div>
                    </el-upload>
                  </li>
                    
	              </ul>
	              <div class="px12">只能上传jpg/png/pdf文件，且不超过10M</div>
	            </el-form-item>
	          </el-col>
	        </div>
	      </el-form>
	    </div>
	  </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="userInfoDialog = false">取 消</el-button>
      <el-button type="primary" @click="editCoInfo">提交</el-button>
    </span>
  </el-dialog>
</template>
<script>
  import { api } from '@/api'
  import Rules from '@/util/rules'
  import util from '@/util/util'
  import VDistpicker from 'v-distpicker'
export default {
  components: { VDistpicker },
  data() {
    return {
      loading: false,
      userInfo: {},
      agentInfo: {},
      userInfoDialog: false, // 修改个人资料dialog
      uploadUrl: api.uploadURL,
      rules: Rules,
      tableData: [],
      total: 0,
      pageNo: 1,
      userAgentInfoRequest: {
        agentPhone: ''
      },
      userCoInfoForm: {
        coAdress: '', // 企业地址
        coArrivedAddress: '',
        coArrivedCity: '',
        coArrivedTown: '',
        coEmail: '',
        coLegalPerson: '', // 企业法人
        coLegalPersonIdnum: '', // 企业法人idNum
        coLicenceAttach: '', // 企业营业执照
        coLicenceAttachUrl: '',
        coName: '',
        coIdnum: '',
        coCity: '',
        coTown: '',
        coJob: '',
        coPhone: '',
        coLegalPersonIdnum: '',
        coZipcode: "", // 邮编
        coType: 2
      },
      hideAgent: true,
      emailRule: { type: 'email', message: '邮箱格式错误，请录入正确的邮箱', trigger: 'blur' }
    }
  },
  computed: {
  	headers(){
  	  return {
        Authorization: this.$store.state.user.userAccessToken
      }
  	}
  },
  methods: {
  	openAgent(){
      this.hideAgent = !this.hideAgent
    },
    deleteAgent(){
      this.$confirm('确定删除代理人吗？','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if(this.userAgentInfoRequest.id){
          this.loading = true
          api.adminDelAgent({
            id: this.userAgentInfoRequest.id
          }).then(res => {
            this.loading = false
            if(res.data.code === '1'){
              this.$refs["userAgentInfoRequest"].resetFields();
              this.userAgentInfoRequest = {}
              this.hideAgent = !this.hideAgent
            }
            else{
              this.$message.error(res.data.msg)
            }
          })
        }
        else{
          this.$refs["userAgentInfoRequest"].resetFields();
          this.userAgentInfoRequest = {}
          this.agentInfo = {}
          this.hideAgent = !this.hideAgent
        }
      }).catch(() => {})
    },
    openUserInfo(){
      if(Object.keys(this.userInfo).length === 0){
        this.getUserCoInfo()
        this.getLoginUserAgentInfo()
      }
      else{
      	this.userCoInfoForm = Object.assign({}, this.userInfo)
      	this.userAgentInfoRequest = Object.assign({}, this.agentInfo)
      }
      this.userInfoDialog = true
      this.$nextTick(() => {
        this.$refs["userInfoForm"].clearValidate()
        if(this.$refs["userAgentInfoRequest"]){
          this.$refs["userAgentInfoRequest"].clearValidate()
        }
      })
    },
    getLoginUserAgentInfo(){
  	  api.getLoginUserAgentInfo({}).then(res => {
      	if(res.data.code === '1'){
      	  if(res.data.data && res.data.data.agentRealname){
            let userAgentInfo = res.data.data
            let attaches = ['agentLawyerAttach','agentProxyAttach','agentCounselAttach','agentIdAttachFornt','agentIdAttachRear','agentJobAttach', 'agentContractAttach']
            userAgentInfo = this.setAttachIcons(userAgentInfo, attaches)
            this.agentInfo = userAgentInfo
            this.userAgentInfoRequest = Object.assign(this.userAgentInfoRequest, userAgentInfo)
            this.hideAgent = false
            this.$nextTick(() => {
              this.$refs["userAgentInfoRequest"].clearValidate();  
            })
          }
          else{
            this.hideAgent = true
          }
      	}
      	else{
          this.hideAgent = true
          this.userAgentInfoRequest = {}
        }
      })
    },
    setAttachIcons(object,attaches){
      attaches.forEach(attach => {
        let attachName = object[attach]
        if(attachName){
          let lastName = attachName.substring(attachName.lastIndexOf('.')).toLowerCase()
          if (/\.jpg|\.png|\.jpeg/.test(lastName) === false) {
            object[attach + 'Url'] = util.getIcon(attachName)
          }
          else{
            object[attach + 'Url'] = api.getImgURL(object[attach + 'Des'])
          }
        }
        else{
          object[attach + 'Url'] = ''
        }
      })
      return object
    },
    getUserCoInfo(){
      api.getUserCoInfo({}).then(res => {
        if(res.data.code === '1'){
          this.userInfo = res.data.data
          
          let attaches = ['coLicenceAttach','coIdPaperAttach','coIdAttachFornt','coIdAttachRear']
          this.userInfo = this.setAttachIcons(this.userInfo, attaches)
          this.userInfo.coType = 2 // 案件关联企业类型：1.被告，2.原告
          this.userCoInfoForm = Object.assign({}, this.userInfo)
        }
      })
    },
    
    editCoInfo(){
      let valids = false
      this.$refs["userInfoForm"].validate(valid => {
        if(this.hideAgent === false){
          this.$refs['userAgentInfoRequest'].validate(valid2 => {
            valids = valid && valid2
          })
        }
        else{
          valids = valid
        }
      })
      if(valids){

        let params = Object.assign({}, this.userCoInfoForm)
        if(this.hideAgent === false){
          this.userAgentInfoRequest.userAccountId = this.userCoInfoForm.userAccountId
          params.userAgentInfoRequest = this.userAgentInfoRequest 
        }
	      
	      this.loading = true
	      api.updateUserCoInfo(params).then(res => {
	        this.loading = false
	        if(res.data.code === '1'){
	          this.$message.success(res.data.msg)
	          this.userInfoDialog = false
	          this.userInfo = {}
	        }
	        else{
	          this.$message.error(res.data.msg)
	        }
	    	})
      }
    },
    imgSuccess(object, key) {
      return (res, file) => {
        this.loading = false;
        if (res.code == '1') {
          if (file.raw.type !== 'image/jpeg' && file.raw.type !== 'image/png') {
            object[key + 'Url'] = util.getIcon(file.name)
          }
          else{
            object[key + 'Url'] = URL.createObjectURL(file.raw)
          }
          object[key] = res.data.filePath;
        } else {
          this.$message.error(res.msg)
        }
      }
    },
    imgFilter(file) {
      const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === "application/pdf");
      const isLt3M = file.size / 1024 / 1024 < 10;
      if (!isJPG) {
        this.$message.error('上传图片只能是 jpg,png,pdf 格式!');
        return false
      }
      if (!isLt3M) {
        this.$message.error('上传图片大小不能超过 10MB!');
        return false
      }
      this.loading = true;
      return isJPG && isLt3M;
    }
  },
  mounted() {
    
  }
}

</script>
<style lang="scss" scoped>
.ly-head{
  height: 105px;
  border-radius: 2px;
  padding: 30px;
  background: #fff;
  border-bottom: solid 20px #f0f2f5;
  .user-info{
    margin-top: 20px;
    .money{
      float: right;
      text-align: right;
      p{
        color: #999;
        b{
          color: #333;
          font-size: 24px;
          font-weight: normal;
        }
        &+p{
          margin-top: 6px;
        }
      }
    }
    .user-actions{
      p{
        cursor: pointer;
        display: inline-block;
        font-size: 20px;
        color: #333;
      }
      .user-img{
        width: 56px;
        height: 56px;
        background: #1890FF;
        color: #fff;
        font-size: 20px;
        text-align: center;
        line-height: 56px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 15px;
        color: pointer;
      }
      .mod-pass{
        color: #169BD5;
        cursor: pointer;
        font-size: 14px;
        margin-left: 30px;
      }
    }
  }
}
.ly-body{
  overflow: auto;
  margin-top: 10px;
  &>h2{
    font-size: 16px;
    padding: 15px 20px;
    border-bottom: solid 1px #eee;
  }
  .table-container{
    padding: 20px;
  }
}
.upload-co-img{
  ul {
    overflow: hidden;
  }
  li {
    float: left;
    margin-right: 20px;
  }
}
.openAgent{
  cursor: pointer;
  color: #1890FF;
  font-size: 16px;
  margin-left: 30px;
  display: inline-block;
}
.agent-box{
  h3{
    border-bottom: solid 1px #d3d3d3;
    padding-bottom: 10px;
    margin-bottom: 25px;
  }
}
.delete-agent{
  font-size: 13px;
  cursor: pointer;
  color: #aaa;
  float: right;
  margin-right: 10px;
  &:hover{
    color: #1890FF;
  }
}
</style>