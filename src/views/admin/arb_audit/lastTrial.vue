<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <list-filter :filter-data="formInline" :searchFn="search"></list-filter>
    <div>
      <el-button type="primary" icon="el-icon-edit" @click="openReview()" :disabled="selectedArbitral.length===0">审核</el-button>
    </div>
    <el-row class="mt20">
      <el-col>
        <el-table :data="tableData" ref="table" border style="width: 100%" @selection-change="handleSelectionChange" row-key="id">
          <el-table-column type="selection" width="60" :reserve-selection="true" label="序号">
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
          <el-table-column prop="recallStatus" :show-overflow-tooltip="true" label="初审结果">
          </el-table-column>
          <el-table-column prop="recallApplication" :show-overflow-tooltip="true" label="备注">
          </el-table-column>
        </el-table>
        <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-col>
    </el-row>
    <!--弹窗-->
    <review-dialog ref="reviewDialog" title="退回审核终审" :reviewFn="review"></review-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
import reviewDialog from '@admin/components/reviewDialog'
import util from '@/util/util'
export default {
  components: { listFilter, reviewDialog },
  data() {
    return {
      formInline: {
        // arbProductName: '',
        // arbProsecutorName: '',
        // arbDefendantName: '',
        // arbNumber: '',
        // arbName: '',
        // startTime: '', //查询开始时间
        // endTime: '' //查询end时间
      },
      tableData: [], //表格数据
      pageNo: 1,
      pageSize: 10, //每页多少条
      total: 0,
      loading: false, //
      selectedArbitral: []
    }
  },
  methods: {
    into(row) {
      let routeData = this.$router.resolve({
        name: "仲裁请求详情",
        query: {
          data: row.arbitralInfoId
        }
      });
      window.open(routeData.href, '_blank');
    },
    search() { //表单查询（搜索案件编号、案件名、申请人、被申请人。搜索字符长度不超过20个）
      this.pageNo = 1
      this.getPassFirstReviewInfos();
    },
    pageSizeChange(val) {
      this.pageSize = val;
      this.getPassFirstReviewInfos();
    },
    pageNoChange(val) {
      this.pageNo = val;
      this.getPassFirstReviewInfos();
    },
    getPassFirstReviewInfos(){
      let params = Object.assign(this.formInline, {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        reBackStatusList : [2,3]
      })
      this.loading = true
      api.getPassFirstReviewInfos(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let tableData = res.data.recallResponse
          tableData.forEach( v => {
            v.code = v.arbNumber || v.arbTemporaryNumber
            v.recallStatus = v.recallStatus===2?'通过':'不通过'
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
    openReview(){
      this.$refs.reviewDialog.openDialog()
    },
    
    handleSelectionChange(val){
      this.selectedArbitral = val
    },
    review(passOrNot, reviewTextarea) {
      if (passOrNot == '2' && reviewTextarea == '') {
        this.$message.error('请输入意见');
      } else {
        let status = 0
        if(passOrNot === '1'){
          status = 4
        }
        else{
          status = 5
        }
        let requests = this.selectedArbitral.map(item => {
            return {
              "arbitralInfoId": item.arbitralInfoId,
              "id": item.id,
              "recallRemark": reviewTextarea,
              "status": status
            }
          })
        let params = {
          "requests": requests
        }
        this.loading = true;
        api.addRecallInfoSecondReview(params).then((res) => {
          this.loading = false;
          this.$refs.reviewDialog.closeDialog()
          if (res.data.code == '1') {
            this.$message.success(res.data.msg);
            this.$refs['table'].clearSelection()
            this.getPassFirstReviewInfos()
          } else {
            this.$message.error(res.data.msg);
          }
        })
      }
    }
  },
  created(){
    this.getPassFirstReviewInfos()
  }
}

</script>
<style lang="scss" scoped>
.revoke {
  color: #409EFF;
  cursor: pointer;
}

</style>
