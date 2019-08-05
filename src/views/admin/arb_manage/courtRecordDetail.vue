<template>
  <div class="g-proofread" v-loading.fullscreen="loading">
    <div class="ly-header">
      <div class="msg">
        <h2>{{arbiInfo.arbNumber || arbiInfo.arbTemporaryNumber}}</h2>
        <div class="box">
          <p>
            <span>案由：</span>
            <span class="ellipsis" :title="arbiInfo.arbName">{{arbiInfo.arbName}}</span>
          </p>
          <p><span>产品类型：</span>
            <span class="ellipsis" :title="arbProductName">{{arbProductName}}</span>
          </p>
        </div>
        <div class="box">
          <p>
            <span>申请人：</span>
            <span class="ellipsis" :title="arbiInfo.arbProsecutorName">{{arbiInfo.arbProsecutorName}}</span>
          </p>
          <p>
            <span>被申请人：</span>
            <span class="ellipsis" :title="arbiInfo.arbDefendantName">{{arbiInfo.arbDefendantName}}</span>
          </p>
        </div>
        <div class="box">
          <p>
            <span>申请日期：</span>
            <span class="ellipsis" :title="arbiInfo.createTime">{{arbiInfo.createTime}}</span>
          </p>
        </div>
      </div>
      <div class="actions">
        <div>
          <el-button type="default" @click="$router.go(-1)">返回</el-button>
          <el-button class="css-save" @click="save()">保存</el-button>
          <el-button type="primary" @click="confirmPass()">确认录入</el-button>
        </div>
        <div class="mt20">
          <p><span>状态</span></p>
          <p><b>已组庭</b></p>
        </div>
      </div>
    </div>
    <show-evidence :arbi-info="arbiInfo" :hasReply="true">
      <div class="select no-bottom">
        <span>开庭笔录模板：</span>
        <!-- <el-select v-model="courtRecordType"  @change="getCourtRecordType">
          <el-option v-for="item in courtRecordTypes" :value="item.value" :label="item.label" :key="item.value"></el-option>
        </el-select> -->
        <el-radio-group v-model="courtRecordType"  @change="getCourtRecordType">
          <el-radio v-for="item in courtRecordTypes" :key="item.value" :label="item.value">{{item.label}}</el-radio>
        </el-radio-group>
      </div>
      <div class="select">
        <el-upload
          class="g-uploader" multiple :headers="headers"
          :action="uploadUrl" :on-error="uploadError" name="hearRecord"
          :on-success="success(attachmentDatas)" :before-upload="fileFilter" :show-file-list="false">
          <el-button size="small" type="default" icon="el-icon-upload2">重新上传</el-button>
        </el-upload>
        <span v-for="(item, index) in attachmentDatas" :key="index">
            <a  :download="item.documentName" class="g-link" @click="download({url: item.attachUrlBase64, name: item.attachName})">{{item.attachName}}</a>
          </span>
      </div>
      <div style="height: 600px;overflow: auto;">
        <quill-editor
          v-model="courtRecord"
          ref="quillEditor"
          :options="editorOption"
          @change="onEditorChange($event)">
        </quill-editor>
      </div>
    </show-evidence>

  </div>
</template>
<script>
import { api } from '@/api'
// import downloadFileTool from '@/util/downloadFile'
import showEvidence from '@admin/components/showEvidence'
import downloadFileTool from '@/util/downloadFile'
// import showEvidence from '@admin/components/showEvidenceDetail'
export default {
  components: { showEvidence },
  data() {
    return {
      loading: false, //
      arbiInfo: {},
      arbitralContractAdvanceResponse: {},
      arbProductName: '',
      courtRecord: '',
      editorOption:{
        placeholder: "输入内容",
        modules:{
          toolbar:[
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'size': this.GLOBAL.fontsizes }],
            [{ 'font': this.GLOBAL.fonts }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
          ]
        }
      },
      htmlString: '', // 保存原始模板字符串
      courtRecordType: 1,
      oldType: 1,
      courtRecord1: '',
      courtRecord2: '',
      savedRecord: '',
      courtRecordTypes: [{
          value: 1,
          label: '简易'
        },{
          value: 2,
          label: '简易 缺席审理'
        },{
          value: 3,
          label: '最近保存'
        }
      ],
      attachmentDatas: [],
      mime: [".jpeg", ".jpg", ".png", ".pdf", '.doc', '.docx', '.docm']
    }
  },
  computed: {
    headers(){
      return {
        Authorization: this.$store.state.admin.adminAccessToken
      }
    },
    uploadUrl () {
      return `${api.uploadHearRecord}?arbitralInfoId=${this.arbiInfo.id}`
    }
  },
  methods: {
    download(row){
      api.downloadOtherFile({
        filePath: row.url,
        fileName: row.name
      }).then(res => {
        if (res.data instanceof Blob) {
          downloadFileTool(res.data, row.name)
        }
        else{
          this.$message.error('文件数据有错误，无法下载')
        }
      })
    },
    uploadError (res) {
      this.eviLoading = false
    },
    success (datas) {
      return (res, file) => {
        if (res.code === '1') {
          let f = {
            attachUrlBase64: res.data,
            attachName: file.name
          }
          if (datas.length > 0) {
            datas.pop()
            datas.push(f)
          } else {
            datas.push(f)
          }
        } else {
          this.$message.error(res.msg)
        }
        console.log(this.attachmentDatas, 'attachmentDatas')
      }
    },
    fileFilter(file) {
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

    onEditorChange(event){  // 内容改变事件
      // console.log(event.html)
    },
    queryData(val){
      this.loading = true;
      api.queryArbitralCourtRecord({
        arbitralInfoId: this.id,
        tribunalStatus: val
      }).then((res) => {
        this.loading = false;
        if(res.data.code == '1'){
          this.htmlString = res.data.data
          let str = res.data.data
          if(str.indexOf('wrap') > -1){
            str = str.match(/<div class=\"wrap\">([\s\S]*?)<\/body>/)[1].replace(/&#160;/g, '&nbsp;')
          }
          if(val == 1){
            this.courtRecord1 = str
          }
          else{
            this.courtRecord2 = str
          }
          this.courtRecord = str
        }
        else{
          this.courtRecord = ''
        }
      })
    },
    confirmPass() {
      let courtRecord = this.courtRecord
      courtRecord = courtRecord.replace(/<br>/g, '<br \/>').replace(/&nbsp;/g, '&#160;').replace(/\s+style="[^"]*"/g,'').replace(/(?=[^>]*(?=<))\s/g,'&#160;')
      courtRecord = this.htmlString.replace(/<div class=\"wrap\">([\s\S]*?)<\/body>/, `<div class="wrap">${courtRecord}</div></body>`)
      this.loading = true
      api.hearJudgeOUploadRecord({
        "tribunalStatus": this.courtRecordType === 3 ? 1 : this.courtRecordType,
        "htmlstr": courtRecord,
        "arbitralInfoId": this.arbiInfo.id, //案件id
        "processTaskId": this.arbiInfo.arbProcessTask //案件流程id
      }).then((res) => {
        this.loading = false;
        if (res.data.code == '1') {
          this.$message.success(res.data.msg);
          this.$router.go(-1)
        } else {
          this.$message.warning(res.data.msg);
        }

      })
    },
    save(){
      let courtRecord = this.courtRecord
      courtRecord = courtRecord.replace(/<br>/g, '<br \/>').replace(/&nbsp;/g, '&#160;').replace(/\s+style="[^"]*"/g,'').replace(/(?=[^>]*(?=<))\s/g,'&#160;')
      courtRecord = this.htmlString.replace(/<div class=\"wrap\">([\s\S]*?)<\/body>/, `<div class="wrap">${courtRecord}</div></body>`)
      this.loading = true
      api.saveHearRecordContext({
        // "tribunalStatus": this.courtRecordType,
        "hearRecordContext": courtRecord,
        "arbitralInfoId": this.arbiInfo.id, //案件id
        // "processTaskId": this.arbiInfo.arbProcessTask //案件流程id
      }).then((res) => {
        this.loading = false;
        if (res.data.code == '1') {
          this.$message.success(res.data.msg);
          this.queryHearRecordContext()
        } else {
          this.$message.warning(res.data.msg);
        }

      })
    },

    getCourtRecordType(val){
      this.$confirm('选择后将替换此前模板内容，是否确认选择？', '提示', {
        type: 'warning'
      }).then(() => {
        if(val == 1 && this.courtRecord1){
          this.courtRecord = this.courtRecord1
        }
        else if(val == 2 && this.courtRecord2){
          this.courtRecord = this.courtRecord2
        }
        else if(val == 3){
          this.courtRecord = this.savedRecord
        }
        else {this.queryData(val)}
        this.oldType = val
      }).catch(() => {
        this.courtRecordType = this.oldType
      })
    },
    queryHearRecordContext(){
      api.queryHearRecordContext({
        arbitralInfoId: this.id
      }).then((res) => {
        if(res.data.code == '1'){
          this.htmlString = res.data.data
          let str = res.data.data
          if(str.indexOf('wrap') > -1){
            str = str.match(/<div class=\"wrap\">([\s\S]*?)<\/body>/)[1].replace(/&#160;/g, '&nbsp;')
          }
          this.savedRecord = str
          this.courtRecord = str
          this.courtRecordType = 3
          this.oldType = 3
        }
        else{
          this.queryData(this.courtRecordType)
        }
      })
    }
  },
  created(){
    this.id = this.$route.query.data
    if(this.id){
      // 1,简易；2，简易（缺席审理）
      this.queryHearRecordContext()
      api.getArbitralInfoDetailBySys({
        arbitralId: this.id
      }).then((res) => {
        if(res.data.code == '1'){
          this.arbiInfo = res.data
          this.arbProductName = this.arbiInfo.arbitralContractAdvancey.arbProductName
          // this.formatData()
        }
      })
    }
  }
}

</script>
<style lang="scss" scoped>
  .no-bottom{
    border-bottom: none !important;
  }
.ly-header{
  display: flex;
  color: #666;
  font-size: 14px;
  margin-top: 20px;
  justify-content: space-between;
  padding: 0 30px;
  .msg{
    width: 800px;
    overflow: hidden;
    h2{
      margin-bottom: 20px;
      font-size: 20px;
      color: #333;
      font-weight: bold;
    }
    p{
      width: 350px;
      float: left;
      height: 32px;
      line-height: 32px;
      span{
        display: inline-block;
        width: 80px;
      }
    }
    .ellipsis{
      text-overflow:ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  .actions{
    margin-right: 20px;
    width: 300px;
    text-align: right;
    span{
      color: #999;
    }
    .el-button{
      padding: 8px 20px;
    }
    b{
      font-size: 18px;
      color: #333;
      font-weight: normal;
      line-height: 40px;
    }
  }
}
.ly-body{
  margin-top: 10px;
  &>p{
    font-size: 14px;
    background: #ffe6e6;
    line-height: 37px;
    text-indent: 1em;
  }
}
.ly-main{
  display: flex;
  font-size: 14px;
  min-height: 600px;
  .ly-left{
    width: 55%;
    border:solid 1px #333;
    &>p{
      line-height: 40px;
      text-indent: 1em;
      border-bottom: solid 1px #333;
    }
  }
  .ly-right{
    margin-left: 20px;
    width: 45%;
    border:solid 1px #333;
    line-height: 30px;
  }
  .select{
    padding: 10px 0;
    border-bottom: solid 1px #333;
    display: flex;
    align-items: center;
    span{
      display: inline-block;
      text-indent: 1em;
    }
  }
}
  .box{
    display: flex;
    p{
      width: 50%;
      display: flex;
      &>span:nth-child(1){
        width: 100px;
      }
      &>span:nth-child(2){
        flex: 1;
      }
    }
  }
</style>
