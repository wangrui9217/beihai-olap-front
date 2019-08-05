<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <div class="product-search">
      <span>模板编号：</span>
      <el-input v-model.trim="filter.templateNumber" placeholder="模板编号" @keyup.enter.native="searchFn"></el-input>
      <span>模板名称：</span>
      <el-input v-model.trim="filter.templateName" placeholder="模板名称" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <div class="mt20">
      <el-button type="primary" icon="el-icon-plus" @click="openAddbox">新增</el-button>
      <button class="g-on-btn" @click="open" :disabled="!onActive">启用</button>
      <button class="g-off-btn" @click="close" :disabled="!offActive">停用</button>
    </div>
    <p style="position: relative;top:10px;font-size: 12px;text-align: right">*tips：已启用的无法修改，其中已经在被使用的，无法停用</p>
    <el-table :data="tableData" border class="g-table" @selection-change="selectionChange" row-key="id" ref="mytable">
      <el-table-column type="selection" width="50" :selectable="getSelectable" :reserve-selection="true">
      </el-table-column>
      <el-table-column prop="templateNumber" label="模板编号">
      </el-table-column>
      <el-table-column prop="templateName" label="模板名称">
      </el-table-column>
      <el-table-column prop="arbitralAdvanceConfigureNumber" label="引用合同计算公式">
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span :class="{'g-unactive':scope.row.status==='停用'}">{{scope.row.status}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <div class="actions">
            <button @click="edit(scope.row)" v-if="scope.row.status==='停用'">修改</button>
            <button @click="queryById(scope.row)" v-else>查看</button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <!--预览-->
    <preview :previewDialogVisible="previewDialogVisible" @CB-dialog="CB_dialog" :previewData="previewData"></preview>
  </div>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'
import preview from './preview'
export default {
  components: { preview },
  data() {
    return {
      loading: false,
      filter: {
        // templateNumber: '',
        // templateName: ''
      },
      total: 0,
      pageSize: 10,
      pageNo: 1,
      tableData: [],
      selected: [],
      previewDialogVisible: false,
      previewData: {}
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
      this.getArbitralAwardTemplate()
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo
      this.getArbitralAwardTemplate()
    },
    openAddbox() {
      this.$router.push({
        path: 'addArbitralAward'
      })
    },
    edit(row) {
      localStorage.setItem('arbitralAwardInfo',JSON.stringify(row))
      this.$router.push({
        path: 'updateArbitralAward',
        query: {
          data: row.id
        }
      })
    },
    getArbitralAwardTemplate() {
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }, this.filter)
      this.loading = true
      api.getArbitralAwardTemplate(params).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          let data = res.data.data.list
          data.forEach(v => {
            v.status = v.status == 1 ? '启用' : '停用'
            v.applyName = v.pRealname || v.coName
          })
          this.tableData = data
          this.total = res.data.data.total
        } else {
          this.tableData = []
          this.total = 0
        }
      })
    },
    queryById(row){
      this.previewData = {}
      this.previewDialogVisible = true
      api.queryArbitralAwardTemplateById({
        id: row.id
      }).then(res => {
        if(res.data.code === '1'){
          let data = res.data.data
          this.previewData = data
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
      
    },
    open(){
      let params = {
        id: this.selected.reduce((str, item) => {
          let s = str===''?item.id:(',' + item.id)
          return str + s;
        }, ''),
        status: 1
      }
      let msg = '确认启用已选的裁决书模板吗？'
      this.updateStatusBatch(params, msg)
    },
    close(){
      let params = {
        id: this.selected.reduce((str, item) => {
          let s = str===''?item.id:(',' + item.id)
          return str + s;
        }, ''),
        status: 2
      }
      let msg = '确认停用已选的裁决书模板吗？'
      this.updateStatusBatch(params, msg)
    },
    updateStatusBatch(params, msg) {
      this.$confirm(msg,'提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        api.updateStatusBatch(params).then(res => {
          this.loading = false
          if(res.data.code === '1'){
            this.$refs.mytable.clearSelection()
            this.getArbitralAwardTemplate();
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
      this.getArbitralAwardTemplate()
    },
    selectionChange(val){
      this.selected = val
    },
    getSelectable(row, index){
      return row.initStatus === 2
    },
    CB_dialog(){
      this.previewDialogVisible = false
    }
  },
  created() {
    this.getArbitralAwardTemplate()
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
