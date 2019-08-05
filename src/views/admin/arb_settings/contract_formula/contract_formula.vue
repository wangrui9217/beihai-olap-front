<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <div>
      <span>公式编号：</span>
      <el-input class="formula-form" v-model.trim="filter.contractNumber" placeholder="公式编号" @keyup.enter.native="searchFn"></el-input>
      <span>公式名称：</span>
      <el-input class="formula-form" v-model.trim="filter.contractName" placeholder="公式名称" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <div class="mt20">
      <!-- <el-button type="primary" @click="openAddbox">新增</el-button> -->
    </div>
    <el-table :data="tableData" border class="g-table">
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column prop="contractNumber" label="公式编号">
      </el-table-column>
      <el-table-column prop="contractName" label="公式名称">
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <div class="actions">
            <button @click="read(scope.row)" >查看</button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog title="查看计算公式" :visible.sync="readVisible">
      <div class="read">
        <p><span>公式编号：</span><b>{{arbFormulaInfo.contractNumber}}</b></p>
        <p><span>公式名称：</span><b>{{arbFormulaInfo.contractName}}</b></p>
        <p><span>本息计算公式：</span><b>{{arbFormulaInfo.contractPrincipalFormula}}</b></p>
        <p><span>利息计算公式：</span><b>{{arbFormulaInfo.contractAccrualFormula}}</b></p>
        <p><span>罚息计算公式：</span><b>{{arbFormulaInfo.contractPenaltyFormula}}</b></p>
        <p><span>创建时间：</span><b>{{arbFormulaInfo.createTime}}</b></p>
        <p><span>状态：</span><b>{{arbFormulaInfo.status}}</b></p>
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
      date: '',
      total: 0,
      pageSize: 10,
      pageNo: 1,
      tableData: [],
      centerDialogVisible: false,
      title: '新增',
      arbFormulaInfo: {},
      form: {
        beginFormula: '',
        endFormula: '',
        numberYear: ''
      },
      filter: {
        contractNumber: '',
        contractName: ''
      },
      readVisible: false,
      pickerOptions:  {
        disabledDate(time) {
          return time.getTime() < Date.now();
        }
      }
    }
  },
  methods: {
    pageSizeChange(size) {
      this.pageSize = size
      this.getAdvanceConfigureDataTable()
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo
      this.getAdvanceConfigureDataTable()
    },
    // submit(){
    //   if(this.form.numberYear === ''){
    //     this.$message.error('年份不能是空')
    //     return false
    //   }
    //   else if(this.form.beginFormula === ''){
    //     this.$message.error('开始编号不能是空')
    //     return false
    //   }
    //   else if(this.form.endFormula === ''){
    //     this.$message.error('结束编号不能是空')
    //     return false
    //   }
    //   else if(this.form.beginFormula > this.form.endFormula){
    //     this.$message.error('开始编号不能大于技术编号')
    //     return false
    //   }
    //   else{
    //     this.loading = true
    //     let params = Object.assign({},this.form)
    //     params.beginFormula = util.prefixInteger(params.beginFormula, 3)
    //     params.endFormula = util.prefixInteger(params.endFormula, 3)
    //     api.saveArbitralFormula(params).then(res => {
    //       this.loading = false
    //       this.centerDialogVisible = false
    //       if(res.data.code === '1'){
    //         this.$message.success(res.data.msg)
    //         this.form.beginFormula = this.form.endFormula = ''
    //       }
    //       else{
    //         this.$message.error(res.data.msg)
    //       }
    //     })
    //   }
    // },
    // openAddbox(){
    //   this.title = '新增'
    //   this.centerDialogVisible = true
    // },
    // openEditbox(row){
    //   this.arbFormulaInfo = row
    //   this.title = '修改'
    //   this.form.beginFormula = this.arbFormulaInfo.beginFormula
    //   this.form.endFormula = this.arbFormulaInfo.endFormula
    //   this.form.numberYear = this.arbFormulaInfo.numberYear
    //   this.centerDialogVisible = true
    // },
    read(row){
      this.arbFormulaInfo = row
      this.readVisible = true
    },
    getAdvanceConfigureDataTable(){
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }, this.filter)
      this.loading = true
      api.getAdvanceConfigureDataTable(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let data = res.data.list
          data.forEach(v => {
            v.status = v.status==1?'启用':'停用'
          })
          this.tableData = data
          this.total = res.data.total
        }
        else{
          this.tableData = []
          this.total = 0
        }
      })
    },
    searchFn(){
      this.pageNo = 1
      this.getAdvanceConfigureDataTable()
    }
  },
  created() {
    this.getAdvanceConfigureDataTable()
  },
  mounted() {

  }
}

</script>
<style lang="scss" scoped>
.formula-form{
  width: 200px;
  margin-right: 20px;
}
.actions {
  color: #0000FF;
  button{
    color: #0000FF;
    border: none;
    background: none;
    cursor: pointer;
    outline: none;
  }
}
.read{
  p{
    display: flex;
    width: 100%;
    color: #666;
    margin-bottom: 10px;
    span{
      width: 120px;
      color: #000;
    }
    b{
      font-weight: normal;
      flex: 1;
    }
  }
}
</style>
