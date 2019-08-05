<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div class="bill-form">
      <span>申请人</span>
      <el-input v-model.trim="filter.applicant" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <span>充值金额</span>
      <el-input v-model.trim="filter.rechargeMoney" placeholder="请输入" @keyup.enter.native="searchFn" type="number"></el-input>
      <span>创建时间</span>
      <el-date-picker v-model="filter.startTime" type="date" value-format="yyyy-MM-dd" :picker-options="startOptions" @keyup.enter.native="searchFn">
      </el-date-picker>
      <b style="margin-left: -30px">-</b>
      <el-date-picker v-model="filter.endTime" type="date" value-format="yyyy-MM-dd" :picker-options="endOptions" @keyup.enter.native="searchFn">
      </el-date-picker>
      <span>充值结果</span>
      <el-select v-model="filter.rechargeResult" style="width: 100px;">
        <el-option v-for="item in [{label:'全部',value:null},{label:'审核中',value:'1'},{label:'通过',value:'10'},{label:'不通过',value:'11'}]" :key="item.value" :label="item.label" :value="item.value" ></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <el-table :data="tableData" border class="g-table mt20">
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column prop="applicant" label="申请人">
      </el-table-column>
      <el-table-column prop="caseNumber" label="案件编号">
      </el-table-column>
      <el-table-column prop="money" label="预充值金额（元）">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" >
      </el-table-column>
      <el-table-column prop="result" label="充值审核" >
        <template slot-scope="scope">
          <span v-if="scope.row.result == 1">审核中</span>
          <span v-if="scope.row.result == 10">通过</span>
          <span v-if="scope.row.result == 11">不通过</span>
          <span v-if="scope.row.advice">,{{scope.row.advice}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="操作" >
        <template slot-scope="scope">
          <span class="g-link" @click="into(scope.row)" v-if="scope.row.result == 1">审核</span>
          <span v-else>审核</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="外部通知" >
        <template slot-scope="scope">
          <span class="g-link" @click="into(scope.row)" v-if="scope.row.externalNotice == 2 || scope.row.externalNotice == 0">重新发送</span>
          <span v-if="scope.row.externalNotice == 1">成功</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="g-pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>

    <el-dialog title="充值审核" :visible.sync="rechargeApplyVisible" width="600px">
      <el-form label-width="120px" :rules="rules" ref="ruleForm" :model="examine">
        <el-form-item label="充值金额：">
          <span>{{examine.money}}</span>
        </el-form-item>
        <el-form-item label="充值时间：">
          <span>{{examine.createTime}}</span>
        </el-form-item>
        <el-form-item label="充值凭证：">
          <span v-if="examine.attachments && examine.attachments instanceof Array && examine.attachments.length > 0">
            <span class="g-link ml" @click="downloadPdf(item.fileUrl, item.fileName)" v-for="(item, index) in examine.attachments" :key="index">{{item.fileName}}</span>
          </span>
          <!--<el-upload multiple ref="supplyUpload" :headers="headers" :action="uploadUrl" :on-error="uploadError" :on-success="(res, file) => {fileSuccess(res, file)}" :before-upload="fileFilter" list-type="picture-card">-->
            <!--<i class="el-icon-plus g-uploader-icon"></i>-->
          <!--</el-upload>-->
        </el-form-item>
        <el-form-item label="审核结果：">
          <el-radio v-model="examine.audit" label="10">通过</el-radio>
          <el-radio v-model="examine.audit" label="11">不通过</el-radio>
        </el-form-item>
        <el-form-item label="审核意见：" prop="advice">
          <el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="examine.advice">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button @click="rechargeApplyVisible = false">取 消</el-button>
        <el-button type="primary" @click="supply">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { api } from '@/api'
import util from '@/util/util'
import DownloadFile from '@/util/downloadFile'
export default {
  data(){
    let nowdate = new Date();
    nowdate.setMonth(nowdate.getMonth()-1);
    var validatePass = (rule, value, callback) => {
      if (this.examine.audit == 10 || this.examine.audit == 11 && this.examine.advice) {
        callback()
      } else {
        callback(new Error ('请输入审核意见'))
      }
    }
    return {
      rules: {
        advice: [{validator: validatePass, trigger: 'blur'}]
      },
      rechargeApplyVisible: false,
      loading: false,
      dataRange: '',
      filter: {
        applicant: '',
        rechargeMoney: '',
        rechargeResult: null,
        startTime: util.formatTime(nowdate, 'yyyy-MM-dd'),
        endTime: util.formatTime(new Date(), 'yyyy-MM-dd'),
      },
      examine: {
        id: '',
        audit: '',
        advice: ''
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
    downloadPdf (url, name) {
      let urlPath
      let lastName = name.substring(name.lastIndexOf('.')).toLowerCase()
      if (/\.jpg|\.png|\.jpeg/.test(lastName) === true) {
        urlPath = api.getImgURL(url)
      } else {  // pdf
        urlPath = api.getPdfURL(url)
      }
      // console.log(urlPath)
      DownloadFile(urlPath, name)
    },
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
        applicant: '',
        endTime: '',
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        rechargeMoney: '',
        rechargeResult: '',
        startTime: ''
      }, this.filter)
      api.getRechargeAuditList(params).then(res => {
        if(res.data.code === '1') {
          this.tableData = res.data.data.list
          this.total = res.data.data.total
        } else {
          this.tableData = []
          this.total = 0
        }
      })
    },
    supply () {
      this.$refs['ruleForm'].validate((valid) => {
        api.rechargeAudit(this.examine).then(res => {
          if (res.data.code === '1') {
            this.$message.success(res.data.msg)
            this.getPayment()
          } else {
            this.$message.error(res.data.msg)
          }
          this.rechargeApplyVisible = false
        })
      })
    },
    into(row) {
      this.rechargeApplyVisible = true
      this.examine = {...this.examine, ...row}
      this.examine.audit = '10'
      this.$nextTick(() => {
        this.$refs['ruleForm'].resetFields()
      })
      // this.examine.id = row.id
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
  .ml{
    margin-right: 15px;
  }
</style>
