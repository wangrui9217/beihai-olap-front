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
          <el-table-column prop="remark" :show-overflow-tooltip="true" label="备注">
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" label="操作">
            <template slot-scope="scope"><span class="g-link" @click="openReview(scope.row)">核对裁决书</span></template>
          </el-table-column>
        </el-table>
        <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-pageSize="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalNum">
        </el-pagination>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
import util from '@/util/util'
export default {
  components: { listFilter },
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
      tableData: [], //表格数据
      pageNo: 1,
      pageSize: 10, //每页多少条
      totalNum: 0,
      loading: false, //
      reviewDialogVisible: false,
      reviewTextarea: '',
      placeholder: '请输入理由（选填）',
      reviewRadio: '1'

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
        pageSize: this.pageSize
      })
      this.loading = true
      api.getAllArbitralInfosAboutCheckJudge(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let tableData = res.data.list
          tableData.forEach( v => {
            v.code = v.arbNumber || v.arbTemporaryNumber
            v.status = util.getStatus(v.arbStatus)

          })
          this.tableData = tableData
          this.totalNum = res.data.total
        }
        else{
          this.tableData = []
          this.totalNum = 0
        }
      })
    },
    openReview(row){
      this.$router.push({
        path: 'verifyDetail',
        query: {
          data: row.id
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
.revoke {
  color: #409EFF;
  cursor: pointer;
}

</style>
