<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <div class="mt20" style="margin-top:20px">
      <el-button type="primary" icon="el-icon-plus" @click="openAddbox">新增</el-button>
      <button class="g-on-btn" @click="on" :disabled="!onActive">启用</button>
      <button class="g-off-btn" @click="off" :disabled="!offActive">停用</button>
    </div>
    <el-table :data="tableData" class="g-table" ref="table" border @selection-change="getSelection" row-key="id">
      <el-table-column type="selection" width="60" label="序号" :reserve-selection="true">
      </el-table-column>
      <el-table-column label="适用程序编号" prop="procedureNumber" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column label="适用程序名称" prop="procedureName" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column label="仲裁庭组成" prop="type" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span :class="{'g-unactive':scope.row.status===2}">{{scope.row.state}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <span v-if="scope.row.status===2" class="g-link" @click="openEditbox(scope.row)">修改</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" label-width="130px">
        <el-form-item label="适用程序名称：" style="width: 400px;">
          <el-input v-model.trim="form.procedureName" placeholder="请输入" :maxLength="50"></el-input>
        </el-form-item>
        <el-form-item label="仲裁庭组成：" >
          <el-radio-group v-model="form.arbArbitratorType">
            <el-radio :label="1" >独任仲裁庭</el-radio>
            <el-radio :label="2" >合议仲裁庭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
export default {
  data() {
    return {
      tableData: [], //表格数据
      pageNo: 1,
      pageSize: 10, //每页多少条
      total: 0,
      loading: false, //
      dialogVisible: false,
      selected: [],
      dialogTitle: '新增适用程序',
      form: {
        procedureName: '',
        arbArbitratorType: ''
      }
    }
  },
  computed: {
    onActive() {
      return this.selected.some(item => { return item.status === 2 })
    },
    offActive() {
      return this.selected.some(item => { return item.status === 1 })
    }
  },
  methods: {
    getSelection(rows) {
      this.selected = rows
    },
    openAddbox() {
      this.dialogTitle = '新增适用程序'
      this.dialogVisible = true
      this.form = {}
    },
    openEditbox(row) {
      this.form = Object.assign(this.form, {
        arbArbitratorType: row.arbArbitratorType,
        id: row.id,
        procedureName: row.procedureName,
        status: row.status
      })
      this.dialogVisible = true
      this.dialogTitle = '修改适用程序'
    },
    save() {
      if(!this.form.procedureName){
        this.$message.error('程序名称不可为空')
        return false
      }
      else if(!this.form.arbArbitratorType){
        this.$message.error('请选择仲裁庭组成')
        return false
      }
      this.loading = true
      api.addOrUpdateProcedure(this.form).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          this.$message.success(res.data.msg)
          this.dialogVisible = false
          this.getList()
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    on() {
      let params = {
        "ids": this.selected.map(item => {
          return item.id
        }),
        "status": 1
      }
      this.updateProcedureStatus(params)
    },
    off() {
      
      let params = {
        "ids": this.selected.map(item => {
          return item.id
        }),
        "status": 2
      }
      this.updateProcedureStatus(params)
    },
    updateProcedureStatus(params){
      this.loading = true
      api.updateProcedureStatus(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          this.$message.success(res.data.msg)
          this.$refs.table.clearSelection()
          this.getList()
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    pageSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    pageNoChange(val) {
      this.pageNo = val;
      this.getList();
    },
    getList() {
      let params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }
      this.loading = true
      api.queryProcedures(params).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          let tableData = res.data.list
          tableData.forEach(item => {
            item.state = item.status==2?'停用':'启用'
            item.type=item.arbArbitratorType==1?'独任':'合议'
          })
          this.tableData = tableData
          this.total = res.data.total
        } else {
          this.tableData = []
          this.total = 0
        }
      })
    }
  },
  created() {
    this.getList()
  }
}

</script>
<style lang="scss" scoped>
</style>
