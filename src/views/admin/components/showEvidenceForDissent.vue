<template>
  <div class="ly-body g-listpage__style">
    <div class="ly-main">
      <div class="ly-left">
        <slot>
          <p>异议申请书</p>
          <div style="padding: 20px 10px">
            <iframe v-if="pdfURL" :src="pdfURL" width="100%" height="600"></iframe>
            <img v-else-if="imgURL" :src="imgURL" style="max-width: 100%;height: auto;" />
            <p v-else-if="isOtherFile">此文件暂无法在页面中预览，请<span class="g-link" @click="downloadApplication()">下载查看</span></p>
          </div>
        </slot>
      </div>
      <div class="ly-right">
        <!--<div class="select">-->
          <!--<span>案件编号</span>-->
          <!--<el-select v-model="caseNumber" @change="getCasenum" style="height: 30px;">-->
            <!--<el-option v-for="item in arbitralEvidenceResponse" :value="item.arbitralInfoId" :label="item.arbNumber" :key="item.arbitralInfoId"></el-option>-->
          <!--</el-select>-->
        <!--</div>-->
        <div class="select">
          <span>证据资料</span>
          <el-select v-model="evidenceName" @change="getEvidence" style="height: 30px;">
            <el-option v-for="item in evidences" :value="item.attachmentEvidenceId" :label="item.name" :key="item.attachmentEvidenceId"></el-option>
          </el-select>
        </div>
        <div class="select1">
          <p>证据文件：</p>
          <el-select v-model="attachUrlDes" @change="getAttachment" style="height: 30px;">
            <el-option v-for="item in attachments" :value="item.attachUrlDes" :label="item.firstName" :key="item.attachUrlDes"></el-option>
          </el-select>
          <div class="evidence-content" v-if="evidence.evidenceContent"><span>证明内容：</span><b v-html="evidence.evidenceContent"></b></div>
        </div>
        <div style="padding: 20px 10px">
          <iframe v-if="attachment.pdfURL" :src="attachment.pdfURL" width="100%" height="600"></iframe>
          <img v-else-if="attachment.imgURL" :src="attachment.imgURL" style="max-width: 100%;height: auto;" />
          <p v-else-if="attachment.isOtherFile">此文件暂无法在页面中预览，请<span class="g-link" @click="downloadEvidence()">下载查看</span></p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { api } from '@/api'
import downloadFileTool from '@/util/downloadFile'
export default {
  props: {
    arbiInfo: Object,
    hasReply: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  data() {
    return {
      attachment: {
        pdfURL: '',
        imgURL: '',
        isOtherFile: false
      },
      evidence: {
        evidenceContent: ''
      },
      isOtherFile: false,
      evidenceName: '',
      attachUrlDes: '',
      pdfURL: '',
      imgURL: '',
      arbitrationApplication: [],
      application: {},
      evidences: [],
      attachments: [],
      isEvidence: false,
      caseNumber: '',
      arbitralEvidenceResponse: []
    }
  },
  watch: {
    arbiInfo: function() {
      this.formatData()
    }
  },
  methods: {
    getCasenum(val) {
      let temp = this.arbitralEvidenceResponse.find(value => value.arbitralInfoId === val) || {}
      this.evidences = temp.envidence || []
    },
    getEvidence(val) {
      if (val) {
        console.log(val,'val');
        
        let obj = this.evidences.find(item => {
          return item.attachmentEvidenceId === val
        })
        this.attachments = obj.arbAttachmentDatas
        this.evidence.evidenceContent = obj.evidenceContent
        this.attachUrlDes = ''
        this.attachment = {}
        this.isEvidence = true
        // 默认显示第一个附件
        this.attachUrlDes = this.attachments[0].attachUrlDes || ''
        this.getAttachment(this.attachUrlDes)
      }
    },
    getAttachment(val) {
      if (val) {
        let obj = this.attachments.find(item => {
          return item.attachUrlDes === val
        })
        this.attachment = Object.assign(obj)
        this.attachment.isOtherFile = !(this.attachment.imgURL || this.attachment.pdfURL)
      }
    },
    formatData() {
      console.log(this.arbiInfo, 'arbiInfo')
      if (Object.keys(this.arbiInfo).length === 0) {
        return false
      }
      let mimeType = ['.jpg', '.jpeg', '.png']
      // 异议申请书
      this.arbiInfo.arbitralAttachments.forEach(item => {
        if (item.evidenceProperty === 7) {
           
          this.arbitrationApplication.push(item) // 异议申请书
        }
      })
      if (this.arbitrationApplication.length === 0) {
        this.$message.error('仲裁申请书不存在，请检查案件数据')
        return false
      } else {
        this.application = this.arbitrationApplication[0].arbAttachmentDatas[0]
        console.log("----------------66666666666----");
        console.log(this.application);
        let endName = this.application.attachName.substring(this.application.attachName.lastIndexOf('.')).toLowerCase()
        if (mimeType.indexOf(endName) > -1) {
          this.imgURL = api.getImgURL(this.application.attachUrlDes)
        } else if (endName === '.pdf') {
          api.downloadPdfFile({
            pdfUrl: this.application.attachUrlDes
          }).then(res => {
            if (res.data instanceof Blob) {
              this.pdfURL = window.URL.createObjectURL(res.data);
            }
          })
        } else {
          this.isOtherFile = true
        }
      }

      if (this.hasReply === false) { //不包含答辩资料
      
        this.arbiInfo.arbitralAttachments.forEach(item => {
          if (item.evidenceProperty === 8) {
            this.evidences.push(item) //  证据资料
          }
        })
      } else { //包含答辩资料
     
        this.arbiInfo.arbitralAttachments && this.arbiInfo.arbitralAttachments.forEach(item => {
          if (item.evidenceProperty === 7) { // 异议申请书
            item.name = '异议申请书'
            item.evidenceContent = '异议申请书'
          } else if (item.evidenceProperty === 8) { //  答辩书
            item.name = item.evidenceName
            item.evidenceContent = item.evidenceName
          }
           if (item.evidenceProperty != 7) { // 异议申请书
           this.evidences.push(item)
          } 
        })
        // this.evidences = this.arbiInfo.arbitralAttachments
      }

      // let applyedArr = this.arbiInfo.arbitralPInfo || []
      // applyedArr.forEach(item => {
      //   if (item.coType === undefined) { // 自然人
      //   	let prefix = '被申请人-' + item.pRealname
      //     this.evidences.push({
      //       name: prefix + '-身份证正面',
      //       arbAttachmentDatas: [{
      //         attachName: prefix + '-身份证正面.jpg',
      //         attachUrlDes: item.pIdAttachForntDes
      //       }]
      //     }, {
      //       name: prefix + '-身份证背面',
      //       arbAttachmentDatas: [{
      //         attachName: prefix + '-身份证背面.jpg',
      //         attachUrlDes: item.pIdAttachRearDes,
      //       }]
      //     })
      //   }
      // })
      let peopleInfos = []
      if(this.arbiInfo.arbitralCoInfo instanceof Array === true){
        peopleInfos = peopleInfos.concat(this.arbiInfo.arbitralCoInfo)
      }
      if(this.arbiInfo.arbitralPInfo instanceof Array === true){
        peopleInfos = peopleInfos.concat(this.arbiInfo.arbitralPInfo)
      }
      // this.arbiInfo.arbitralCoInfo && this.arbiInfo.arbitralCoInfo.forEach(item => {
      //   if(item.coType===1){
      //     applyedArr.push(item)
      //   }
      //   else{
      //    applyers.push(item)
      //   }
      // })
      // this.arbiInfo.arbitralPInfo && this.arbiInfo.arbitralPInfo.forEach(item => {
      //   if(item.pType===1){
      //     applyedArr.push(item)
      //   }
      //   else{
      //    applyers.push(item)
      //   }
      // })
      peopleInfos.sort((info1, info2) => {  // 申请人排在前
        let type1 = info1.pType || info1.coType
        let type2 = info2.pType || info2.coType
        return type2 - type1
      })
      peopleInfos.forEach(item => {
        let name = ''
        if(item.coType===1 || item.pType===1){
          name = '被申请人-' + (item.coName || item.pRealname) + '-资料'
        }
        else {
          name = '申请人-' + (item.coName || item.pRealname) + '-资料'
        }
        let o = {
          name: name,
          arbAttachmentDatas: []
        }
        if(item.coLicenceAttachDes){
          o.arbAttachmentDatas.push({
            attachUrlDes: item.coLicenceAttachDes,
            attachName: '营业执照' + this.getLastName(item.coLicenceAttach)
          })
        }
        if(item.coIdPaperAttachDes){
          o.arbAttachmentDatas.push({
            attachUrlDes: item.coIdPaperAttachDes,
            attachName: '身份证明' + this.getLastName(item.coIdPaperAttach)
          })
        }
        if(item.coIdAttachForntDes){
          o.arbAttachmentDatas.push({
            attachUrlDes: item.coIdAttachForntDes,
            attachName: '身份证正面' + this.getLastName(item.coIdAttachFornt)
          })
        }
        if(item.coIdAttachRearDes){
          o.arbAttachmentDatas.push({
            attachUrlDes: item.coIdAttachRearDes,
            attachName: '身份证反面' + this.getLastName(item.coIdAttachRear)
          })
        }
        if(item.pIdAttachForntDes){
          o.arbAttachmentDatas.push({
            attachUrlDes: item.pIdAttachForntDes,
            attachName: '身份证正面' + this.getLastName(item.pIdAttachFornt)
          })
        }
        if(item.pIdAttachRearDes){
          o.arbAttachmentDatas.push({
            attachUrlDes: item.pIdAttachRearDes,
            attachName: '身份证反面' + this.getLastName(item.pIdAttachRear)
          })
        }
        this.evidences.push(o)
      })
      console.log(this.evidences,'this.ev');
      
      this.evidences.forEach(item => {
        if (item.name === undefined) {
          item.name = item.evidenceName
          console.log(item,'ite');
          
          if (item.evidenceProperty === 9||item.evidenceProperty === 10) {
            item.name = '答辩证据：' + item.name
          } 
          if(item.evidenceProperty===8) {
            item.name = '申请证据：' + item.name
          }
        }
        item.arbAttachmentDatas.forEach(file => {
          let endName = file.attachName.substring(file.attachName.lastIndexOf('.')).toLowerCase()
          file.firstName = file.attachName.substring(0, file.attachName.lastIndexOf('.'))
          if (mimeType.indexOf(endName) > -1) {
            file.imgURL = api.getImgURL(file.attachUrlDes)
          } else if (endName === '.pdf') {
            file.pdfURL = ''
            api.downloadPdfFile({
              pdfUrl: file.attachUrlDes
            }).then(res => {
              if (res.data instanceof Blob) {
                file.pdfURL = window.URL.createObjectURL(res.data);
              }
            })
          } else {
            file.isOtherFile = true
          }
        })
      })
      this.evidenceName = this.evidences[0].name
      setTimeout(() => {
        this.getEvidence(this.evidences[0].attachmentEvidenceId) // 初始化
      }, 1000)
    },
    getLastName(filaName){
      if(typeof filaName === 'string'){
        return filaName.substring(filaName.lastIndexOf('.')).toLowerCase()
      }
      else{
        return ''
      }
    },
    downloadApplication() {
      this.downloadFun(this.application.attachUrlDes, this.application.attachName)
    },
    downloadEvidence() {
      this.downloadFun(this.attachment.attachUrlDes, this.attachment.attachName)
    },
    downloadFun(url, name) {
      api.downloadOtherFile({
        filePath: url,
        fileName: name
      }).then(res => {
        if (res.data instanceof Blob) {
          downloadFileTool(res.data, name)
        }
      })
    },
    getArbitralInfoDetailForMergeHearRecord () {
      console.log(22222222222)
      // let id = '09edfb1ab03111e9bfbe005056ae47c6' || this.$route.query.data
      api.getArbitralInfoDetailForMergeHearRecord({id: '09edfb1ab03111e9bfbe005056ae47c6'}).then(res => {
        if (res.data.code === '1') {
          this.arbitralEvidenceResponse = res.data.data.arbitralEvidenceResponse
        }
      })
    }
  },
  created() {
    // this.getArbitralInfoDetailForMergeHearRecord()
  }
}

</script>
<style lang="scss" scoped>
.ly-body {
  margin-top: 10px;

  &>p {
    font-size: 14px;
    background: #ffe6e6;
    line-height: 37px;
    text-indent: 1em;
  }
}

.ly-main {
  display: flex;
  font-size: 14px;
  min-height: 600px;

  .ly-left {
    width: 55%;
    border: solid 1px #333;

    &>p {
      line-height: 40px;
      text-indent: 1em;
      border-bottom: solid 1px #333;
    }
  }

  .ly-right {
    margin-left: 20px;
    width: 45%;
    border: solid 1px #333;
    line-height: 30px;

    .select {
      border-bottom: solid 1px #333;
      padding: 5px 0;

      span {
        display: inline-block;
        text-indent: 1em;
      }
    }

    .select1 {
      margin-top: 10px;
      border-bottom: solid 1px #ccc;
      padding: 5px 0 5px 20px;

      p {
        display: inline-block;
      }

      .evidence-content {
        margin-top: 5px;
        b{
          font-weight: normal;
        }
      }
    }
  }
}

</style>
