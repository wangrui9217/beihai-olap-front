<template>
  <div class="g-review-data" v-loading.fullscreen="loading">
    <div class="ly-header">
      <div class="msg">
        <h2>编号：{{arbiInfo.arbNumber || arbiInfo.arbTemporaryNumber}}</h2>
        <p><span>案由：</span>{{arbiInfo.arbName}}</p><p><span>产品类型：</span>{{arbiInfo.arbProductName}}</p>
        <p><span>申请人：</span>{{arbiInfo.arbProsecutorName}}</p><p><span>被申请人：</span>{{arbiInfo.arbDefendantName}}</p>
        <p><span>申请日期：</span>{{arbiInfo.createTime}}</p>
      </div>
      <div class="actions">
        <div>
          <el-button type="default" @click="$router.go(-1)">返回</el-button>
          <el-button class="css-save" @click="save()">保存</el-button>
          <el-button type="primary" @click="reviewPass()">核对</el-button>
        </div>
        <div class="mt20">
          <p><span>状态</span></p>
          <p><b>待核对</b></p>
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

    <!-- <div class="ly-body g-listpage__style">
      <p>审核仲裁申请书与证据是否一致</p>
      <div class="ly-main">
        <div class="ly-left">
          <p>仲裁申请书</p>
          <div style="padding: 20px 10px">
            <iframe v-if="pdfURL" :src="pdfURL" width="100%" height="600"></iframe>
            <img v-else-if="imgURL" :src="imgURL" style="max-width: 100%;height: auto;" />
            <p v-else-if="isOtherFile">此文件暂无法在页面中预览，请<span class="g-link" @click="downloadApplication()">下载查看</span></p>
          </div>
        </div>
        <div class="ly-right">
          <div class="select">
            <span>案件资料</span>
            <el-select v-model="attachUrlDes"  @change="getArbitralAttachment" style="height: 30px;">
              <el-option v-for="item in arbitralAttachment" :value="item.attachUrlDes" :label="item.attachName" :key="item.attachUrlDes"></el-option>
            </el-select>
          </div>
          <div style="padding: 20px 10px">
            <template v-if="evidence.attachTitle">
              <p><b>证据标题：</b>{{evidence.attachTitle}}</p>
              <p><b>证据说明：</b>{{evidence.attachContent}}</p>
            </template>
            <iframe v-if="evidence.pdfURL" :src="evidence.pdfURL" width="100%" height="600"></iframe>
            <img v-else-if="evidence.imgURL" :src="evidence.imgURL" style="max-width: 100%;height: auto;" />
            <p v-else-if="evidence.isOtherFile">此文件暂无法在页面中预览，请<span class="g-link" @click="downloadEvidence()">下载查看</span></p>
          </div>
        </div>
      </div>
    </div> -->
    <review-dialog title="核对案件资料" :reviewFn="review" ref="reviewDialog"></review-dialog>
  </div>
</template>
<script>
  import { api } from '@/api'
  import reviewDialog from '@admin/components/reviewDialog'
  // import downloadFileTool from '@/util/downloadFile'
  import showEvidence from '@admin/components/showEvidence'
  export default {
    components: { reviewDialog, showEvidence},
    data() {
      return {
        loading: false, //
        arbiInfo: {},
        // evidence: {
        //   pdfURL: '',
        //   imgURL: '',
        //   attachTitle: '',
        //   attachContent: '',
        //   isOtherFile: false
        // },
        // isOtherFile: false,
        // attachUrlDes: '',
        // pdfURL: '',
        // imgURL: '',
        // arbitralAttachmentURL: '',
        // arbitrationApplication: [],
        // arbitralAttachment: [],
        arbitralContractAdvancey: {},
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
        htmlString: '' // 保存原始模板字符串
      }
    },
    methods: {

      queryData () {
        this.loading = true
        api.getArbitralDecisionReviewDetail({
          decisionId: this.$route.query.decisionId
        }).then((res) => {
          this.loading = false
          if (res.data.code === '1') {
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
            // this.formatData()
            // }
            // else{
            //   this.$message.error('案件不在审核流程中，请返回上一级页面确认')
            // }
          }
        })
      },
      reviewPass() {
        this.$refs.reviewDialog.openDialog()
      },
      review(passOrNot, reviewTextarea){
        if (passOrNot === '2' && reviewTextarea === '') {
          this.$message.error('请输入意见')
          return
        }
        const params = {
          decisionId: this.$route.query.decisionId,
          remark: reviewTextarea,
          htmlUrl: this.getParams()
        }
        const API = passOrNot === '1' ? api.checkArbitralDecisionPass : api.checkArbitralDecisionNoPass
        this.loading = true
        API(params).then((res) => {
          this.loading = false
          if (res.data.code === '1') {
            this.$message.success(res.data.msg)
            this.$router.go(-1)
          } else {
            this.$message.error(res.data.msg)
          }
        })
      },
      // getArbitralAttachment(val){
      //   let obj = this.arbitralAttachment.find(item => {
      //     return item.attachUrlDes === val
      //   })
      //   this.evidence = Object.assign({},obj)
      //   this.evidence.isOtherFile = !(this.evidence.imgURL || this.evidence.pdfURL)
      // }，
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
        console.log(paramString)
        return
        this.loading = true
        api.saveArbitralDecisionAward({
          decisionId: this.$route.query.decisionId,
          htmlUrl: paramString
        }).then((res) => {
          this.loading = false;
          if (res.data.code == '1') {
            this.$message.success(res.data.msg);
          } else {
            this.$message.warning(res.data.msg);
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
    justify-content: space-between;
    padding: 0 30px;
    .msg{
      width: 800px;
      overflow: hidden;
      h2{
        margin-bottom: 20px;
        font-size: 20px;
        line-height: 32px;
        color: #333;
        font-weight: bold;
      }
      p{
        width: 360px;
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
      line-height: 40px;
      width: 55%;
      border:solid 1px #333;
      &>p{
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
        border-bottom: solid 1px #333;
        padding: 5px 0;
        span{
          display: inline-block;
          text-indent: 1em;
        }
      }

    }
  }
</style>
