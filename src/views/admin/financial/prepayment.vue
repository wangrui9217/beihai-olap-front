<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div class="bill-form">
      <span>案件编号</span>
      <el-input v-model.trim="filter.arbNumber" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <span>申请人</span>
      <el-input v-model.trim="filter.detailName" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <span>创建时间</span>
      <el-date-picker v-model="filter.startTime" type="date" value-format="yyyy-MM-dd" :picker-options="startOptions" @keyup.enter.native="searchFn">
      </el-date-picker>
      <b style="margin-left: -30px">-</b>
      <el-date-picker v-model="filter.endTime" type="date" value-format="yyyy-MM-dd" :picker-options="endOptions" @keyup.enter.native="searchFn">
      </el-date-picker>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <el-table :data="tableData" border class="g-table mt20">
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column label="案件编号" width="180">
        <template slot-scope="scope">
          <span class="g-link" @click="into(scope.row)">{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="capitalName" label="申请人">
      </el-table-column>
      <el-table-column prop="capital" label="仲裁费用（元）">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" >
      </el-table-column>
    </el-table>
    <el-pagination class="g-pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { api } from '@/api'
import util from '@/util/util'
export default {
  data(){
    let nowdate = new Date();
    nowdate.setMonth(nowdate.getMonth()-1);
    return {
      loading: false,
      dataRange: '',
      filter: {
        detailName: '',
        arbNumber: '',
        startTime: util.formatTime(nowdate, 'yyyy-MM-dd'),
        endTime: util.formatTime(new Date(), 'yyyy-MM-dd'),
      },
      startOptions: {
        disabledDate:(time) => {
          if(this.filter.endTime){
            return time.getTime() > new Date(this.filter.endTime).getTime()
          }
        }
      },
      endOptions: {
        disabledDate:(time) => {
          if(this.filter.startTime){
            return time.getTime() < new Date(this.filter.startTime).getTime()
          }
        }
      },
      tableData: [],
      
      pageNo: 1,
      pageSize: 10,
      total: 0

    }
  },
  methods: {
    pageSizeChange(val){
      this.pageSize = val
      this.getPayment()
    },
    pageNoChange(val){
      this.pageNo = val
      this.getPayment()
    },
    searchFn(){
      this.pageNo = 1
      this.getPayment()
    },
    getPayment(){
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        detailType: 2
      }, this.filter)
      api.getPayment(params).then(res => {
        if(res.data.code === '1'){
          this.tableData = res.data.data.list
          this.tableData.forEach(item => {
            item.code = item.arbNumber || item.arbTemporaryNumber
            item.capital = '-' + item.capital
          })
          this.total = res.data.data.total
        }
        else{
          this.tableData = []
          this.total = 0
        }
      })
    },
    into(row) {
      let routeData = this.$router.resolve({
        name: "仲裁请求详情",
        query: {
          data: row.arbitralInfoId
        }
      });
      window.open(routeData.href, '_blank');
    },
  },
  created() {
    this.getPayment()
  }
}
</script>
<style lang="scss" scoped>
  .bill-form{
    span{
      display: inline-block;
      width: 70px;
    }
    .el-input{
      width: 150px;
      margin-right: 30px;
    }
    
  }
</style>