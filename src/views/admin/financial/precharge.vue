<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div>
      <span>申请人：</span>
      <el-input class="formula-form" v-model.trim="filter.detailName" placeholder="申请人" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <div class="mt20">
      <el-button type="primary" @click="openAddbox"> + 新增</el-button>
    </div>
    <el-table :data="tableData" border class="g-table">
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column prop="capitalName" label="申请人">
      </el-table-column>
      <el-table-column label="预充值金额（元）">
        <template slot-scope="scope"><span class="g-link" @click="openDetail(scope.row)">{{scope.row.capital}}</span></template>
      </el-table-column>
      <el-table-column prop="capitalMoneyTime" label="充值时间">
      </el-table-column>
      <el-table-column prop="remark" label="备注">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <span class="g-link" @click="openSupplyUpload(scope.row)">补充凭证</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog title="新增预充值" :visible.sync="addDialogVisible" width="800px" :close-on-click-modal="false">
      <el-form label-width="120px" :model="form" ref="form">
        <el-form-item label="申请人" prop="userAccountId" :rules="{ required: true, message: '请选择申请人' }">
          <el-select v-model="form.userAccountId" @change="getCapitalName">
            <el-option v-for="item in users" :key="item.userAccountId" :value="item.userAccountId" :label="item.coName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item  label="预充值金额(元)" prop="capital" :rules="[
          { required: true, message: '请输入预充值金额' },
          { pattern: /^\d+(\.\d+)?$/, message: '预充值金额必须是数字' }
        ]">
          <el-input v-model.number="form.capital" style="width:220px" :maxLength="13"></el-input>
        </el-form-item>
        <el-form-item label="充值时间" prop="capitalTime" :rules="{ required: true, message: '请选择日期' }">
          <el-date-picker v-model="form.capitalTime" type="date" placeholder="选择日期" :editable="false" value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="充值凭证">
          <el-upload multiple ref="upload" :headers="headers" :action="uploadUrl" :on-error="uploadError" :on-success="(res, file) => {fileSuccess(res, file)}" :before-upload="fileFilter" list-type="picture-card">
            <i class="el-icon-plus g-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" :autosize="{ minRows: 4}" :maxLength="100" placeholder="请输入内容" v-model="form.remark">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="预充值详情" :visible.sync="detailDialogVisible" width="800px">
      <el-form label-width="120px">
        <el-form-item label="申请人：">
          <span>{{detailInfo.capitalName}}</span>
        </el-form-item>
        <el-form-item label="预充值金额(元)：">
          <span>{{detailInfo.capital}}</span>
        </el-form-item>
        <el-form-item label="充值时间：">
          <span>{{detailInfo.capitalMoneyTime}}</span>
        </el-form-item>
        <el-form-item label="充值凭证(可选)：">
          <ul class="g-upload-list">
            <li v-for="(file, index) in detailInfo.arbitralAttachments" :key="file.url">
              <div><a :href="file.url" target="_blank"><img :src="file.srcUrl" alt=""></a></div>
              <p>{{file.name}}</p>
            </li>
            <li v-for="(file, index) in detailInfo.otherFiles" :key="file.url">
              <div><img style="cursor: pointer;" @click="download(file)" :src="file.srcUrl" alt=""></div>
              <p>{{file.name}}</p>
            </li>
          </ul>
        </el-form-item>
        <el-form-item label="备注：">
          <span>{{detailInfo.remark}}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog title="补充凭证" :visible.sync="supplyUploadVisible" width="800px">
      <el-form label-width="120px">
        <el-form-item label="申请人：">
          <span>{{detailInfo.capitalName}}</span>
        </el-form-item>
        <el-form-item label="金额：">
          <span>{{detailInfo.capital}}</span>
        </el-form-item>
        <el-form-item label="充值凭证：">
          <el-upload multiple ref="supplyUpload" :headers="headers" :action="uploadUrl" :on-error="uploadError" :on-success="(res, file) => {fileSuccess(res, file)}" :before-upload="fileFilter" list-type="picture-card">
            <i class="el-icon-plus g-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button @click="supplyUploadVisible = false">取 消</el-button>
        <el-button type="primary" @click="supply">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'
import downloadFileTool from '@/util/downloadFile'
export default {
  data() {
    return {
      loading: false,
      total: 0,
      pageSize: 10,
      pageNo: 1,
      tableData: [],
      filter: {
        detailName: ''
      },
      addDialogVisible: false,
      form: {
        userAccountId: '',
        capital: '',
        capitalName: '',
        capitalTime: '',
        capitalType: 1,
        remark: '',
        arbitralAttachments: []
      },
      idNum: '',
      users: [],
      uploadUrl: api.uploadURL,
      headers: {
        Authorization: localStorage.getItem('adminAccessToken')
      },
      mime: [".jpeg", ".jpg", ".png", ".pdf", '.doc','.docx'],
      detailDialogVisible: false,
      detailInfo: {
        arbitralAttachments: [],
        otherFiles: []
      },
      supplyUploadVisible: false
    }
  },
  methods: {
    pageSizeChange(size) {
      this.pageSize = size
      this.getPrefunRecord()
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo
      this.getPrefunRecord()
    },
    getPrefunRecord() {
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }, this.filter)
      api.getPrefunRecord(params).then(res => {
        if (res.data.code === '1') {
          let data = res.data.data.list
          this.tableData = data
          this.total = res.data.data.total
        } else {
          this.tableData = []
          this.total = 0
        }
      })
    },
    openAddbox() {
      if(this.users.length === 0){
        this.queryUserCoInfo()
      }
      this.form.arbitralAttachments = []
      this.addDialogVisible = true
      this.form.remark = ''
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.$refs['upload'].clearFiles()
      })
    },
    searchFn() {
      this.pageNo = 1
      this.getPrefunRecord()
    },
    save() {
      this.$refs['form'].validate(valid => {
        if(valid){
          this.loading = true
          let fileList = this.$refs['upload'].uploadFiles
          this.form.arbitralAttachments = fileList.map((file) => {
            return {
              attachUrl: file.response.data.filePath,
              attachName: file.name,
              attachProperty: 3,
              attachType: 6
            }
          })
          let params = Object.assign({}, this.form)
          params.arbitralAttachments.forEach(item => {
            item.idNum = this.idNum
          })
          api.recharge(params).then(res => {
            this.loading = false
            if (res.data.code === '1') {
              this.$message.success(res.data.msg)
              this.addDialogVisible = false
              this.getPrefunRecord()
            }
            else{
              this.$message.error(res.data.msg)
            }
          })
        }
      })
    },
    download(row){
      this.loading = true
      api.downloadOtherFile({
        filePath: row.url,
        fileName: row.name
      }).then(res => {
        this.loading = false
        if (res.data instanceof Blob) {
          downloadFileTool(res.data, row.name)
        }
        else{
          this.$message.error('文件数据有错误，无法下载')
        }
      })
    },
    openSupplyUpload(row){
      Object.assign(this.detailInfo, row)
      this.supplyUploadVisible = true
      this.$nextTick(() => {
        this.$refs['supplyUpload'].clearFiles()
      })
    },
    supply(){
      let fileList = this.$refs['supplyUpload'].uploadFiles
      if(fileList.length === 0){
        this.$message.error('请上传凭证！')
        return false
      }
      let arbitralAttachments = fileList.map((file) => {
        return {
          attachUrl: file.response.data.filePath,
          attachName: file.name,
          attachProperty: 3,
          attachType: 6
        }
      })
      let params = {
        arbitralAttachments: arbitralAttachments,
        userFundRecordId: this.detailInfo.id
      }
      this.loading = true
      api.rechargeAddAttach(params).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          this.$message.success(res.data.msg)
          this.supplyUploadVisible = false
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    openDetail(row) {
      Object.assign(this.detailInfo, row)
      this.loading = true
      api.queryPrefunRecordAttachmentById({
        id: row.id
      }).then(res => {
        this.loading = false
        this.detailDialogVisible = true
        if (res.data.code === '1') {
          let data = res.data.data
          let arbitralAttachments = []
          let otherFiles = []
          data.forEach(item => {
            let lastName = item.name.substring(item.name.lastIndexOf('.')).toLowerCase()
              if (/\.jpg|\.png|\.jpeg/.test(lastName) === true) {
                item.url = api.getImgURL(item.url)
                item.srcUrl = item.url
                arbitralAttachments.push(item)
              }
              else if (/\.pdf/.test(lastName) === true){  // pdf
                item.url = api.getPdfURL(item.url)
                item.srcUrl = util.getIcon(item.name)
                arbitralAttachments.push(item)
              }
              else{
                item.srcUrl = util.getIcon(item.name)
                otherFiles.push(item)
              }
          })
          this.detailInfo.arbitralAttachments = arbitralAttachments
          this.detailInfo.otherFiles = otherFiles
        }
        else{
          this.detailInfo.arbitralAttachments = []
          this.detailInfo.otherFiles = []
        }
      })
    },
    getCapitalName(val){
      let userInfo = this.users.find((item) => {
        return item.userAccountId === val
      })
      this.form.capitalName = userInfo.coName
      this.idNum = userInfo.coIdnum
    },
    queryUserCoInfo() {
      api.queryUserCoInfo({}).then(res => {
        if (res.data.code === '1') {
          this.users = res.data.data.list
        }
      })
    },
    uploadError(res){
      this.$store.dispatch('httpError',res)
    },
    fileSuccess(res, file) {
      if (res.code == '1') {
        if (file.raw.type !== 'image/jpeg' && file.raw.type !== 'image/png') {
          file.url = util.getIcon(file.name)
        }
      } else {
        this.$message.error(res.msg)
      }
    },
    fileFilter(file) {
      let endName = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      const isMime = this.mime.some((value) => {
        return value == endName
      })
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isMime) {
        this.$message.error('仅支持图片，word，pdf格式文件上传!');
        return false
      }
      if (!isLt2M) {
        this.$message.error('单个文件不可超过10 MB!');
        return false
      }
      return isMime && isLt2M;
    }
  },
  created() {
    this.getPrefunRecord()
  }
}

</script>
<style lang="scss" scoped>
.formula-form {
  width: 200px;
  margin-right: 20px;
}
</style>
