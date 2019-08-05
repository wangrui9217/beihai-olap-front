<!-- 组庭 -->
<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <list-filter :filter-data="formInline" :searchFn="search"></list-filter>
    <div class="mt20">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="60" label="序号">
        </el-table-column>
        <el-table-column label="案件编号" :show-overflow-tooltip="true" width="180">
          <template slot-scope="scope">
            <span class="revoke" @click="into(scope.row)">{{scope.row.arbNumber}}</span>
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
          <template slot-scope="scope"><span class="g-link" @click="openDialog(scope.row)">组庭</span></template>
        </el-table-column>
      </el-table>
      <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-pageSize="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <tribunal-dialog :postTribunalFn="hearJudge" ref="tribunalDialog"></tribunal-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
import tribunalDialog from '@admin/components/tribunalDialog'
import util from '@/util/util'
export default {
  components: { listFilter, tribunalDialog},
  data() {
    return {
      formInline: {},
      uploadUrl: api.uploadURL,
      tableData: [], //表格数据
      pageNo: 1,
      pageSize: 10, //每页多少条
      total: 0,
      loading: false, //
      mime: [".jpeg", ".jpg", ".png", ".doc", ".pdf", ".docx"],
      replyBrief: [],
      arbitralAttachment: [],
      arbitralInfo: {},
      headers: {
        Authorization: localStorage.getItem('adminAccessToken')
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
        //arbStatus: 6
      })
      this.loading = true
      api.getTribunalArbitralInfos(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let tableData = res.data.list
          tableData.forEach( v => {
            v.status = util.getStatus(v.arbStatus)
            v.arbArbitratorType = Number.parseInt(v.arbArbitratorType)
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
    hearJudge(formdata) {
      this.loading = true
      api.hearJudge(formdata).then((res) => {
        this.loading = false;
        if (res.data.code == '1') {
          this.$message.success(res.data.msg)
          this.$refs['tribunalDialog'].closeDialog()
          this.getArbitralInfosBySys()
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    openDialog(row){
      this.$refs['tribunalDialog'].openDialog(row)
    }
  },
  created(){
    this.getArbitralInfosBySys()
  }
}

</script>
<style lang="scss" scoped>
.revoke {
  color: #409EFF;
  cursor: pointer;
}

</style>
