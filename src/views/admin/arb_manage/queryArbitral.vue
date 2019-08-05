<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <list-filter :filter-data="formInline" :searchFn="search"></list-filter>
    <ul class="g-arb_tabs">
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
      <el-table-column prop="arbDefendantName" :show-overflow-tooltip="true" label="被申请人">
      </el-table-column>
      <el-table-column prop="arbProductName" :show-overflow-tooltip="true" label="产品类型">
      </el-table-column>
      <el-table-column prop="arbDisputeMoney" :show-overflow-tooltip="true" label="标的额(元)">
      </el-table-column>
      <el-table-column prop="createTime" :show-overflow-tooltip="true" label="申请时间">
      </el-table-column>
      <el-table-column prop="status" :show-overflow-tooltip="true" label="案件状态">
      </el-table-column>
    </el-table>
    <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
  import DICT from '@/const/dict'
import util from '@/util/util'
export default {
  components: { listFilter },
  data() {
    return {
      formInline: {
        // arbProductId: '',
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
      arbTypes: DICT.arbTypes.map((v,i) => {
        let bool = i===0?true:false
        return {
          isActive: bool,
          value: v.arbStatus,
          label: v.label,
          content: v.content
        }
      }),
      arbStatus: ''
    }
  },
  methods: {
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
      api.getAllArbitralInfos(params).then(res => {
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

</style>
