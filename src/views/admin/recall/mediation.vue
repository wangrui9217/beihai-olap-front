<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <list-filter :filter-data="formInline" :searchFn="search"></list-filter>
    <el-row class="mt20">
      <el-col>
        <el-table :data="tableData" ref="table" border style="width: 100%" >
          <el-table-column type="index" width="60" label="序号">
          </el-table-column>
          <el-table-column label="案件编号" :show-overflow-tooltip="true" width="180">
            <template slot-scope="scope">
              <span class="revoke" @click="into(scope.row)">{{scope.row.code}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="arbName" :show-overflow-tooltip="true" label="案由">
          </el-table-column>
          <el-table-column prop="arbProsecutorName" :show-overflow-tooltip="true" label="申请人">
          </el-table-column>
          <el-table-column prop="arbProductName" :show-overflow-tooltip="true" label="产品类型">
          </el-table-column>
          <el-table-column prop="arbDefendantName" :show-overflow-tooltip="true" label="被申请人">
          </el-table-column>
          <el-table-column prop="createTime" :show-overflow-tooltip="true" label="申请时间">
          </el-table-column>
          <el-table-column prop="status" label="案件状态">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span class="revoke" @click="download(scope.row)">下载</span>
              <span class="g-link" v-if="scope.row.mediateDocumentCounts > 0"  @click="query(scope.row)">上传</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-col>
    </el-row>
    <el-dialog title="上传调解资料" :visible.sync="dialogVisible" width="800px" :close-on-click-modal="false">
      <!-- <el-form label-width="100px">
        <el-form-item label="调解书：" required>
          <div class="css-upload-box">
            <upload-evidence
              style="width:597px"
              ref="evidenceForm1"
              :my-evidences="mediationDocumentData"
              :headers="headers"
              :simple="true"
              :noborder="true"
              :uploadUrl="uploadUrl"
              :params="params1"
              :is-mediation="true"
            ></upload-evidence>
          </div>
        </el-form-item>
      </el-form> -->
      <div class="css-upload-box">
        <upload-evidence
          style="width:597px"
          ref="evidenceForm1"
          :my-evidences="mediationDocumentData"
          :headers="headers"

          :noborder="true"
          :uploadUrl="uploadUrl"
          :params="params1"
          :is-mediation="true"
        ></upload-evidence>
      </div>
      <div class="css-upload-box">
        <!-- <div class="css-upload-box"> -->
          <upload-evidence
            style="width:597px"
            ref="evidenceForm2"
            :my-evidences="mediationRecord"
            :headers="headers"
            :noborder="true"
            :uploadUrl="uploadUrl"
            :is-mediation="true"
            :params="params1"
          ></upload-evidence>
        <!-- </div> -->
      </div>
      <!-- <el-form label-width="100px">
        <el-form-item label="调解笔录：" required>

        </el-form-item>
      </el-form> -->
          <div class="css-upload-box">
            <upload-evidence
            style="width:597px"
            ref="evidenceForm3"
            :simple="true"
            :noborder="true"
            :headers="headers"
            :my-evidences="mediationAttachDatas"
            :uploadUrl="uploadUrl"
            :params="params2"
            :is-data="true"
          ></upload-evidence>
          </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button class="css-save" @click="save()">保 存</el-button>
        <el-button type="primary" @click="submit()">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
import util from '@/util/util'
import DownloadFile from '@/util/downloadFile'
import uploadEvidence from '@/views/common/uploadEvidence'
export default {
  components: { listFilter, uploadEvidence},
  data() {
    return {
      uploadUrl: api.uploadURL,
      formInline: {},
      tableData: [], //表格数据
      pageNo: 1,
      pageSize: 10, //每页多少条
      total: 0,
      loading: false, //
      dialogVisible: false,
      params1: {
        attachType: '',     //  1-案件申请 2-立案 3-答辩 4-审理 5-结案 6-充值' ,
        attachProperty: '',    //  1-申请书，2-证据资料  4-答辩书 5-答辩证据 6-调解证据
        arbitralPtype: '',    // 1-被申请人 2-申请人
        evidenceProperty: ''    // 1-申请书，2-证据资料，3-其他，4-答辩书 5-答辩证据 6-调解证据
      },
      params2: {
        attachType: 5,     //  1-案件申请 2-立案 3-答辩 4-审理 5-结案 6-充值' ,
        attachProperty: 6,    //  1-申请书，2-证据资料 4-答辩书 5-答辩证据 6-调解证据
        arbitralPtype: '',    // 1-被申请人 2-申请人
        evidenceProperty: 6    // 1-申请书，2-证据资料，3-其他，4-答辩书 5-答辩证据 6-调解证据
      },
      mediationAttachDatas: [],
      mediationRecord: [],
      mediationDocumentData: [],
      arbitralInfo: null
    }
  },
  computed: {
   headers(){
     return {
       Authorization: this.$store.state.admin.adminAccessToken
     }
   }
  },
  methods: {
    // addEvidence(){
    //   this.$refs.evidenceForm2.add()
    // },
    openReview(row){
      this.mediationAttachDatas = []
      this.mediationRecord = []
      this.mediationDocumentData = []
      this.dialogVisible = true;
      this.arbitralInfo = row
      this.$nextTick(() => {
        this.$refs.evidenceForm1.add()
        this.$refs.evidenceForm2.add()
        this.$refs.evidenceForm3.add()
      })
    },
    query(row){
      this.mediationAttachDatas = []
      this.mediationRecord = []
      this.mediationDocumentData = []
      this.arbitralInfo = row
      this.loading = true
      api.getMediationAttachInfos({
        "arbitralInfoId": this.arbitralInfo.id,
        "evidenceProperty": 6
      }).then(res=> {
        this.loading = false
        if(res.data.code === '1'){
          let data = res.data.data || []  // 证据
          let mediations = res.data.mediationDocumentData || [] // 调解书和调解笔录
          let documentData = []
          let record = []
          mediations.forEach(item => {
            if(item.documentType === 8){   // 调解书
              documentData.push({
                documentId: item.documentId,
                documentUserName: '申请人-' + item.documentUserName,
                userName: item.documentUserName,
                attachmentDatas: [{
                  attachUrlBase64: item.documentSignatureUrl,
                  attachName: item.documentName,
                  attachType: '',
                  attachProperty: '',
                  attachStatus: 1,
                  url: api.getPdfURL(item.documentGeneratorUrlDes)
                }]
              })
            }
            else{    // 调解笔录
              record.push({
                documentId: item.documentId,
                attachmentDatas: [{
                  attachUrlBase64: item.documentSignatureUrl,
                  attachName: item.documentName,
                  attachType: '',
                  attachProperty: '',
                  attachStatus: 1,
                  url: api.getPdfURL(item.documentGeneratorUrlDes)
                }]
              })
            }
          })
          //if(documentData.length > 0){
            this.mediationDocumentData.push({
              evidenceName: '调解书',
              list: documentData
            })
          //}
          //if(record.length > 0){
            this.mediationRecord.push({
              evidenceName: '调解笔录',
              list: record
            })
          //}
          data.forEach(item => {
            item.arbAttachmentDatas&&item.arbAttachmentDatas.forEach(file => {
              file.attachUrlBase64 = file.attachUrl
              file.attachStatus = 1
            })
            item.attachmentDatas = item.arbAttachmentDatas || []
            item.fileFormName = util.uuidfn()
            item.arbAttachmentDatas = undefined
            if(item.evidenceProperty === 6){
              this.mediationAttachDatas.push(item)
            }
          })
          this.dialogVisible = true;
          // if(this.mediationDocumentData.length === 0){
          //   this.$nextTick(() => {
          //     this.$refs.evidenceForm1.add()
          //   })
          // }
          // if(this.mediationRecord.length === 0){
          //   this.$nextTick(() => {
          //     this.$refs.evidenceForm2.add()
          //   })
          // }
          if(this.mediationAttachDatas.length === 0){
            this.mediationAttachDatas.push({
              attachmentEvidenceStatus: 1,
              arbitralPtype: this.params2.arbitralPtype,     // 1-被申请人 2-申请人
              evidenceProperty: this.params2.evidenceProperty,  // 证据属性 1-申请书，2-证据资料，3-其他
              fileFormName: util.uuidfn(),
              evidenceName: '调解证据',
              evidenceTitle: '',
              evidenceContent: '',
              attachmentDatas: []
            })
          }
        }
        else{
          this.openReview(row)
        }
      })
    },
    save(){
      let errorText = []
      let has1 = false
      let has2 = false
      this.mediationDocumentData[0].list.forEach(item => {
        if(item.attachmentDatas[0].attachUrlBase64){
          has1 = true
        }
      })
      this.mediationRecord[0].list.forEach(item => {
        if(item.attachmentDatas[0].attachUrlBase64){
          has2 = true
        }
      })
      if(has1 === false && has2 === false && this.mediationAttachDatas[0].attachmentDatas.length === 0){
        this.$message.error('请先上传文件')
        return false
      }
      this.httpSave()
    },
    httpSave(type){
      this.loading = true
      let data = []
      this.mediationDocumentData[0].list.forEach(item => {
        if(item.attachmentDatas[0].attachUrlBase64){
          data.push({
            "documentSignatureUrl": item.attachmentDatas[0].attachUrlBase64,
            "documentType": 8,
            "documentId": item.documentId,
            "documentName": item.attachmentDatas[0].attachName,
            "documentUserName": item.userName
          })
        }
      })
      this.mediationRecord[0].list.forEach(item => {
        if(item.attachmentDatas[0].attachUrlBase64){
          data.push({
            "documentSignatureUrl": item.attachmentDatas[0].attachUrlBase64,
            "documentType": 9,
            "documentId": item.documentId,
            "documentName": item.attachmentDatas[0].attachName
          })
        }
      })
      let mediationAttachDatas = []
      if(this.mediationAttachDatas[0].attachmentDatas.length > 0){
        this.mediationAttachDatas[0].evidenceName = ''
        mediationAttachDatas = this.mediationAttachDatas
      }
      let params = {
        "arbitralInfoId": this.arbitralInfo.id,
        "mediationAttachDatas": mediationAttachDatas,
        "mediationDocumentData": data
      }
      params.mediationAttachDatas.forEach(item => {
        if(item.attachmentEvidenceId){
          item.attachmentDatas.forEach(file => {
            file.arbitralAttachmentEvidenceId = item.attachmentEvidenceId
          })
        }
      })
      api.saveMediationAttach(params).then((res) => {
        if (res.data.code == '1') {
          this.dialogVisible = false
          if(type === 'submit'){
            let data = {
              "arbitralInfoId": this.arbitralInfo.id,
              "processTaskId": this.arbitralInfo.arbProcessTask
            }
            api.arbitralMediateSuccess(data).then((res) => {
              this.loading = false;
              if (res.data.code == '1') {
                this.$message.success(res.data.msg);
                this.getList()
              } else {
                this.$message.error(res.data.msg);
              }
            })
          }
          else{
            this.getList()
            this.loading = false;
          }
        } else {
          this.loading = false;
          this.$message.error(res.data.msg);
        }
      })
    },
    into(row) {
      let routeData = this.$router.resolve({
        name: "仲裁请求详情",
        query: {
          data: row.id
        }
      });
      window.open(routeData.href, '_blank');
    },
    search() { //表单查询（搜索案件编号、案件名、申请人、被申请人。搜索字符长度不超过20个）
      this.pageNo = 1
      this.getList();
    },
    pageSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    pageNoChange(val) {
      this.pageNo = val;
      this.getList();
    },
    getList(){
      let params = Object.assign({},this.formInline, {
        pageNo: this.pageNo,
        pageSize: this.pageSize
      })
      this.loading = true
      api.getMediateArbitralInfos(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let tableData = res.data.list
          tableData.forEach( v => {
            v.code = v.arbNumber || v.arbTemporaryNumber
            v.status = util.getStatus(v.arbStatus)

          })
          this.tableData = tableData
          this.total = res.data.total
        }
        else{
          this.tableData = []
          this.total = 0
        }
      })
    },
    download(row){
      this.loading = true
      api.getMediationDocument({
        arbitralInfoId: row.id
      }).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let data = res.data.mediationDocumentDatas
          data.forEach(item => {
            let url = api.getPdfURL(item.documentGeneratorUrlDes)
            DownloadFile(url, item.documentName)
          })
          row.mediateDocumentCounts = 1
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    submit() {
      let errorText = []
      this.mediationDocumentData[0].list.forEach(item => {
        if(!item.attachmentDatas[0].attachUrlBase64){
          errorText.push(item.documentUserName + '的调解书未上传')
        }
      })
      this.mediationRecord[0].list.forEach(item => {
        if(!item.attachmentDatas[0].attachUrlBase64){
         errorText.push('调解笔录未上传')
        }
      })
      if(errorText.length > 0){
        this.$message.error(errorText[0])
      }
      else{
        this.httpSave('submit')
      }
    },
  },
  created(){
    this.getList()
  }
}

</script>
<style lang="scss" scoped>
.revoke {
  color: #409EFF;
  cursor: pointer;
}
.css-upload-box{
  margin-top: -30px;
}
.css-save{
  background: rgba(168, 221, 241, 1);
  color: #fff;
}
</style>
