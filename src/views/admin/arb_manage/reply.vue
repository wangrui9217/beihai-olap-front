<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <list-filter :filter-data="formInline" :searchFn="search"></list-filter>
    <el-row class="mt20">
      <el-col>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="60" label="序号">
          </el-table-column>
          <el-table-column label="案件编号" :show-overflow-tooltip="true" width="180">
            <template slot-scope="scope">
              <span class="g-link" @click="into(scope.row)">{{scope.row.code}}</span>
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
          <el-table-column :show-overflow-tooltip="true" label="操作">
            <template slot-scope="scope">
              <span class="css-noreply" @click="noreply(scope.row)">放弃</span>
              <span class="g-link" v-if="scope.row.defencesAttachState>0" @click="query(scope.row)">查看</span>
              <span class="g-link" v-else @click="openReview(scope.row)">上传</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-pageSize="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-col>
    </el-row>
    
    <el-dialog :title="dialogTitle" :visible.sync="reviewDialogVisible" width="800px" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="答辩书：" required>
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
      <div style="display: flex">
        <div class="reply-evidence-tit">证据资料：</div>
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="reviewDialogVisible = false">取 消</el-button>
        <el-button class="css-save" @click="save()">保 存</el-button>
        <el-button type="primary" @click="submit()">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
import uploadEvidence from '@/views/common/uploadEvidence'
import util from '@/util/util'
export default {
  components: { listFilter, uploadEvidence},
  data() {
    return {
      formInline: {
        arbProductName: '',
        arbProsecutorName: '',
        arbDefendantName: '',
        arbNumber: '',
        arbName: '',
        startTime: '', //查询开始时间
        endTime: '' //查询end时间
      },
      uploadUrl: api.uploadURL,
      tableData: [], //表格数据
      pageNo: 1,
      pageSize: 10, //每页多少条
      total: 0,
      loading: false, //
      reviewDialogVisible: false,
      mime: [".jpeg", ".jpg", ".png", ".doc", ".pdf", ".docx"],
      replyBrief: [],
      arbitralAttachment: [],
      arbitralInfo: {},
      dialogTitle: '上传答辩资料',
      params1: {
        attachType: 3,     //  1-案件申请 2-立案 3-答辩 4-审理 5-结案 6-充值' ,
        attachProperty: 4,    //  1-申请书，2-证据资料  4-答辩书 5-答辩证据 6-调解证据
        arbitralPtype: 1,    // 1-被申请人 2-申请人
        evidenceProperty: 4    // 1-申请书，2-证据资料，3-其他，4-答辩书 5-答辩证据 6-调解证据
      },
      params2: {
        attachType: 3,     //  1-案件申请 2-立案 3-答辩 4-审理 5-结案 6-充值' ,
        attachProperty: 5,    //  1-申请书，2-证据资料 4-答辩书 5-答辩证据 6-调解证据
        arbitralPtype: 1,    // 1-被申请人 2-申请人
        evidenceProperty: 5    // 1-申请书，2-证据资料，3-其他，4-答辩书 5-答辩证据 6-调解证据
      }
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
      this.getArbitralInfosBySys();
    },
    pageSizeChange(val) {
      this.pageSize = val;
      this.getArbitralInfosBySys();
    },
    pageNoChange(val) {
      this.pageNo = val;
      this.getArbitralInfosBySys();
    },
    getArbitralInfosBySys(){
      let params = Object.assign(this.formInline, {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        //arbStatus: 5
      })
      this.loading = true
      api.getReplyArbitralInfos(params).then(res => {
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
    addEvidence(){
      this.$refs.evidenceForm2.add()
    },
    openReview(row){
      this.replyBrief = []
      this.arbitralAttachment = []
      this.dialogTitle = '上传答辩资料'
      this.reviewDialogVisible = true;
      this.arbitralInfo = row
      this.$nextTick(() => {
        this.$refs.evidenceForm1.add()
      })
    },
    query(row){
      this.replyBrief = []
      this.arbitralAttachment = []
      this.arbitralInfo = row
      this.loading = true
      this.dialogTitle = '查看答辩资料'
      api.getDefencesAttachInfos({
        "arbitralInfoId": this.arbitralInfo.id,
        "evidenceProperty": 5
      }).then(res=> {
        this.loading = false
        if(res.data.code === '1'){
          let data = res.data.data
          if(data.length === 0){
            this.reviewDialogVisible = true;
            this.$nextTick(() => {
              this.$refs.evidenceForm1.add()
            })
          }
          else{
            data.forEach(item => {
              item.arbAttachmentDatas&&item.arbAttachmentDatas.forEach(file => {
                file.attachUrlBase64 = file.attachUrl
                file.attachStatus = 1
              })
              item.attachmentDatas = item.arbAttachmentDatas || []
              item.fileFormName = util.uuidfn()
              item.arbAttachmentDatas = undefined
              if(item.evidenceProperty === 4){
                this.replyBrief.push(item)
              }
              else{
                item.evidenceContent = util.decodeTEXT(item.evidenceContent)
                this.arbitralAttachment.push(item)
              }
            })
            this.reviewDialogVisible = true;
            if(this.replyBrief.length === 0){
              this.$nextTick(() => {
                this.$refs.evidenceForm1.add()
              })
            }
          }
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    noreply(row){
      this.$confirm('放弃“' + row.code +'”案件答辩，放弃后将进入下一流程。是否确认？','提示',{
        type:'warning'
      }).then(() => {
        this.loading = true
        api.noDefences({
          "arbitralInfoId": row.id,
          "processTaskId": row.arbProcessTask
        }).then(res => {
          this.loading = false
          if(res.data.code === '1'){
            this.$message.success(res.data.msg)
            this.getArbitralInfosBySys()
          }
          else{
            this.$message.error(res.data.msg)
          }
        })
      }).catch(() => {})
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
        this.httpSave('submit')
      }
    },
    save(){
      let errorText = []
      if(this.replyBrief.length=== 0 || this.replyBrief[0].attachmentDatas.length === 0){
        if(this.arbitralAttachment.length === 0){
          this.$message.error('请先输入数据或上传文件')
          return false
        }
      }
      this.httpSave()
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
      api.saveOrUpdateDefencesAttachInfos(data).then((res) => {
        if (res.data.code == '1') {
          this.$message.success(res.data.msg);
          this.reviewDialogVisible = false
          if(type === 'submit'){
            let data = {
              "arbitralInfoId": this.arbitralInfo.id,
              "processTaskId": this.arbitralInfo.arbProcessTask
            }
            api.defencesSuccess(data).then((res) => {
              this.loading = false;
              if (res.data.code == '1') {
                this.getArbitralInfosBySys()
              } else {
                this.$message.error(res.data.msg);
              }
            })
          }
          else{
            this.getArbitralInfosBySys()
            this.loading = false;
          }
        } else {
          this.loading = false;
          this.$message.error(res.data.msg);
        }
      })
    }
  },
  created(){
    this.getArbitralInfosBySys()
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
  width: 115px;
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
</style>
