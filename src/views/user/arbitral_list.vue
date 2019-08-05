<template>
    <div class="arbitral-list" v-loading.fullscreen="loading">
    	<h2 class="g-title">仲裁请求查询</h2>
      <listFilter :filterData="filterData" :searchFn="search"></listFilter>
      <div>
        <div class="add-btn"><router-link to="/user/apply"><el-button type="primary" icon="el-icon-plus">新增</el-button></router-link></div>
        <ul class="g-arb_tabs mt20">
          <li v-for="item in arbTypes" :key="item.value" :class="{'active': item.isActive}" @click="tabFilter(item.value)">
            <span>{{item.label}}</span>
            <el-popover
              v-if="item.content"
              placement="bottom"
              title=""
              width="200"
              trigger="hover"
              :content="item.content">
              <i class="el-icon-warning" slot="reference"></i>
            </el-popover>
          </li>
        </ul>
      </div>
      <el-table :data="tableData" border style="width: 100%" header-cell-class-name="g-thead-class">
        <el-table-column type="index" width="50" label="序号">
        </el-table-column>
        <el-table-column prop="code" label="案件编号" :show-overflow-tooltip="true" width="230">
          <template slot-scope="scope">
            <span class="g-link" @click="into(scope.row)">{{scope.row.code}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="arbName" :show-overflow-tooltip="true" label="案由">
        </el-table-column>
        <el-table-column prop="arbDefendantName" :show-overflow-tooltip="true" label="被申请人">
        </el-table-column>
        <el-table-column prop="arbDisputeMoney" :show-overflow-tooltip="true" label="标的额(元)">
        </el-table-column>
        <el-table-column prop="createTime" :show-overflow-tooltip="true" label="申请日期">
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" label="案件状态">
          <template slot-scope="scope">
            {{scope.row.status}}
            <span  v-if="scope.row.decisionStatus&&scope.row.decisionStatus >= 1&&scope.row.decisionStatus < 60">(管辖权异议)</span>
            <span class="css-recall" v-if="scope.row.recallStatus === '1'">撤</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" label="操作">
          <template slot-scope="scope">
            <span class="g-link" @click="edit(scope.row)" v-if="scope.row.arbStatus == 1||scope.row.arbStatus == 2">编辑</span>
            <span class="g-link" @click="dissentReply(scope.row)" v-if="scope.row.decisionStatus== 2" style="color:#E11E22">答辩</span>
            <!-- <span v-if="!scope.row.decisionStatus||scope.row.decisionStatus!= 2" style="color:#999;">答辩</span> -->
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="g-pages" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    
</template>

<script>
  import listFilter from '@user/listFilter'
  import { api } from '@/api'
  import DICT from '@/const/dict'
  import util from '@/util/util'
export default {
  components: {listFilter},
  data(){
  	return {
      loading: false,
  		filterData: {
        // arbDefendantName: '',
        // arbName: '',
        // arbNumber: '',
        // arbStatus: '',
        // startTime: '',
        // endTime: ''
        status: ''
      },
      tableData: [],
      pageNo: 1,
      pageSize: 10,
      types: [],
      total: 0,
      arbTypes: DICT.arbTypes.map((v,i) => {
        let bool = i===0?true:false
        return {
          isActive: bool,
          value: v.arbStatus,
          label: v.label,
          content: v.content
        }
      }),
  	}
  },
  methods: {
    search() {  
      this.pageNo = 1
      this.getArbitralInfos();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getArbitralInfos();
    },
    handleCurrentChange(val) {
      this.pageNo = val;
      this.getArbitralInfos();
    },
    getArbitralInfos(){

      var arbStatusList = this.filterData.status?this.filterData.status.split(','): []
      if(arbStatusList.length > 0){
        this.filterData.arbStatusBegin = Number(arbStatusList[0])
        this.filterData.arbStatusEnd = Number(arbStatusList[arbStatusList.length-1])
      }
      else{
        delete this.filterData.arbStatusBegin
        delete this.filterData.arbStatusEnd
      }
      let params = Object.assign({}, this.filterData, {
        pageNo: this.pageNo,
        pageSize: this.pageSize
      })
      delete params.status
      this.loading = true
      api.getArbitralInfos(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let tableData = res.data.list
          tableData.forEach( v => {
            v.code = v.arbNumber || v.arbTemporaryNumber
            v.status =  util.getStatus(v.arbStatus)
            
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
    tabFilter(val){
      this.arbTypes.forEach((item, i) => {
        if(item.value === val){
          item.isActive = true
        }
        else if(item.isActive === true){
          item.isActive = false
        }
      })
      this.filterData.status = val
      this.search()
    },
    into(row){
      this.$router.push({
        path: 'arbitralInfo',
        query: {
          data: row.id
        }
      })
    },
    edit(row){
      this.$router.push({
        path: 'editArbitral',
        query: {
          data: row.id
        }
      })
    },
    dissentReply(row){
      console.log(row);
      
      this.$router.push({
        path: 'dissentReply',
        query: {
          data: row
        }
      })
    },
  },
  created() {
  	this.getArbitralInfos()
  }
}
</script>
<style lang="scss" scoped>
.arbitral-list{
  padding: 30px;
}
.add-btn{
  .el-button{
    padding: 10px 20px;
  }
}
.css-recall{
  cursor: auto;
  margin-left: 5px;
  background: #E6A23C;
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  text-align: center;
  color: #fff;
}
</style>