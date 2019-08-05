<template>
  <div class="g-proofread" v-loading.fullscreen="loading">
    <div class="ly-header">
      <div class="msg">
        <h2>{{arbiInfo.arbNumber || arbiInfo.arbTemporaryNumber}}</h2>
        <p><span>案由：</span>{{arbiInfo.arbName}}</p><p><span>产品类型：</span>{{arbitralContractAdvanceResponse.arbProductName}}</p>
        <p><span>申请人：</span>{{arbiInfo.arbProsecutorName}}</p><p><span>被申请人：</span>{{arbiInfo.arbDefendantName}}</p>
        <p><span>申请日期：</span>{{arbiInfo.createTime}}</p>
      </div>
      <div class="actions">
        <div>
          <el-button type="default" @click="$router.go(-1)">返回</el-button>
          <el-button type="primary" @click="reviewPass()">审核</el-button>
        </div>
        <div class="mt20">
          <p><span>状态</span></p>
          <p><b>待审核</b></p>
        </div>
      </div>
    </div>
    <show-evidence :arbi-info="arbiInfo" :hasReply="true">
      <!-- <p>裁决书</p>
      <div>
        <div class="ql-snow" style="height: 800px;">
          <div class="ql-editor" v-html="arbitralAwardContext"></div>
        </div>
      </div> -->
      <p>裁决书</p>
      <div>
        <quill-editor 
          v-model="arbitralAwardContext" 
          ref="quillEditor" 
          :options="editorOption" 
          @change="onEditorChange($event)">
        </quill-editor>
      </div>
    </show-evidence>
    <review-dialog title="审核校对裁决书" :reviewFn="review" ref="reviewDialog"></review-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import reviewDialog from '@admin/components/reviewDialog'
import showEvidence from '@admin/components/showEvidence'
export default {
  components: { reviewDialog, showEvidence},
  data() {
    return {
      loading: false, //
      arbiInfo: {},
      // arbitralAttachment: [],
      arbitralContractAdvanceResponse: {},
      editorOption:{
        placeholder: "输入内容",
        modules:{
          toolbar:[
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'size': this.GLOBAL.fontsizes }],
            [{ 'font': this.GLOBAL.fonts }],
            [{ 'spacing': ['sp0','sp1', 'sp2','sp-1','sp-2','sp-3','sp-4'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
          ]
        }
      },
      arbitralAwardContext: '',
      htmlString: ''
    }
  },
  methods: {
    onEditorChange(event){  // 内容改变事件
      // console.log(event.html)
    },
    queryData(){
      this.loading = true;
      api.getArbitralInfoDetailBySysAboutJudge({
        arbitralId: this.id
      }).then((res) => {
        this.loading = false;
        if(res.data.code == '1'){
          this.arbiInfo = res.data
          this.arbitralContractAdvanceResponse = this.arbiInfo.arbitralContractAdvanceResponse
          if(this.arbiInfo.hasOwnProperty('arbitralRecordResponse') && this.arbiInfo.arbitralRecordResponse.arbitralAwardContext){
            // 替换无法被freemarker识别的符号
            let htmlString = this.arbiInfo.arbitralRecordResponse.arbitralAwardContext
            this.htmlString = htmlString
            if(htmlString.indexOf('ql-editor') > -1){
              this.arbitralAwardContext = htmlString.match(/<div class=\'ql-editor\'>([\s\S]*?)<\/div>/)[1].replace(/(&#160;){4,}/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
            }
            else if(htmlString.indexOf('<body>') > -1){
              this.arbitralAwardContext = htmlString.match(/<body>([\s\S]*?)<\/body>/)[1]
            }
            else{
              this.arbitralAwardContext = htmlString
            }
          }
          if(!this.arbitralAwardContext){
            this.$message.error('未查询到裁决书数据')
          }
          // this.formatData()
        }
      })
    },
    reviewPass() {
      this.$refs.reviewDialog.openDialog()
    },
    review(passOrNot, reviewTextarea){
      if (passOrNot == '2' && reviewTextarea == '') {
        this.$message.error('请输入意见');
      }
      else{
        let promise = null
        if(passOrNot === '1'){
          promise = api.secondReviewArbitralAwardPass
        }
        else{
          promise = api.secondReviewArbitralAwardNoPass
        }
        this.loading = true
        this.save().then(res => {
          if(res.data.code === '1'){
            return promise({
              processCommonRequest:{
                "arbitralInfoId": this.arbiInfo.id, //案件id
                "processTaskId": this.arbiInfo.arbProcessTask //案件流程id
              },
              passOpinion: reviewTextarea
            })
          }
          else {
            this.$message.error('裁决书保存失败');
          }
        }).then((res) => {
          this.loading = false
          if(res.data.code === '1'){
            this.$message.success(res.data.msg);
            this.$router.go(-1)
          }
          else {
            this.$message.error(res.data.msg);
          }
        }).catch(ex => {console.log(ex)})
      }
    },
    getParams(){
      let paramString = this.arbitralAwardContext
      paramString = paramString.replace(/<br>/g, '<br \/>').replace(/&nbsp;/g, '&#160;').replace(/(?=[^>]*(?=<))\s/g,'&#160;')
      paramString = paramString.replace(/〇/g, '<span class="ql-font-SimSun">〇</span>')
      if(this.htmlString.indexOf('ql-editor') > -1){
        paramString = this.htmlString.replace(/<div class=\'ql-editor\'>([\s\S]*?)<\/div>/, `<div class='ql-editor'>${paramString}</div>`)
      }
      else if(this.htmlString.indexOf('<body>') > -1){
        paramString = this.htmlString.replace(/<body>([\s\S]*?)<\/body>/,`<body>${paramString}</body>`)
      }
      return paramString
    },
    save(){
      let paramString = this.getParams()
      return api.saveArbitralAwardContext({
        arbitralAwardContext: paramString,
        "arbitralInfoId": this.arbiInfo.id //案件id
      })
    }
  },
  created(){
    this.id = this.$route.query.data
    if(this.id){
      this.queryData()
    }
  }
}

</script>
<style lang="scss" scoped>
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
    .select{
      padding: 5px 0;
      border-bottom: solid 1px #333;
      span{
        display: inline-block;
        text-indent: 1em;
      }
    }
  }
}
</style>
