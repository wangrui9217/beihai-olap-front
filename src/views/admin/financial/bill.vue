<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <div>
      <span>申请人：</span>
      <el-input class="formula-form" v-model.trim="filter.capitalName" placeholder="申请人" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
   
    <el-table :data="tableData" border style="margin-top: 20px">
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column prop="capitalName" label="申请人" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column label="预充值金额（元）">
        <template slot-scope="scope"><span class="g-link" @click="queryDetail('charge',scope.row)">{{scope.row.inCapital}}</span></template>
      </el-table-column>
      <el-table-column label="缴费金额（元）">
        <template slot-scope="scope"><span class="g-link" @click="queryDetail('pay',scope.row)">{{scope.row.outCapital}}</span></template>
      </el-table-column>
      <el-table-column label="退费金额（元）">
        <template slot-scope="scope"><span class="g-link" @click="queryDetail('return',scope.row)">{{scope.row.returnMoney}}</span></template>
      </el-table-column>
      <el-table-column prop="remainSum" label="可用余额">
      </el-table-column>
    </el-table>
    <el-pagination @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog title="缴费查询" :visible.sync="payDetailDialog" width="800px" :close-on-click-modal= "false">
      <div style="height: 300px;overflow: auto;">
        <el-table :data="payDetail" style="width: 100%" stripe>
          <el-table-column type="index" width="50">
          </el-table-column>
          <el-table-column prop="code" label="案件编号" :show-overflow-tooltip="true">
          </el-table-column>
          <el-table-column prop="capitalName" label="申请人" :show-overflow-tooltip="true">
          </el-table-column>
          <el-table-column prop="capital" label="仲裁费用（元）">
          </el-table-column>
          <el-table-column prop="capitalMoneyTime" label="创建时间" :show-overflow-tooltip="true">
          </el-table-column>
        </el-table>
        <div class="load-more-gif g-link" v-if="!detailloading" @click="loadmore">加载更多</div>
      </div>
      
    </el-dialog>
    <el-dialog title="预充值查询" :visible.sync="chargeDetailDialog" width="800px" :close-on-click-modal= "false">
      <div style="height: 300px;overflow: auto;">
        <el-table :data="chargeDetail" style="width: 100%" stripe>
          <el-table-column type="index" width="50">
          </el-table-column>
          <el-table-column prop="capitalName" label="申请人" :show-overflow-tooltip="true">
          </el-table-column>
          <el-table-column prop="capital" label="预充值金额（元）">
          </el-table-column>
          <el-table-column prop="capitalMoneyTime" label="创建时间" :show-overflow-tooltip="true">
          </el-table-column>
          <el-table-column prop="remark" label="备注" :show-overflow-tooltip="true">
          </el-table-column>
        </el-table>
        <div class="load-more-gif g-link" v-if="!detailloading" @click="loadmore">加载更多</div>
      </div>
    </el-dialog>
    <el-dialog title="退费查询" :visible.sync="returnDetailDialog" width="800px" :close-on-click-modal= "false">
      <div style="height: 300px;overflow: auto;">
        <el-table :data="returnDetail" style="width: 100%" stripe>
          <el-table-column type="index" width="50">
          </el-table-column>
          <el-table-column prop="code" label="案件编号" :show-overflow-tooltip="true">
          </el-table-column>
          <el-table-column prop="capitalName" label="申请人" :show-overflow-tooltip="true">
          </el-table-column>
          <el-table-column prop="capital" label="退费金额（元）">
          </el-table-column>
          <el-table-column prop="capitalMoneyTime" label="创建时间" :show-overflow-tooltip="true">
          </el-table-column>
        </el-table>
        <div class="load-more-gif g-link" v-if="!detailloading" @click="loadmore">加载更多</div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'
export default {
  data() {
    return {
      loading: false,
      total: 0,
      pageSize: 10,
      pageNo: 1,
      tableData: [],
      filter: {
        capitalName: ''
      },
      payDetailDialog: false,
      chargeDetailDialog: false,
      returnDetailDialog: false,
      payDetail: [],
      chargeDetail: [],
      returnDetail: [],
      detailPageSize: 10,
      detailPageNo: 1,
      capitalName: '',
      detailloading: false
    }
  },
  methods: {
    pageSizeChange(size) {
      this.pageSize = size
      this.getReconciliation()
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo
      this.getReconciliation()
    },
    getReconciliation() {
      this.loading = true
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }, this.filter)
      api.getReconciliation(params).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          let data = res.data.data.list
          data.forEach(item => {
            if(item.outCapital !== 0){
              item.outCapital = '-' + item.outCapital
            }
          })
          this.tableData = data
          this.total = res.data.data.total
        } else {
          this.tableData = []
          this.total = 0
        }
      })
    },
    searchFn() {
      this.pageNo = 1
      this.getReconciliation()
    },
    getPayDetail(detailType) {
      this.detailloading = true
      api.getPayment({
        detailName: this.capitalName,
        pageSize: this.detailPageSize,
        pageNo: this.detailPageNo,
        detailType: detailType
      }).then(res => {
        this.detailloading = false
        if (res.data.code === '1') {
          if(detailType === 2){
            let payDetail = res.data.data.list
            payDetail.forEach(item => {
              item.code = item.arbNumber || item.arbTemporaryNumber  
              item.capital = '-' + item.capital
            })
            this.payDetail = this.payDetail.concat(payDetail)
            // 判断是否还有更多数据
            if(this.payDetail.length === res.data.data.total){
              this.detailloading = true
            }
          }
          else{
            let returnDetail = res.data.data.list
            returnDetail.forEach(item => {
              item.code = item.arbNumber || item.arbTemporaryNumber  
              item.capital = '+' + item.capital
            })
            this.returnDetail = this.returnDetail.concat(returnDetail)
            // 判断是否还有更多数据
            if(this.returnDetail.length === res.data.data.total){
              this.detailloading = true
            }
          }
        }
        else{
          this.detailloading = true
          this.$message.error(res.data.msg)
        }
      })
    },
    getChargeDetail() {
      this.detailloading = true
      api.getPrefunRecord({
        detailName: this.capitalName,
        pageSize: this.detailPageSize,
        pageNo: this.detailPageNo
      }).then(res => {
        this.detailloading = false
        if (res.data.code === '1') {
          let chargeDetail = res.data.data.list
          this.chargeDetail = this.chargeDetail.concat(chargeDetail)
          // 判断是否还有更多数据
          if(this.chargeDetail.length === res.data.data.total){
            this.detailloading = true
          }
        }
        else{
          this.$message.error(res.data.msg)
          this.detailloading = true
        }
      })
    },
    loadmore() {
      this.detailPageNo++
      if(this.payDetailDialog){
        this.getPayDetail(2)
      }
      else if(this.chargeDetailDialog){
        this.getChargeDetail()
      }
      else{
        this.getPayDetail(3)
      }
    },
    queryDetail(key, row){
      this.capitalName = row.capitalName
      this.detailPageNo = 1
      if(key === 'pay'){
        this.payDetailDialog = true
        this.payDetail = []
        this.getPayDetail(2)
      }
      else if(key === 'charge'){
        this.chargeDetailDialog = true
        this.chargeDetail = []
        this.getChargeDetail()
      }
      else{
        this.returnDetailDialog = true
        this.returnDetail = []
        this.getPayDetail(3)
      }
    }
  },
  created() {
    this.getReconciliation()
  }
}

</script>
<style lang="scss" scoped>
.formula-form {
  width: 200px;
  margin-right: 20px;
}
.load-more-gif{
  text-align: center;
  line-height: 30px;
}
</style>
