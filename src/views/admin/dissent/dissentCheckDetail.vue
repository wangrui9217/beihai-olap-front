<template>
  <div class="g-proofread" v-loading.fullscreen="loading">
    <div class="ly-header">
      <div class="msg">
        <h2>{{arbiInfo.arbNumber || arbiInfo.arbTemporaryNumber}}</h2>
        <p><span>案由：</span>{{arbiInfo.arbName}}</p><p><span>产品类型：</span>{{arbiInfo.arbProductName}}</p>
        <p><span>申请人：</span>{{arbiInfo.arbProsecutorName}}</p><p><span>被申请人：</span>{{arbiInfo.arbDefendantName}}</p>
        <p><span>申请日期：</span>{{arbiInfo.createTime}}</p>
      </div>
      <div class="actions">
        <div>
          <el-button type="default" @click="$router.go(-1)">返回</el-button>
          <el-button class="css-save" @click="save()">保存</el-button>
          <el-button type="primary" @click="confirmPass()">确认校对</el-button>
        </div>
        <div class="mt20">
          <p><span>状态</span></p>
          <p><b>待确认</b></p>
        </div>
      </div>
    </div>
    <show-evidence :arbi-info="arbiInfo" :hasReply="true">
      <p>决定书</p>
      <div>
        <quill-editor
          v-model="arbitralAwardContext"
          ref="quillEditor"
          :options="editorOption">
        </quill-editor>
      </div>
    </show-evidence>

  </div>
</template>
<script>
  import { api } from '@/api'
  import showEvidence from '@admin/components/showEvidence'
  export default {
    components: { showEvidence},
    data() {
      return {
        loading: false, //
        arbiInfo: {},
        arbitralContractAdvanceResponse: {},
        arbitralAwardContext: '',
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
        htmlString: '', // 保存原始模板字符串，
        id: '',
        checkDialogVisible: false,
        form: {
          radio: '1',
          remark: ''
        },
      }
    },
    methods: {
      onEditorChange(event){  // 内容改变事件
        // console.log(event.html)
      },
      queryData(){
        // this.loading = true;
        api.getArbitralDecisionReviewDetail({
          decisionId: this.$route.query.decisionId
        }).then((res) => {
          this.loading = false;
          if(res.data.code == '1'){
            this.arbiInfo = res.data.data
            this.arbiInfo.arbitralAttachment = res.data.data.arbitralAttachments || []
            this.arbiInfo.id = res.data.data.arbitralInfoId
            let htmlString = this.arbiInfo.htmlUrl
            this.htmlString = htmlString
            if(htmlString.indexOf('ql-editor') > -1){
              this.arbitralAwardContext = htmlString.match(/<div class=\'ql-editor\'>([\s\S]*?)<\/div>/)[1].replace(/((&#160;)|\s){4,}/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
            }
            else if(htmlString.indexOf('<body>') > -1){
              this.arbitralAwardContext = htmlString.match(/<body>([\s\S]*?)<\/body>/)[1]
            }
            else{
              this.arbitralAwardContext = htmlString
            }
          }
        })
      },
      confirmPass() {
        let paramString = this.getParams()
        this.loading = true
        const data = {
          htmlUrl: paramString,
          decisionId: this.$route.query.decisionId
        }
        api.reviewArbitralDecision(data).then((res) => {
          this.loading = false
          if (res.data.code === '1') {
            this.$message.success(res.data.msg)
            this.$router.go(-1)
          } else {
            this.$message.warning(res.data.msg)
          }
        })
      },
      getParams(){
        let paramString = this.arbitralAwardContext
        paramString = paramString.replace(/<br>/g, '<br \/>').replace(/&nbsp;/g, '&#160;').replace(/\s+style="[^"]*"/g,'').replace(/(?=[^>]*(?=<))\s/g,'&#160;')
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
        this.loading = true
        api.saveArbitralDecisionAward({
          decisionId: this.$route.query.decisionId,
          htmlUrl: paramString
        }).then((res) => {
          this.loading = false;
          if (res.data.code == '1') {
            this.$message.success(res.data.msg)
          } else {
            this.$message.warning(res.data.msg)
          }

        })
      },
      handelSubmit () {
        const API = this.form.radio === '1' ? api.checkArbitralDecisionPass : api.checkArbitralDecisionNoPass
        let data = {
          decisionId: this.$route.query.decisionId,
          remark: this.form.remark
        }
        API(data).then(res => {
          if (res.data.code === '1') {
            this.checkDialogVisible = false
            this.$message.success(res.data.msg)
            this.$router.go(-1)
          } else {
            this.$message.error(res.data.msg)
          }
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
  .css-save{
    background: rgba(168, 221, 241, 1);
    color: #fff;
  }
</style>
