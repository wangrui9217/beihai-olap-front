<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div>
      <span>创建时间：</span>
      <el-date-picker v-model="filter.startTime" type="date" value-format="yyyy-MM-dd" :picker-options="startOptions" style="width: 200px">
      </el-date-picker>
      <span>至</span>
      <el-date-picker v-model="filter.endTime" type="date" value-format="yyyy-MM-dd" :picker-options="endOptions" style="width: 200px">
      </el-date-picker>
      <el-button type="primary" icon="el-icon-search" @click="searchFn()">搜索</el-button>
    </div>
    <div class="mt20">
      <el-button type="primary" icon="el-icon-plus" @click="openAddbox()">新增</el-button>
      <button class="g-on-btn" @click="open" :disabled="!onActive">启用</button>
      <button class="g-off-btn" @click="close" :disabled="!offActive">停用</button>
    </div>
    <p style="position: relative;top:10px;font-size: 12px;text-align: right">*tips：已启用的无法修改，其中已经在被使用的，无法停用</p>
    <el-table :data="tableData" border class="g-table" @selection-change="selectionChange" row-key="id" ref="mytable">
      <el-table-column type="selection" label="序号" width="50" :selectable="getSelectable" :reserve-selection="true">
      </el-table-column>
      <el-table-column prop="numberYear" label="年份">
      </el-table-column>
      <el-table-column label="可用号段">
        <template slot-scope="scope">
          <span>{{scope.row.beginNumber + '-' + scope.row.endNumber}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalUseNum" label="已使用个数" width="100">
      </el-table-column>
      <el-table-column prop="totalUnused" label="未使用个数" width="100">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template slot-scope="scope">
          <span :class="{'g-unactive':scope.row.status==='停用'}">{{scope.row.status}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <div class="actions">
            <button @click="openEditbox(scope.row)" v-if="scope.row.status==='停用'">修改</button>
            <!-- <button v-else>查看</button> -->
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog :title="title" :visible.sync="centerDialogVisible" width="600" :close-on-click-modal="false">
      <el-form :model="form" ref="form">
         <el-form-item label="年份" label-width="80px">
          <el-date-picker
            v-model="form.numberYear"
            type="year"
            value-format="yyyy"
            :picker-options="pickerOptions"
            placeholder="选择年">
          </el-date-picker>
         </el-form-item>
         <div>
           <div style="display: inline-block;width: 180px;">
             <el-form-item label="号段" label-width="80px" prop="beginNumber" :rules="beginNumberRule">
              <el-input class="number-input" v-model.trim="form.beginNumber" placeholder="开始编号" @input="check1"></el-input>
            </el-form-item>
           </div>
           <span>-</span>
           <div style="display: inline-block;width: 100px;">
             <el-form-item label="" label-width="0" prop="endNumber" :rules="endNumberRule">
              <el-input class="number-input" v-model.trim="form.endNumber" placeholder="结束编号" @input="check2"></el-input>
            </el-form-item>
           </div>
         </div>
      </el-form>
      <div slot="footer" class="g-text-center">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { api } from '@/api'
  import util from '@/util/util'
export default {
  data() {
    let numberValidate = (rule, value, callback) => {
      callback()
    }
    return {
      loading: false,
      filter: {
        startTime: '',
        endTime: ''
      },
      startOptions: {
        disabledDate:(time) => {
          return time.getTime() > new Date(this.filter.endTime).getTime()
        }
      },
      endOptions: {
        disabledDate:(time) => {
          return time.getTime() < new Date(this.filter.startTime).getTime()
        }
      },
      beginNumberRule: { validator: numberValidate, trigger: 'blur' },
      endNumberRule: { validator: numberValidate, trigger: 'blur' },
      total: 0,
      pageSize: 10,
      pageNo: 1,
      tableData: [],
      centerDialogVisible: false,
      title: '新增',
      arbNumberInfo: null,
      form: {
        beginNumber: '',
        endNumber: '',
        numberYear: ''
      },
      selected: [],
      pickerOptions:  {
        disabledDate(time) {
          return time.getTime() < Date.now();
        }
      },
      timeTask: null
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
    selectionChange(val){
      this.selected = val
    },
    pageSizeChange(size) {
      this.pageSize = size
      this.getArbitralNumber()
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo
      this.getArbitralNumber()
    },
    submit(){
      if(this.form.numberYear === ''){
        this.$message.error('年份不能是空')
        return false
      }
      if(this.form.beginNumber === ''){
        this.$message.error('开始编号不能是空')
        return false
      }
      else if(this.form.endNumber === ''){
        this.$message.error('结束编号不能是空')
        return false
      }
      else if(this.form.beginNumber - this.form.endNumber > 0){
        this.$message.error('开始编号不能大于结束编号')
        return false
      }
      else{
        this.$refs.form.validate((valid) => {
          if(valid){
            this.loading = true
            let params = Object.assign({},this.form)
            // params.beginNumber = util.prefixInteger(params.beginNumber, 3)
            // params.endNumber = util.prefixInteger(params.endNumber, 3)
            if(this.title === '新增'){
              api.saveArbitralNumber(params).then(res => {
                this.loading = false
                this.centerDialogVisible = false
                if(res.data.code === '1'){
                  this.$message.success(res.data.msg)
                  this.getArbitralNumber();
                }
                else{
                  this.$message.error(res.data.msg)
                }
              })
            }
            else if(this.title === '修改'){
              params.id = this.arbNumberInfo.id
              api.updateArbitralNumber(params).then(res => {
                this.loading = false
                this.centerDialogVisible = false
                if(res.data.code === '1'){
                  this.$message.success(res.data.msg)
                  this.getArbitralNumber();
                }
                else{
                  this.$message.error(res.data.msg)
                }
              })
            }
          }
        })
      }
    },
    openAddbox(){
      this.title = '新增'
      this.form.beginNumber = this.form.endNumber = this.form.numberYear = ''
      this.centerDialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate('beginNumber')
      })
    },
    openEditbox(row){
      this.arbNumberInfo = row
      this.title = '修改'
      this.form.beginNumber = this.arbNumberInfo.beginNumber
      this.form.endNumber = this.arbNumberInfo.endNumber
      this.form.numberYear = this.arbNumberInfo.numberYear
      this.centerDialogVisible = true
    },
    getArbitralNumber(){
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }, this.filter)
      api.getArbitralNumber(params).then(res => {
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
    open(){
      let params = []
      let selected = this.selected.filter(item => {
        return item.status!=='启用'
      })
      if(selected.length == 0){
        this.$message.error('您选择的号段是已启用的，不需要再次启用')
        return false
      }
      params = selected.map(item => {
        return {
          id: item.id,
          status: 1,
          numberYear: item.numberYear
        }
      })

      let msg = '确认启用已选的号段吗？'
      this.updateNumberStatus(params, msg)
    },
    close(){
      let params = []
      let selected = this.selected.filter(item => {
        return item.status!=='停用'
      })
      if(selected.length == 0){
        this.$message.error('您选择的号段是已停用的，不需要再次停用')
        return false
      }
      params = selected.map(item => {
        return {
          id: item.id,
          status: 2,
          numberYear: item.numberYear
        }
      })
      let msg = '确认停用已选的可用号段吗？'
      this.updateNumberStatus(params, msg)
    },
    updateNumberStatus(params, msg){
      
      this.$confirm(msg,'提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        api.updateNumberStatus({configStatusList: params}).then(res => {
          this.loading = false
          if(res.data.code === '1'){
            this.$refs.mytable.clearSelection()
            this.getArbitralNumber();
            this.$message.success(res.data.msg)
          }
          else{
            this.$message.error(res.data.msg)
          }
        })
      }).catch(() => {
                  
      });
    },
    searchFn(){
      this.pageNo = 1
      this.getArbitralNumber()
    },
    getSelectable(row, index){
      return row.arbStatus === 1
    },
    checkNumber(a){
      let data = {
        beginNumber: '',
        endNumber: '',
        "numberYear": this.form.numberYear
      }
      if(a === 1){
        data.beginNumber = this.form.beginNumber
      }
      else data.endNumber = this.form.endNumber
      api.checkArbitralNumber(data).then(res => {
        if(res.data.code === '1'){
          if(a === 1){
            this.beginNumberRule.validator = this.hasNoError
            this.$refs.form.validateField('beginNumber')
          }
          else {
            this.endNumberRule.validator = this.hasNoError
            this.$refs.form.validateField('endNumber')
          }
        }
        else{
          if(a === 1){
            this.beginNumberRule.validator = this.hasError
            this.$refs.form.validateField('beginNumber')
          }
          else {
            this.endNumberRule.validator = this.hasError
            this.$refs.form.validateField('endNumber')
          }
        }
        
      })
    },
    check1(v){
      if(this.form.numberYear&&v!==''){
        this.setTimeTask(1)
      }
      else{
        this.beginNumberRule.validator = this.hasNoError
        this.$refs.form.validateField('beginNumber')
      }
    },
    check2(v){
      if(this.form.numberYear&&v!==''){
        this.setTimeTask(2)
      }
      else{
        this.endNumberRule.validator = this.hasNoError
        this.$refs.form.validateField('endNumber')
      }
    },
    setTimeTask(a){
      clearTimeout(this.timeTask)
      this.timeTask = setTimeout(() => {
        this.checkNumber(a)
      }, 500)
    },

    hasError(rule, value, callback) {
      callback(new Error('此号段已存在'))
    },
    hasNoError(rule, value, callback) {
      callback()
    }
  },
  created() {
    this.getArbitralNumber()
  },
  mounted() {

  }
}

</script>
<style lang="scss" scoped>
  .number-input{
    width: 100px;
  }
  .actions {
    color: #0000FF;
    button{
      color: #0000FF;
      border: none;
      background: none;
      cursor: pointer;
      outline: none;
      &[disabled]{
        cursor: no-drop;
        color: #999;
      }
    }
  }
  .error{
    color: #f00;
    font-size: 12px;
    padding-left: 80px;
    margin-top: -15px;
  }
</style>
