<template>
  <div style="">
    <h2 class="g-title" style="line-height:45px;padding-left:24px;">管辖权异议答辩</h2>
    <div style="height:10px;background:#efefef"></div>
    <h3 style="color:#000;font-size:18px;padding-left:24px;padding-top:24px;font-weight:600;">{{arbitralInfo.arbNumber}}</h3>
          <div class="dissentInfo">
            <ul >
              <li>
                <p><span>申请人：</span>{{arbitralInfo.arbProsecutorName}}</p>
                <p><span>被申请人：</span>{{arbitralInfo.arbDefendantName}}</p>
              </li>
              <li>
                <p><span>异议申请人：</span>{{arbitralInfo.decisionProsecutorName}}</p>
                <p><span>异议申请流程：</span>{{arbitralInfo.decisionStatus}}</p>
              </li>
              <li>
                <p><span>异议申请时间：</span>{{arbitralInfo.decisionCreateTime}}</p>
              </li>
            </ul>
          </div>
          <div style="height:10px;background:#efefef"></div>
    <el-form label-width="115px" style="padding-top:24px;">
        <el-form-item label="答辩书："  required style="margin-bottom:0px;">
          <div class="replyBrief">
            <upload-evidence 
              style="width:597px"
              ref="evidenceForm1"
              :my-evidences="replyBrief"
              :headers="headers"
              :simple="true"
              :noborder="true"
              :uploadUrl="uploadUrl"
              :params="params1"
            ></upload-evidence>
          </div>
        </el-form-item>
      </el-form>
      <!-- <div style="height:1px;background:#efefef"></div> -->
      <div style="display: flex">
        <div class="reply-evidence-tit" style="text-indent: 34px;">证据资料：</div>
        <div>
          <upload-evidence
            style="width:597px"
            ref="evidenceForm2"
            :headers="headers"
            :my-evidences="arbitralAttachment"
            :uploadUrl="uploadUrl"
            :params="params2"
          ></upload-evidence>
          <el-button @click="addEvidence" class="add-evidence"> + 新增证据资料</el-button>
        </div>
      </div>
      <div style="display: flex;margin-top:24px;">
        <div class="reply-evidence-tit">答辩及质证意见：</div>
         <el-input style="width:597px;" type="textarea" :autosize="{ minRows: 4}"  :maxLength="2000" v-model="defenceRemark"/>
      </div>
      <div slot="footer" class="dialog-footer" style="margin-left:600px;margin-top:24px;padding-bottom:24px;">
        <el-button @click="goBack()">取 消</el-button>
        <!-- <el-button class="css-save" @click="save()">保 存</el-button> -->
        <el-button type="primary" @click="submit()">提 交</el-button>
      </div>
  </div>
</template>
<script>
import { api } from '@/api'
import uploadEvidence from '@/views/common/uploadEvidence'
import util from '@/util/util'
export default {
  components: { uploadEvidence },
  data() {
    return {
      defenceRemark:'',
       uploadUrl: api.uploadURL,
       mime: [".jpeg", ".jpg", ".png", ".doc", ".pdf", ".docx"],
       replyBrief: [],
      arbitralAttachment: [],
      arbitralInfo: {},
      dialogTitle: '上传答辩资料',
      params1: {
        attachType: 8,     //  1-案件申请 2-立案 3-答辩 4-审理 5-结案 6-充值' ,
        attachProperty: 9,    //  1-申请书，2-证据资料  4-答辩书 5-答辩证据 6-调解证据
        arbitralPtype: 2,    // 1-被申请人 2-申请人
        evidenceProperty: 9    // 1-申请书，2-证据资料，3-其他，4-答辩书 5-答辩证据 6-调解证据
      },
      params2: {
        attachType: 8,     //  1-案件申请 2-立案 3-答辩 4-审理 5-结案 6-充值' ,
        attachProperty: 10,    //  1-申请书，2-证据资料 4-答辩书 5-答辩证据 6-调解证据
        arbitralPtype: 2,    // 1-被申请人 2-申请人
        evidenceProperty: 10    // 1-申请书，2-证据资料，3-其他，4-答辩书 5-答辩证据 6-调解证据
      }
    }
  },
  methods: {
    goBack(){
      this.$router.replace({path: 'arbitralList'})
    },
    initData(row){
      this.replyBrief = []
      this.arbitralAttachment = []
      this.dialogTitle = '上传答辩资料'
      this.reviewDialogVisible = true;
      this.arbitralInfo = row
      this.arbitralInfo.decisionStatus = util.getStatus(this.arbitralInfo.arbStatus+'')
      console.log('-----------arbitralInfo');
      console.log(this.arbitralInfo);
      this.$nextTick(() => {
        this.$refs.evidenceForm1.add()
        this.$refs.evidenceForm2.add()
      })
    },
    addEvidence(){
      this.$refs.evidenceForm2.add()
    },
    submit() {
      let errorText = []
      if(this.replyBrief.length=== 0 || this.replyBrief[0].attachmentDatas.length === 0){
        errorText.push('答辩书未上传')
      }
      else if(this.replyBrief[0].attachmentDatas.filter(item => {return item.attachStatus !=2}).length === 0){
        errorText.push('答辩书未上传')
      }
      errorText = errorText.concat(this.$refs['evidenceForm2'].validate())
      //证据是非必填，所以过滤掉这个错误
      if(errorText.indexOf('请填写、上传证据') > -1){
        let index = errorText.indexOf('请填写、上传证据')
        errorText.splice(index, 1)
      }
      if(errorText.length){
        this.$message.error(errorText.join('，'))
      }
      else{
        this.replyBrief[0].evidenceName='管辖权异议答辩书'
        this.httpSave('submit')
      }
    },
    httpSave(type){
      this.loading = true
      let processDefencesAttachmentDatas = []
      if(this.replyBrief.length=== 0 || this.replyBrief[0].attachmentDatas.length === 0){
        processDefencesAttachmentDatas = this.arbitralAttachment
      }
      else{
        processDefencesAttachmentDatas = this.replyBrief.concat(this.arbitralAttachment)
      }
      let data = {
        "arbitralInfoId": this.arbitralInfo.id,
        "id": this.arbitralInfo.decisionId,
        "defenceRemark": this.defenceRemark,
        "processDefencesAttachmentDatas": processDefencesAttachmentDatas,
        "processTaskId": this.arbitralInfo.arbProcessTask
      }
      data.processDefencesAttachmentDatas.forEach(item => {
        item.evidenceContent = util.encodeHTML(item.evidenceContent)
        if(item.attachmentEvidenceId){
          item.attachmentDatas.forEach(file => {
            file.arbitralAttachmentEvidenceId = item.attachmentEvidenceId
          })  
        }
      })
      console.log(this.arbitralInfo);
      
      api.saveDecisionDefencesAttachInfos(data).then((res) => {
        if (res.data.code == '1') {
          this.$message.success(res.data.msg);
          this.goBack()
          // if(type === 'submit'){
          //   let data = {
          //     "arbitralInfoId": this.arbitralInfo.id,
          //     "processTaskId": this.arbitralInfo.arbProcessTask
          //   }
          //   api.defencesSuccess(data).then((res) => {
          //     this.loading = false;
          //     if (res.data.code == '1') {
          //      this.goBack()
          //     } else {
          //       this.$message.error(res.data.msg);
          //     }
          //   })
          // }
          // else{
          //  this.goBack()
          // }
        } else {
          this.$message.error(res.data.msg);
        }
      })
    }
  },
  computed: {
   headers(){
     return {
       Authorization: this.$store.state.user.userAccessToken
     }
   }
  },
  mounted() {
   let data = this.$route.query.data
   
   
   this.initData(data)
  }
  
}

</script>
<style lang="scss" scoped>
.replyBrief{
  margin-top: -10px;
}
.css-save{
  background: rgba(168, 221, 241, 1);
  color: #fff;
}
.reply-evidence-tit{
  width: 130px;
  text-indent: 18px
}
.add-evidence{
  // margin-top: 20px;
}
.css-noreply{
  color: #f00;
  cursor: pointer;
  margin-right: 10px;
}


.dissentInfo{
  padding-left: 24px;
  padding-top: 10px;
ul{
      padding: 15px;
      color: #666;
      &+ul{
        border-top: solid 1px #eee;
      }
      li{
        display: flex;
        padding-bottom: 20px;
        p{
          width: 490px;
          display: inline-block;
          height: 19px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        div{
          width: 900px;
        }
        span{
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          height: 19px;
          vertical-align: top;
          display: inline-block;
          width: 100px;
          margin-right: 10px;
          /*color: #000;*/
        }
      }
    }
}
</style>
