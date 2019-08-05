<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div class="product-search">
      <span>计算规则编号：</span>
      <el-input v-model.trim="filter.regularNumber" placeholder="计算规则编号" @keyup.enter.native="searchFn"></el-input>
      <span>计算规则名称：</span>
      <el-input v-model.trim="filter.regularName" placeholder="计算规则名称" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <div class="mt20">
      <el-button type="primary" icon="el-icon-plus" @click="openAddbox">新增</el-button>
      <button class="g-on-btn" @click="open" :disabled="!onActive">启用</button>
      <button class="g-off-btn" @click="close" :disabled="!offActive">停用</button>
    </div>
    <p style="position: relative;top:10px;font-size: 12px;text-align: right">*tips：已启用的无法修改，其中已经在被使用的，无法停用</p>
    <el-table :data="tableData" border class="g-table" @selection-change="selectionChange" row-key="id" ref="mytable">
      <el-table-column type="selection" width="50" :reserve-selection="true" :selectable="getSelectable">
      </el-table-column>
      <el-table-column prop="regularNumber" label="计算规则编号">
      </el-table-column>
      <el-table-column prop="regularName" label="计算规则名称">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span :class="{'g-unactive':scope.row.status==='停用'}">{{scope.row.status}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <div class="actions">
            <button @click="openEditbox(scope.row)" v-if="scope.row.status=='停用'">修改</button>
            <button @click="toDetail(scope.row)" v-else>查看</button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'
export default {
  data() {
    return {
      loading: false,
      filter: {
        regularNumber: '',
        regularName: ''
      },
      total: 0,
      pageSize: 10,
      pageNo: 1,
      tableData: [],
      selected: []
    }
  },
  computed:{
    onActive (){
      return this.selected.some(item => {return item.status === '停用'})
    },
    offActive(){
      return this.selected.some(item => {return item.status === '启用'})
    }
  },
  methods: {
    pageSizeChange(size) {
      this.pageSize = size
      this.getCalcRuleList()
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo
      this.getCalcRuleList()
    },
    openAddbox() {
      this.$router.push({
        path: 'addRule'
      })
    },
    openEditbox(row) {
      localStorage.setItem('ruleInfo',JSON.stringify(row))
      this.$router.push({
        path: 'updateRule',
        query: {
          data: row.id
        }
      })
    },
    toDetail(row){
      localStorage.setItem('ruleInfo',JSON.stringify(row))
      this.$router.push({
        path: 'readRule',
        query: {
          data: row.id
        }
      })
    },
    getCalcRuleList() {
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }, this.filter)
      this.loading = true
      api.getCalcRuleList(params).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          let data = res.data.list
          data.forEach(v => {
            v.status = v.status == 1 ? '启用' : '停用'
            v.applyName = v.pRealname || v.coName
          })
          this.tableData = data
          this.total = res.data.total
        } else {
          this.tableData = []
          this.total = 0
        }
      })
    },
    open(){
      let params = []
      params = this.selected.map(item => {
        return {
          id: item.id,
          status: 1
        }
      })
      let regularName = this.selected.map(item => {
        return item.regularName
      })
      regularName = regularName.join('、')
      let msg = `确认启用费用计算规则【${regularName}】？`
      this.updateCalcRuleStatus(params, msg)
    },
    close(){
      let params = []
      params = this.selected.map(item => {
        return {
          id: item.id,
          status: 2
        }
      })
      let regularName = this.selected.map(item => {
        return item.regularName
      })
      regularName = regularName.join('、')
      let msg = `确认停用费用计算规则【${regularName}】？`
      this.updateCalcRuleStatus(params, msg)
    },
    updateCalcRuleStatus(params, msg) {
      this.$confirm(msg,'提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        api.updateCalcRuleStatus({configStatusList: params}).then(res => {
          this.loading = false
          if(res.data.code === '1'){
            this.$refs.mytable.clearSelection()
            this.getCalcRuleList();
            this.$message.success(res.data.msg)
          }
          else{
            this.$message.error(res.data.msg)
          }
        })
      }).catch(() => {
                  
      });
    },
    searchFn() {
      this.pageNo = 1
      this.getCalcRuleList()
    },
    selectionChange(val){
      this.selected = val
    },
    getSelectable(row, index){
      return row.arbStatus === 1
    }
  },
  created() {
    this.getCalcRuleList()
    localStorage.removeItem('ruleInfo')
  }
}

</script>
<style lang="scss" scoped>
.product-search {
  font-size: 14px;
  .el-input {
    width: 200px;
  }
  span {
    margin: 0 5px 0 15px;
  }
}

.actions {
  color: #0000FF;
  button {
    color: #0000FF;
    border: none;
    background: none;
    cursor: pointer;
    outline: none;
    &[disabled] {
      cursor: no-drop;
      color: #999;
    }
  }
}
.product-form {
  .el-input,.el-select{
    width: 280px;  
  }
}
</style>
