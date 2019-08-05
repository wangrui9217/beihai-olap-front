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
          <el-table-column prop="arbDecisionProsecutorName" :show-overflow-tooltip="true" label="异议申请人" width="180">
          </el-table-column>
          <el-table-column prop="arbDefendantName" :show-overflow-tooltip="true" label="被申请人">
          </el-table-column>
          <el-table-column prop="createTime" :show-overflow-tooltip="true" label="申请时间">
          </el-table-column>
          <el-table-column prop="status" label="案件状态">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span class="g-link"  @click="handelCheck(scope.row)">校对决定书</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-col>
    </el-row>
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
    handelCheck (row) {
      this.$router.push({
        path: 'dissentCheckDetail',
        query: {
          data: row.id,
          decisionId: row.decisionId
        }
      })
    },
    openReview(row){
    },
    query(row){
    },
    save(){
    },
    httpSave(type){
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
      api.getArbitralDecisionReviewInfos(params).then(res => {
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
    },
    submit() {
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
