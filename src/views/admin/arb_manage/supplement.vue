<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <list-filter :filter-data="formInline" :searchFn="search"></list-filter>
    <el-table :data="tableData" border style="width: 100%" header-cell-class-name="g-thead-class">
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
      <el-table-column prop="status" :show-overflow-tooltip="true" label="案件状态">
        <template slot-scope="scope">
          <span v-if="scope.row.arbProcessExplain == 1">申请</span>
          <span v-if="scope.row.arbProcessExplain == 2">立案</span>
          <span v-if="scope.row.arbProcessExplain == 3">答辩</span>
          <span v-if="scope.row.arbProcessExplain == 4">审理</span>
          <span v-if="scope.row.arbProcessExplain == 5">结案</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" :show-overflow-tooltip="true" label="更新时间">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <span class="revoke" @click="openDialog(scope.row)">证据补充</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog title="证据补充" :visible.sync="addDialogVisible" width="800px" :close-on-click-modal="false">
      <div v-loading="dialogLoading">
        <p style="font-size: 16px;font-weight: bold">案件编号：{{selectRow.code}}</p>
        <el-button @click="addEvidence" class="add-button margin-10"> + 新增证据资料</el-button>
        <upload-evidence
          ref="evidenceForm"
          :headers="headers"
          :my-evidences="evidences"
          :uploadUrl="uploadUrl"
          :fullWidth="true"
          :addEvidence="true"
          :evidenceNameIndex="evidenceNameIndex"
          :selectRow="selectRow"
        ></upload-evidence>
        <div class="el-upload__tip">只能上传pdf和word,jpg,png格式文件，且不超过10M</div>
        <!--<p>{{evidences}}</p>-->
        <upload-evidence-list :evidencesList="evidencesList"></upload-evidence-list>
        <div slot="footer" class="dialog-footer" style="text-align: center;">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="save()">确 定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
  import DICT from '@/const/dict'
import util from '@/util/util'
import uploadEvidence from '@/views/common/uploadEvidence'
import uploadEvidenceList from '@/views/common/uploadEvidenceList'
export default {
  components: { listFilter, uploadEvidence, uploadEvidenceList },
  data() {
    return {
      addDialogVisible: false,
      formInline: {
      },
      evidences: [],
      evidencesList: [],
      dialogLoading: false,
      selectRow: {},
      uploadUrl: api.uploadURL,
      tableData: [], //表格数据
      pageNo: 1,
      pageSize: 10, //每页多少条
      total: 0,
      loading: false, //
      arbTypes: DICT.arbTypes.map((v,i) => {
        let bool = i===0?true:false
        return {
          isActive: bool,
          value: v.arbStatus,
          label: v.label,
          content: v.content
        }
      }),
      arbStatus: '',
      evidenceNameIndex: 0
    }
  },
  methods: {
    openDialog (row) {
      this.addDialogVisible = true
      this.selectRow = row
      this.dialogLoading = true
      this.evidences = [{attachmentDatas: [], evidenceNameIndex: '', evidenceName: ''}]
      api.getEvidenceSuppleInfoByArbId({}, {arbitralInfoId: row.id}).then(res => {
        this.dialogLoading = false
        if (res.data.code == '1') {
          const list = res.data.data
          this.evidencesList = list.filter(val => val.evidenceProperty === 2)
          this.evidenceNameIndex = this.evidencesList.length + 1
          this.$nextTick(() => {
            this.$refs.evidenceForm.clearValidate()
          })
        }
      })
    },
    addEvidence(){
      this.$refs.evidenceForm.addList()
    },
    save () {
      this.$refs.evidenceForm.validateSubmit().then(() => {
        let params = {
          arbitralInfoId: this.selectRow.id
        }
        params.evidenceSuppleRequest = this.evidences.map(val => {
          let evidenceAttachment = val.attachmentDatas.map(val => ({
            fileName: val.attachName,
            filePath: val.attachUrlBase64
          }))
          return {
            evidenceContent: val.evidenceContent,
            evidenceTitle: val.evidenceTitle,
            evidenceName: val.evidenceName,
            evidenceAttachment
          }
        })
        console.log(params, 'params')
        api.suppleEvidence(params).then(res => {
          if (res.data.code === '1') {
            this.addDialogVisible = false
            this.$message.success('操作成功')
            this.getAllArbitralInfos()
          }
        })
      })
    },
    tabFilter(val){
      this.arbTypes.forEach((item, i) => {
        if(item.value === val){
          item.isActive = true
        }
        else if(item.isActive === true){
          item.isActive = false
        }
      })
      this.arbStatus = val
      this.search()
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
      this.getAllArbitralInfos();
    },
    pageSizeChange(val) {
      this.pageSize = val;
      this.getAllArbitralInfos();
    },
    pageNoChange(val) {
      this.pageNo = val;
      this.getAllArbitralInfos();
    },
    getAllArbitralInfos(){
      var arbStatusList = this.arbStatus?this.arbStatus.split(','): []
      if(arbStatusList.length > 0){
        this.formInline.arbStatusBegin = arbStatusList[0]
        this.formInline.arbStatusEnd = arbStatusList[arbStatusList.length-1]
      }
      else{
        delete this.formInline.arbStatusBegin
        delete this.formInline.arbStatusEnd
      }
      let params = Object.assign({},this.formInline, {
        pageNo: this.pageNo,
        pageSize: this.pageSize
      })
      delete params.status
      this.loading = true
      api.getEvidenceSuppleList(params).then(res => {
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
    }
  },
  computed: {
    headers(){
      return {
        Authorization: this.$store.state.admin.adminAccessToken
      }
    }
  },
  created(){
    this.getAllArbitralInfos()
  }
}

</script>
<style lang="scss" scoped>
.revoke {
  color: #409EFF;
  cursor: pointer;
}
  .margin-10{
    margin: 10px 0;
  }

</style>
