<template>
  <div>
    <el-dialog :title="title" :visible.sync="dialogVisible" width="1200px" :close-on-click-modal="false" >
      <div class="g-send-document">
        <p class="tips"><b>💡系统已签章，</b>如需线下签章，请先下载，再上传。</p>
        <el-table :data="emailData" stripe class="css-table mt20">
          <el-table-column prop="arbNumber" label="案件编号" width="170">
          </el-table-column>
          <el-table-column prop="roleName" label="送达对象" width="80">
          </el-table-column>
          <el-table-column prop="userName" label="收件人" width="150">
          </el-table-column>
          <el-table-column label="文件名">
            <template slot-scope="scope">
              <el-checkbox-group v-model="scope.row.checkList">
                <div v-for="file in scope.row.documents" :key="file.arbitralDocumentId" class="g-document-checkbox">
                  <el-checkbox v-if="file.unSend" :label="file.arbitralDocumentId" :disabled="file.disabled"><span></span></el-checkbox>
                  <span class="css-sent" v-else><i class="el-icon-check"></i></span>
                  <a class="g-document-span" :href="file.url" target="_blank">{{file.documentName}}</a>
                  <div v-if="file.isUpload === 1||file.isUpload === 2" class="actions">
                  <!-- <div  class="actions"> -->
                    <!-- <span style="margin-right: 30px;">上传时间： {{file.updateTime}}</span> -->
                    <!-- <div>{{file.url}}</div> -->
                    <a :href="file.url" :download="file.documentName" class="css-download">下载</a>
                    <el-upload ref="upload" action="uploadUrl" :show-file-list="false" accept="application/pdf" :on-change="fileChange" :auto-upload="false" style="display: inline-block;">
                      <span v-if="file.isUpload === 1" class="g-link" slot="trigger" @click="getDocumentInfo(file)">上传</span>
                      <span v-if="file.isUpload === 2" class="g-link" slot="trigger" @click="getDocumentInfo(file)">重新上传</span>
                    </el-upload>
                  </div>
                </div>
              </el-checkbox-group>
            </template>
          </el-table-column>
          <el-table-column prop="userEmail" label="邮箱地址" width="150">
          </el-table-column>
          <el-table-column label="送达情况" width="80">
            <template slot-scope="scope">
              {{scope.row.status}}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit()">发送</el-button>
      </div>
    </el-dialog>
    <!-- 待上传文书详情 -->
    <el-dialog title="上传文书" :visible.sync="uploadDialogVisible" width="660px" :close-on-click-modal="false">
      <el-table :data="fileList" style="width: 100%;font-size: 12px;">
        <el-table-column prop="name" label="文件名" :show-overflow-tooltip="true" width="500">
        </el-table-column>
        <el-table-column prop="sizeM" :show-overflow-tooltip="true" label="文件大小(KB)">
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button type="primary" @click="uploadArbitralDocuments()">确定上传</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
export default {
  props: {
    emailSubmit: Function,
    emailUpload: Function,
    emailData: Array,
    title: String
  },
  data() {
    return {
      uploadUrl: api.uploadURLNew,
      fileList: [],
      dialogVisible: false,
      uploadDialogVisible: false,
      fileInfo: {}
    }
  },
  methods: {
    submit() {
      this.emailSubmit()
    },
    open() {
      this.dialogVisible = true
    },
    close() {
      this.dialogVisible = false
    },
    fileChange(file, fileList) {
      this.fileList = []
      const isLt10M = file.size / 1024 / 1024 < 10
      if(file.name !== this.fileInfo.documentName){
        this.$message.error('文件名错误，请检查无误再上传！');
        return false
      }
      else if (!isLt10M) {
        this.$message.error('文件不可超过10 MB！');
        return false
      }
      this.uploadDialogVisible = true
      file.sizeM = Math.floor(file.size / 1024)
      this.fileList.push(file)
    },
    getDocumentInfo(file){
      this.fileInfo = file
    },
    uploadArbitralDocuments() {
      let formData = new FormData()
      this.fileList.forEach(item => {
        formData.append('files', item.raw)
        
      })
      formData.append('documentId', this.fileInfo.arbitralDocumentId)
      // formData.append('documentType', this.fileInfo.documentType)
      this.emailUpload(formData, this.fileInfo)
      this.uploadDialogVisible = false
    },
  }
}

</script>
<style lang="scss" scoped>
.actions {
  font-size: 12px;
  padding-left: 24px;
  .css-download {
    color: #1890FF;
    margin-right: 15px;
  }
}
.css-sent{
  color:#409eff;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  width: 24px;
}
</style>
