<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div class="product-search">
      <span>申请人：</span>
      <el-input v-model.trim="filter.pRealname" placeholder="申请人名称" @keyup.enter.native="searchFn"></el-input>
      <!-- <el-select v-model="filter.pRealname" clearable placeholder="请选择">
        <el-option v-for="item in applyers" :key="item.value" :label="item.label" :value="item.label">
        </el-option>
      </el-select> -->
      <span>产品编号：</span>
      <el-input v-model.trim="filter.productNumber" placeholder="产品编号" @keyup.enter.native="searchFn"></el-input>
      <span>产品类型名称：</span>
      <el-input v-model.trim="filter.productName" placeholder="产品类型名称" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <div class="mt20">
      <el-button type="primary" icon="el-icon-plus" @click="openAddbox">新增</el-button>
      <button class="g-on-btn" @click="open" :disabled="!onActive">启用</button>
      <button class="g-off-btn" @click="close" :disabled="!offActive">停用</button>
    </div>
    <p style="position: relative;top:10px;font-size: 12px;text-align: right">*tips：已启用的无法修改，其中已经在被使用的，无法停用</p>
    <el-table :data="tableData" border class="g-table" @selection-change="selectionChange" row-key="id" ref="mytable">
      <el-table-column type="selection" label="序号" width="50" :selectable="getSelectable" :reserve-selection="true">
      </el-table-column>
      <el-table-column label="申请人" prop="applyName">
      </el-table-column>
      <el-table-column prop="productNumber" label="产品编号">
      </el-table-column>
      <el-table-column prop="productName" label="产品类型名称">
      </el-table-column>
      <el-table-column prop="contractName" label="签订合同名称">
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
            <button @click="read(scope.row)" v-else>查看</button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog :title="title" :visible.sync="centerDialogVisible" width="550px" :close-on-click-modal="false">
      <el-form :model="form" class="product-form" label-width="130px" ref="form" label-position="left" :rules="rules">
        <div v-if="title === '新增'">
          <el-form-item label="申请人" prop="userAccountId">
            <el-select v-model="form.userAccountId" clearable placeholder="请选择" @change="getProductNumberById">
              <el-option v-for="item in applyers" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品编号">
            <span>{{form.productNumber}}</span>
          </el-form-item>
        </div>
        <div v-else>
          <el-form-item label="申请人">
            <span>{{productInfo.applyName}}</span>
          </el-form-item>
          <el-form-item label="产品编号">
            <span>{{productInfo.productNumber}}</span>
          </el-form-item>
        </div>
        <el-form-item label="产品类型名称" prop="productName">
          <el-input v-model.trim="form.productName" placeholder="产品类型名称"></el-input>
        </el-form-item>
        <el-form-item label=" 签订合同名称" prop="contractName">
          <el-input v-model.trim="form.contractName" placeholder="签订合同名称"></el-input>
        </el-form-item>
        <el-form-item label="贷款利率" prop="rate">
          <el-input v-model.trim="form.rate" placeholder="贷款利率" >
            <el-select v-model="form.rateType" slot="prepend" style="width: 66px">
              <el-option label="年" :value="1"></el-option>
              <el-option label="月" :value="2"></el-option>
              <el-option label="日" :value="3"></el-option>
            </el-select>
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label=" 逾期利率" prop="advanceRate">
          <el-input v-model.trim="form.advanceRate" placeholder="逾期利率">
            <el-select v-model="form.advanceRateType" slot="prepend" style="width: 66px">
              <el-option label="年" :value="1"></el-option>
              <el-option label="月" :value="2"></el-option>
              <el-option label="日" :value="3"></el-option>
            </el-select>
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="g-text-center">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="查看产品类型" :visible.sync="readVisible" width="500px">
      <div class="read">
        <p><span>申请人：</span>{{productInfo.applyName}}</p>
        <p><span>产品类型编号：</span>{{productInfo.productNumber}}</p>
        <p><span>产品类型名称：</span>{{productInfo.productName}}</p>
        <p><span>签订合同名称：</span>{{productInfo.contractName}}</p>
        <p><span>贷款{{productInfo.rateTypeText}}利率：</span>{{productInfo.rate + '%'}}</p>
        <p><span>逾期{{productInfo.advanceRateTypeText}}利率：</span>{{productInfo.advanceRate + '%'}}</p>
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
      filter: {
        productNumber: '',
        productName: '',
        pRealname: ''
      },
      total: 0,
      pageSize: 10,
      pageNo: 1,
      tableData: [],
      centerDialogVisible: false,
      title: '新增',
      productInfo: {},
      form: {
        advanceRate: '',
        contractName: "",
        productName: "",
        productNumber: "",
        rate: '',
        rateType: 1,
        advanceRateType: 1,
        userAccountId: ""
      },
      applyers: [],
      rules: {
        userAccountId: { required: true, trigger: 'change', message: '请选择申请人' },
        productName: { required: true, trigger: 'blur', message: '请输入产品类型名称' },
        contractName: { required: true, trigger: 'blur', message: '请输入签订合同名称' },
        rate: [
          { required: true, trigger: 'blur', message: '请输入贷款利率' },
          {pattern: /^[1-9]\d?(\.\d{1,2})?$|^0\.\d{1,2}$/, message: '利率为0~100之间的数字，可以输入2位小数，请重新输入',trigger: 'blur'}
        ],
        advanceRate: [
          { required: true, trigger: 'blur', message: '请输入逾期利率' },
          {pattern: /^[1-9]\d?(\.\d{1,2})?$|^0\.\d{1,2}$/, message: '利率为0~100之间的数字，可以输入2位小数，请重新输入',trigger: 'blur'}
        ]
      },
      selected: [],
      readVisible: false
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
      this.getArbitralProductList()
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo
      this.getArbitralProductList()
    },
    submit() {
      this.$refs['form'].validate((valid) =>{
        if(valid){
          this.loading = true
          let params = Object.assign({}, this.form)
          if (this.title === '新增') {
            api.saveArbitralProduct(params).then(res => {
              this.loading = false
              if (res.data.code === '1') {
                this.$message.success(res.data.msg)
                this.getArbitralProductList();
              } else {
                this.$message.error(res.data.msg)
              }
              this.centerDialogVisible = false
            })
          } else if (this.title === '修改') {
            params.id = this.productInfo.id
            api.updateArbitralProduct(params).then(res => {
              this.loading = false
              if (res.data.code === '1') {
                this.$message.success(res.data.msg)
                this.getArbitralProductList();
              } else {
                this.$message.error(res.data.msg)
              }
              this.centerDialogVisible = false
            })
          }
        }
      })
    },
    openAddbox() {
      if(this.applyers.length === 0){
        this.queryUserCoInfo()
      }
      this.title = '新增'
      this.centerDialogVisible = true
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
      })
    },
    openEditbox(row) {
      this.productInfo = row
      this.title = '修改'
      this.form.contractName = this.productInfo.contractName
      this.form.productName = this.productInfo.productName
      this.form.advanceRate = this.productInfo.advanceRate
      this.form.rate = this.productInfo.rate
      this.form.rateType = this.productInfo.rateType
      this.form.advanceRateType = this.productInfo.advanceRateType
      
      this.centerDialogVisible = true
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    read(row){
      this.productInfo = row
      this.productInfo.rateTypeText = this.productInfo.rateType==1?'年':this.productInfo.rateType==2?'月':'日'
      this.productInfo.advanceRateTypeText = this.productInfo.advanceRateType==1?'年':this.productInfo.advanceRateType==2?'月':'日'
      this.readVisible = true
    },
    getArbitralProductList() {
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }, this.filter)
      this.loading = true
      api.getArbitralProductList(params).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          let data = res.data.data
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
    queryUserCoInfo() {
      api.queryUserCoInfo({}).then(res => {
        if (res.data.code === '1') {
          let applyers = res.data.data.list
          applyers.forEach(v => {
            v.value = v.userAccountId
            v.label = v.coName || v.pRealname
          })
          this.applyers = applyers
        } else {
          this.applyers = []
        }
      })
    },
    getProductNumberById(val){
      if(val){
        api.getProductNumberById({
          id: val
        }).then(res => {
          if(res.data.code === '1'){
            this.form.productNumber = res.data.data.productNumber
          }
          else{
            this.form.productNumber = ''
            this.$message.error(res.data.msg)
          }
        })
      }
      else{
        this.form.productNumber = ''
      }
    },
    open(){
      let params = []
      params = this.selected.map(item => {
        return {
          id: item.id,
          status: 1
        }
      })
      let msg = '确认启用已选的产品吗？'
      this.updateArbitralProductStatus(params, msg)
    },
    close(){
      let params = []
      params = this.selected.map(item => {
        return {
          id: item.id,
          status: 2
        }
      })
      let msg = '确认停用已选的产品吗？'
      this.updateArbitralProductStatus(params, msg)
    },
    updateArbitralProductStatus(params, msg) {
      this.$confirm(msg,'提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        api.updateArbitralProductStatus({configStatusList: params}).then(res => {
          this.loading = false
          if(res.data.code === '1'){
            this.$refs.mytable.clearSelection()
            this.getArbitralProductList();
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
      this.getArbitralProductList()
    },
    getSelectable(row, index){
      return row.arbStatus === 1
    }
  },
  created() {
    this.getArbitralProductList()
    // this.queryUserCoInfo()
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
  button {
    color: #0000FF;
    border: none;
    background: none;
    cursor: pointer;
    outline: none;
  }
}
.product-form {
  .el-input,.el-select{
    width: 280px;  
  }
}
.read{
  p{
    margin-bottom: 10px;
    color: #666;
  }
  span{
    display: inline-block;
    width: 120px;
    color: #000;
  }
}
</style>
