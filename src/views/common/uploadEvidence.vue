<template>
  <div class="g-evidence" v-loading="eviLoading" :class="{'full-width': fullWidth}">
    <div class="evidence-item" :class="{'noborder': noborder}" v-for="(evidence, index) in myEvidences" :key="index" v-if="evidence.attachmentEvidenceStatus!=2">
      <div class="evidence-tit" v-if="!simple && !addEvidence">
        <el-button v-if="!isMediation" size="small" style="float: right;" @click="removeEvidence(index)">删除</el-button>
        <h3>{{evidence.evidenceName}}</h3>
      </div>
      <div class="evidence-tit" v-if="isData && !addEvidence">
        <h3>{{evidence.evidenceName}}</h3>
      </div>
      <div class="evidence-tit" v-if="addEvidence">
        <el-button size="small" style="float: right;" @click="removeEvidenceList(index)" v-if="myEvidences.length !== 0">删除</el-button>
        <h3>{{evidence.evidenceName}}</h3>
      </div>
      <div v-if="isMediation">
        <div v-for="mediation in evidence.list" :key="mediation.documentUserName" style="margin-bottom: 10px;">
          <table>
            <tr>
              <td v-if="mediation.documentUserName"><p style="min-width: 150px;">{{mediation.documentUserName}}：</p></td>
              <td>
                <el-upload
                  class="g-uploader" multiple :headers="headers" :action="uploadUrl" :on-error="uploadError" :on-success="success(mediation.attachmentDatas)" :before-upload="fileFilter" :show-file-list="false">
                  <el-button size="small" type="default" icon="el-icon-upload2">上传附件</el-button>
                </el-upload>
              </td>
            </tr>
          </table>
          <div class="attachmentDatas">
            <div class="attachmentDatas-item" >
              <ul>
                <li v-if="mediation.attachmentDatas[0].url">
                  <a class="file-name" :href="mediation.attachmentDatas[0].url" target="_blank">{{mediation.attachmentDatas[0].attachName}}</a>
                </li>
                <li v-else>
                  <span class="file-name">{{mediation.attachmentDatas[0].attachName}}</span>
                  <span class="remove-file"><i @click="removeAttachmentDatas(mediation.attachmentDatas, 0)" class="el-icon-close"></i></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div>
          <el-upload
            class="g-uploader" multiple :headers="headers" :action="uploadUrl" :on-error="uploadError" :on-success="success(evidence.attachmentDatas)" :before-upload="fileFilter" :show-file-list="false">
            <el-button size="small" type="default" icon="el-icon-upload2">上传附件</el-button>
          </el-upload>
        </div>
        <div class="attachmentDatas">
          <div class="attachmentDatas-item" v-for="(file, ind) in evidence.attachmentDatas" :key="ind" v-if="file.attachStatus!=2">
            <ul>
              <li>
                <span class="file-name">{{file.attachName}}</span>
                <span class="remove-file"><i @click="removeAttachmentDatas(evidence.attachmentDatas, ind)" class="el-icon-close"></i></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="evidence-text" v-if="!simple && !isMediation && !addEvidence">
        <el-form :model="evidence" :ref="evidence.fileFormName" label-width="100px">
          <el-form-item label="证据标题：" prop="evidenceTitle" :rules="fileFormRules.title">
            <el-input v-model.trim="evidence.evidenceTitle" :maxLength="50" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="证明内容：" prop="evidenceContent" :rules="fileFormRules.content">
            <el-input type="textarea" placeholder="请输入" :autosize="{ minRows: 4}" v-model.trim="evidence.evidenceContent" :maxLength="500"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="evidence-text" v-if="addEvidence">
        <el-form :model="evidence" :ref="evidence.evidenceNameIndex" label-width="100px">
          <el-form-item label="证据标题：" prop="evidenceTitle" :rules="fileFormRules.title">
            <el-input v-model.trim="evidence.evidenceTitle" :maxLength="50" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="证明内容：" prop="evidenceContent" :rules="fileFormRules.content">
            <el-input type="textarea" placeholder="请输入" :autosize="{ minRows: 4}" v-model.trim="evidence.evidenceContent" :maxLength="500"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="bottom-text" v-if="addEvidence">
        <div>
          <div>更新流程：</div>
          <div v-if="selectRow.arbProcessExplain == 1">申请</div>
          <div v-if="selectRow.arbProcessExplain == 2">立案</div>
          <div v-if="selectRow.arbProcessExplain == 3">答辩</div>
          <div v-if="selectRow.arbProcessExplain == 4">审理</div>
          <div v-if="selectRow.arbProcessExplain == 5">结案</div>
        </div>
        <div>
          <div>更新时间：</div>
          <div></div>
        </div>
        <div>
          <div>更新人：</div>
          <div>{{user_fullname}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import util from '@/util/util'
export default {
  props: {
    headers: Object,
 	  myEvidences: Array,
 	  uploadUrl: String,
    fullWidth: {
      type: Boolean,
      default: false
    },
    simple: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    noborder: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    params: {
      type: Object,
      default: () => {
        return {
          attachType: 1,     // 1-案件申请，2-案件跟踪，3-答辩，4-应辩，5-仲裁
          attachProperty: 2,    //  1-申请书，2-证据资料
          arbitralPtype: 2,    // 1-被申请人 2-申请人
          evidenceProperty: 2    // 1-申请书，2-证据资料，3-其他，4-答辩
        }
      }
    },
    isMediation: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    isData: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    addEvidence: {
      type: Boolean,
      default: false
    },
    evidenceNameIndex: {
      type: Number
    },
    selectRow: {}
  },
  data () {
    return {
      fileFormRules:{
        title: { required: true, message: '请输入证据标题' },
        content: { required: true, message: '请输入证明内容' }
      },
      mime: [".jpeg", ".jpg", ".png", ".pdf", '.doc', '.docx', '.docm'],
      eviLoading: false
    }
  },
  computed: {
    user_fullname(){
      return this.$store.state.admin.adminName
      // this.$store.state.user.userName ||
    }
  },

  methods: {
    removeEvidenceList (index) {
      if (this.myEvidences.length === 1) {
        this.$message.info('至少保留一条')
      } else {
        this.$confirm('删除之后，已上传的附件将丢失。请确认！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.myEvidences.splice(index, 1)
          this.formatList()
        }).catch(() => {})
      }
    },
    addList () {
      this.myEvidences.push({
        evidenceTitle: '',
        evidenceContent: '',
        attachmentDatas: []
      })
      this.formatList()
    },
    formatList () {
      const evidenceNameIndex = this.evidenceNameIndex
      // console.log(evidenceNameIndex, 'evidenceNameIndex')
      this.myEvidences.forEach((val, index) => {
        val.evidenceNameIndex = evidenceNameIndex + index
        val.evidenceName = '证据' + util.exchangeIndex(evidenceNameIndex + index)
      })
    },
    validateSubmit () {
      let errorText = []
      return new Promise((resolve, reject) => {
        const refs = this.$refs[this.myEvidences[0].evidenceNameIndex]
        refs.forEach((v) => {
          v.validate((valid) => {
            if (valid) {} else {
              errorText.push('证据标题或说明未填写')
            }
          })
        })
        if (errorText.length === 0) {
          for (let i = 0; i < this.myEvidences.length; i++) {
            if (this.myEvidences[i].attachmentDatas.length === 0) {
              this.$message.error(this.myEvidences[i].evidenceName + '未上传证据附件')
              return
            }
          }
          resolve()
        }
      })
    },
    clearValidate () {
      this.formatList()
      this.$nextTick(() => {
        this.$refs[this.myEvidences[0].evidenceNameIndex][0].clearValidate()
      })
    },
  	success(datas){

      return (res, file) => {
        this.eviLoading = false
        console.log(datas)
        if (res.code == '1') {
          let f = {
            attachUrlBase64: res.data.filePath,
            attachName: file.name,
            attachType: this.params.attachType,
            attachProperty: this.params.attachProperty,
            attachStatus: 1
          }
          if(this.isMediation === true && datas.length > 0){
            datas.pop()
            datas.push(f)
          }
          else{
            datas.push(f)
          }
        } else {
          this.$message.error(res.msg)
        }
      }
  	},
    fileFilter(file) {
      if(this.isMediation && file.type !== 'application/pdf'){
        this.$message.error('仅支持pdf格式文件!');
        return false
      }
      let endName = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      const isMime = this.mime.some((value) => {
        return value == endName
      })
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isMime) {
        this.$message.error('仅支持pdf和word,jpg,png格式文件上传!');
        return false
      }
      if (!isLt2M) {
        this.$message.error('单个文件不可超过10 MB!');
        return false
      }
      this.eviLoading = true;
      return isMime && isLt2M;
    },
    removeEvidence(index){
      this.$confirm('删除之后，已上传的附件将丢失。请确认！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if(this.myEvidences[index].attachmentEvidenceId){
          let item = this.myEvidences[index]
          item.attachmentEvidenceStatus = 2
        }
        else{
          this.myEvidences.splice(index, 1)
        }
        let myEvidences = this.myEvidences.filter(item => {
          return item.attachmentEvidenceStatus != 2
        })
        if(this.simple === false){
          myEvidences.forEach((item,i) => {
            item.evidenceName = '证据' + util.exchangeIndex(i+1)
          })
        }
      }).catch(() => {});
    },
    removeAttachmentDatas(datas,ind){
      this.$confirm(`确定移除 ${datas[ind].attachName}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if(this.isMediation === true){
          datas[0].attachName = ''
          datas[0].attachUrlBase64 = ''
        }
        else{
          if(datas[ind].attachId){
            let item = datas[ind]
            item.attachStatus = 2
          }
          else{
            datas.splice(ind, 1)
          }
        }

      }).catch(() => {});
    },
    uploadError(res){
      this.eviLoading = false
      this.$store.dispatch('httpError', res)
    },
    validate(){
      let errorText = []
      let evidences = this.myEvidences.filter(item => {return item.attachmentEvidenceStatus!=2})
      if(evidences.length === 0){
        errorText.push('请填写、上传证据')
      }
      else{
        evidences.forEach((v, index) => {
          if(v.attachmentDatas.length === 0){
            if(errorText.indexOf('未上传证据附件') < 0){
              errorText.push('未上传证据附件')
            }
          }
          this.$refs[v.fileFormName][0].validate((valid) => {
            if (valid) {} else {
              if(errorText.indexOf('证据标题或说明未填写') < 0){
                errorText.push('证据标题或说明未填写')
              }
            }
          })
        })
      }
      return errorText
    },
    add(){
      let l = this.myEvidences.filter(item => {return item.attachmentEvidenceStatus != 2}).length + 1;
      this.myEvidences.push({
        attachmentEvidenceStatus: 1,
        arbitralPtype: this.params.arbitralPtype,     // 1-被申请人 2-申请人
        evidenceProperty: this.params.evidenceProperty,  // 证据属性 1-申请书，2-证据资料，3-其他
        fileFormName: util.uuidfn(),
        evidenceName: this.simple?'答辩书':('证据' + util.exchangeIndex(l)),
        evidenceTitle: '',
        evidenceContent: '',
        attachmentDatas: []
      })
    },
  },
  mounted(){
    // this.add()
  }
}
</script>
<style lang="scss" scoped>
  .full-width{
    width: 100%;
  }
  .bottom-text{
    font-size: 12px;
    display: flex;
    border-top: 1px solid #d9d9d9;
    padding-top: 10px;
    &>div{
      width: 30%;
      display: flex;
      &>div:nth-child(1){
        width: 80px;
      }
    }
    &>div:nth-child(2){
      width: 40%;
    }
  }

</style>
