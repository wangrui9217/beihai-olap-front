<template>
  <div class="g-evidence full-width" v-loading="eviLoading">
    <div class="evidence-item"  v-for="(evidence, index) in evidencesList" :key="index">
      <div class="evidence-tit">
        <h3>{{evidence.evidenceName}}</h3>
      </div>
      <div>
        <div v-for="mediation in evidence.arbAttachmentDatas" :key="mediation.attachId" style="margin-bottom: 10px;">
          <div class="attachmentDatas">
            <div class="attachmentDatas-item" >
              <ul>
                <li>
                  <!--:download="mediation.attachName"-->
                  <!--<a class="file-name" :href="mediation.attachUrlDes" >{{mediation.attachName}}</a>-->
                  <span class="file-name" :href="mediation.attachUrl" @click="downloadFile(mediation.attachUrlDes, mediation.attachName)">{{mediation.attachName}}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="evidence-text">
        <el-form :model="evidence" :ref="evidence.fileFormName" label-width="100px">
          <el-form-item label="证据标题：" prop="evidenceTitle">
            <el-input v-model.trim="evidence.evidenceTitle" :maxLength="50" placeholder="请输入" readonly></el-input>
          </el-form-item>
          <el-form-item label="证明内容：" prop="evidenceContent">
            <el-input type="textarea" placeholder="请输入" :autosize="{ minRows: 4}" v-model.trim="evidence.evidenceContent" :maxLength="2000" readonly></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="bottom-text">
        <div>
          <div>更新流程：</div>
          <div>{{DICT.getArbStatusName(evidence.updateProcess)}}</div>
        </div>
        <div>
          <div>更新时间：</div>
          <div>{{evidence.updateTime}}</div>
        </div>
        <div>
          <div>更新人：</div>
          <div>{{evidence.updatePName}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import util from '@/util/util'
  import DownloadFile from '@/util/downloadFile'
  import DICT from '@/const/dict'
  import { api } from '@/api'
export default {
  props: {
    evidencesList: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      eviLoading: false,
      DICT,
      DownloadFile
    }
  },

    methods: {
    downloadFile (url, name) {
      let urlPath
      let lastName = name.substring(name.lastIndexOf('.')).toLowerCase()
      if (/\.jpg|\.png|\.jpeg/.test(lastName) === true) {
        urlPath = api.getImgURL(url)
      } else {  // pdf
        urlPath = api.getPdfURL(url)
      }
      DownloadFile(urlPath, name)
    },
  	// success(datas){
    //
    //   return (res, file) => {
    //     this.eviLoading = false
    //     console.log(datas)
    //     if (res.code == '1') {
    //       let f = {
    //         attachUrlBase64: res.data.filePath,
    //         attachName: file.name,
    //         attachType: this.params.attachType,
    //         attachProperty: this.params.attachProperty,
    //         attachStatus: 1
    //       }
    //       if(this.isMediation === true && datas.length > 0){
    //         datas.pop()
    //         datas.push(f)
    //       }
    //       else{
    //         datas.push(f)
    //       }
    //     } else {
    //       this.$message.error(res.msg)
    //     }
    //   }
  	// },
    // fileFilter(file) {
    //   if(this.isMediation && file.type !== 'application/pdf'){
    //     this.$message.error('仅支持pdf格式文件!');
    //     return false
    //   }
    //   let endName = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    //   const isMime = this.mime.some((value) => {
    //     return value == endName
    //   })
    //   const isLt2M = file.size / 1024 / 1024 < 10;
    //   if (!isMime) {
    //     this.$message.error('仅支持pdf和word,jpg,png格式文件上传!');
    //     return false
    //   }
    //   if (!isLt2M) {
    //     this.$message.error('单个文件不可超过10 MB!');
    //     return false
    //   }
    //   this.eviLoading = true;
    //   return isMime && isLt2M;
    // },
    // removeEvidence(index){
    //   this.$confirm('删除之后，已上传的附件将丢失。请确认！', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     if(this.myEvidences[index].attachmentEvidenceId){
    //       let item = this.myEvidences[index]
    //       item.attachmentEvidenceStatus = 2
    //     }
    //     else{
    //       this.myEvidences.splice(index, 1)
    //     }
    //     let myEvidences = this.myEvidences.filter(item => {
    //       return item.attachmentEvidenceStatus != 2
    //     })
    //     if(this.simple === false){
    //       myEvidences.forEach((item,i) => {
    //         item.evidenceName = '证据' + util.exchangeIndex(i+1)
    //       })
    //     }
    //   }).catch(() => {});
    // },
    // removeAttachmentDatas(datas,ind){
    //   this.$confirm(`确定移除 ${datas[ind].attachName}？`, '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     if(this.isMediation === true){
    //       datas[0].attachName = ''
    //       datas[0].attachUrlBase64 = ''
    //     }
    //     else{
    //       if(datas[ind].attachId){
    //         let item = datas[ind]
    //         item.attachStatus = 2
    //       }
    //       else{
    //         datas.splice(ind, 1)
    //       }
    //     }
    //
    //   }).catch(() => {});
    // },
    // uploadError(res){
    //   this.eviLoading = false
    //   this.$store.dispatch('httpError', res)
    // },
    // validate(){
    //   let errorText = []
    //   let evidences = this.myEvidences.filter(item => {return item.attachmentEvidenceStatus!=2})
    //   if(evidences.length === 0){
    //     errorText.push('请填写、上传证据')
    //   }
    //   else{
    //     evidences.forEach((v, index) => {
    //       if(v.attachmentDatas.length === 0){
    //         if(errorText.indexOf('未上传证据附件') < 0){
    //           errorText.push('未上传证据附件')
    //         }
    //       }
    //       this.$refs[v.fileFormName][0].validate((valid) => {
    //         if (valid) {} else {
    //           if(errorText.indexOf('证据标题或说明未填写') < 0){
    //             errorText.push('证据标题或说明未填写')
    //           }
    //         }
    //       })
    //     })
    //   }
    //   return errorText
    // },
    // add(){
    //   let l = this.myEvidences.filter(item => {return item.attachmentEvidenceStatus != 2}).length + 1;
    //   this.myEvidences.push({
    //     attachmentEvidenceStatus: 1,
    //     arbitralPtype: this.params.arbitralPtype,     // 1-被申请人 2-申请人
    //     evidenceProperty: this.params.evidenceProperty,  // 证据属性 1-申请书，2-证据资料，3-其他
    //     fileFormName: util.uuidfn(),
    //     evidenceName: this.simple?'答辩书':('证据' + util.exchangeIndex(l)),
    //     evidenceTitle: '',
    //     evidenceContent: '',
    //     attachmentDatas: []
    //   })
    // },
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
