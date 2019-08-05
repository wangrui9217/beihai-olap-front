<template>
  <div v-loading.fullscreen="loading">
    <el-tabs v-model="activeName" class="g-send-document" @tab-click="handleClick">
      <el-tab-pane label="文书签章" name="first">
        <div class="g-listpage__style">
          <list-filter :filter-data="formInlineFirst" :searchFn="() => { search(1)}"></list-filter>
          <div>
            <el-button type="primary" icon="el-icon-download" @click="download()" :disabled="firstSelection.length === 0">下载</el-button>
            <el-upload ref="upload" action="uploadUrl" multiple :show-file-list="false" accept="application/pdf" :on-change="fileChange" :auto-upload="false" style="display: inline-block;">
              <el-button type="primary" slot="trigger" icon="el-icon-upload2" :disabled="tableDataFirst.length === 0">上传</el-button>
            </el-upload>
            <span class="tips"><b>！先下载，签章后再上传。</b>ps : 上传文书的同时也将以邮件形式发送,请知悉</span>
          </div>
          <div class="mt20">
            <el-table :data="tableDataFirst" border style="width: 100%" @selection-change="selectionChangeFirst" ref="tableFirst" row-key="id">
              <el-table-column type="selection" width="60" :reserve-selection="true">
              </el-table-column>
              <el-table-column label="案件编号" :show-overflow-tooltip="true" width="180">
                <template slot-scope="scope">
                  <span class="g-link" @click="into(scope.row)">{{scope.row.code}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="arbName" :show-overflow-tooltip="true" label="案由">
              </el-table-column>
              <el-table-column prop="arbProsecutorName" :show-overflow-tooltip="true" label="申请人">
              </el-table-column>
              <el-table-column prop="arbProductName" :show-overflow-tooltip="true" label="产品类型">
              </el-table-column>
              <el-table-column prop="arbDefendantName" :show-overflow-tooltip="true" label="被申请人">
              </el-table-column>
              <el-table-column prop="createTime" :show-overflow-tooltip="true" label="申请时间">
              </el-table-column>
              <el-table-column :show-overflow-tooltip="true" label="上传签章情况">
                <template slot-scope="scope" v-if="scope.row.uploadStatus">
                   <span v-if="scope.row.uploadStatus.documenSuccessSum!=0&&scope.row.uploadStatus.documenSuccessSum == scope.row.uploadStatus.doucumentSum">已上传（{{scope.row.uploadStatus.doucumentSum}}/{{scope.row.uploadStatus.doucumentSum}}）</span>
                    <span v-else-if="scope.row.uploadStatus.documenSuccessSum == 0">未上传</span>
                    <span v-else class="g-link" @click="openReUpload(scope.row)">部分上传（{{scope.row.uploadStatus.documenSuccessSum}}/{{scope.row.uploadStatus.doucumentSum}}）</span>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination class="pages" @size-change="pageSizeFirstChange" @current-change="pageNoFirstChange" :current-page="pageNoFirst" :page-sizes="[5, 10, 15, 20]" :page-size="pageSizeFirst" layout="total, sizes, prev, pager, next, jumper" :total="totalFirst">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="文书送达" name="second">
        <div class="g-listpage__style">
          <list-filter :filter-data="formInlineSecond" :searchFn="() => { search(2)}"></list-filter>
          <div>
            <!--<el-button @click="short()":disabled="secondSelection.length === 0">短信发送</el-button>-->
            <el-button @click="openMail" :disabled="secondSelection.length === 0">快递发送</el-button>
            <el-button type="primary" @click="openArrivedDialog()" :disabled="secondSelection.length === 0">确认送达</el-button>
            <span class="tips"><b>！线下邮递为可选，确认送达后进入下一阶段。</b></span>
          </div>
          <div class="mt20">
            <el-table :data="tableDataSecond" border style="width: 100%" @selection-change="selectionChangeSecond" ref="tableSecond" row-key="id">
              <el-table-column type="selection" width="60" :reserve-selection="true">
              </el-table-column>
              <el-table-column prop="code" label="案件编号" :show-overflow-tooltip="true" width="180">
                <template slot-scope="scope">
                  <span class="g-link" @click="into(scope.row)">{{scope.row.code}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="arbName" :show-overflow-tooltip="true" label="案由">
              </el-table-column>
              <el-table-column prop="arbProsecutorName" :show-overflow-tooltip="true" label="申请人">
              </el-table-column>
              <el-table-column prop="arbProductName" :show-overflow-tooltip="true" label="产品类型">
              </el-table-column>
              <el-table-column prop="arbDefendantName" :show-overflow-tooltip="true" label="被申请人">
              </el-table-column>
              <el-table-column prop="createTime" :show-overflow-tooltip="true" label="申请时间">
              </el-table-column>
              <!--<el-table-column :show-overflow-tooltip="true" label="短信送达情况">-->
                <!--<template slot-scope="scope" v-if="scope.row.smsStatus">-->
                  <!--<span v-if="scope.row.smsStatus.documenSuccessSum != 0 && scope.row.smsStatus.documenSuccessSum==scope.row.expressStatus.doucumentSum">已送达（{{scope.row.smsStatus.doucumentSum}}/{{scope.row.expressStatus.doucumentSum}}）</span>-->
                  <!--<span v-else-if="scope.row.smsStatus.doucumentSum!=0" >部分送达（{{scope.row.smsStatus.documenSuccessSum}}/{{scope.row.smsStatus.doucumentSum}}）</span>-->
                  <!--<span v-else-if="scope.row.smsStatus.documenSuccessSum!=0" >部分送达（{{scope.row.smsStatus.documenSuccessSum}}/{{scope.row.smsStatus.doucumentSum}}）</span>-->
                  <!--<span v-else>未送达</span>-->
                <!--</template>-->
              <!--</el-table-column>-->
              <el-table-column :show-overflow-tooltip="true" label="电子送达情况">
                <template slot-scope="scope" v-if="scope.row.onlineStatus">
                  <span v-if="scope.row.onlineStatus.documenSuccessSum!=0&&scope.row.onlineStatus.documenSuccessSum == scope.row.onlineStatus.doucumentSum">已送达（{{scope.row.onlineStatus.doucumentSum}}/{{scope.row.onlineStatus.doucumentSum}}）</span>
                    <span v-else-if="scope.row.onlineStatus.documenSuccessSum == 0">未送达</span>
                    <span v-else class="g-link" @click="openEmailDetailDialog(scope.row)">部分送达（{{scope.row.onlineStatus.documenSuccessSum}}/{{scope.row.onlineStatus.doucumentSum}}）</span>
                </template>
              </el-table-column>
              <el-table-column :show-overflow-tooltip="true" label="邮递送达情况">
                <template slot-scope="scope" v-if="scope.row.expressStatus">
                    <span v-if="scope.row.expressStatus.documenSuccessSum != 0 && scope.row.expressStatus.documenSuccessSum==scope.row.expressStatus.doucumentSum">已送达（{{scope.row.expressStatus.doucumentSum}}/{{scope.row.expressStatus.doucumentSum}}）</span>
                    <span v-else-if="scope.row.expressStatus.doucumentSum!=0" >部分送达（{{scope.row.expressStatus.documenSuccessSum}}/{{scope.row.expressStatus.doucumentSum}}）</span>
                    <span v-else-if="scope.row.expressStatus.documenSuccessSum!=0" >部分送达（{{scope.row.expressStatus.documenSuccessSum}}/{{scope.row.expressStatus.doucumentSum}}）</span>
                    <span v-else>未送达</span>
                  </template>
              </el-table-column>
            </el-table>
            <el-pagination class="pages" @size-change="pageSizeSecondChange" @current-change="pageNoSecondChange" :current-page="pageNoSecond" :page-sizes="[5, 10, 15, 20]" :page-size="pageSizeSecond" layout="total, sizes, prev, pager, next, jumper" :total="totalSecond">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- 文书上传详情 -->
    <el-dialog title="" :visible.sync="reUploadDialogVisible" width="800px" :close-on-click-modal="false">
      <el-table :data="uploadDetail" style="width: 100%;font-size: 12px;">
        <el-table-column prop="documentName" label="文件名" :show-overflow-tooltip="true" width="400">
        </el-table-column>
        <el-table-column prop="status" :show-overflow-tooltip="true" label="状态">
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" label="操作">
          <template slot-scope="scope">
            <el-upload v-if="scope.row.status=='未上传'" action="uploadUrl" multiple :show-file-list="false" accept="application/pdf" :on-change="fileChange" :auto-upload="false">
              <span class="g-link">上传</span>
            </el-upload>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog title="上传文书" :visible.sync="uploadDialogVisible" width="800px" :close-on-click-modal="false" :before-close="clearList">
      <el-table :data="fileList" style="width: 100%;font-size: 12px;">
        <el-table-column type="index" width="50" label="序号">
        </el-table-column>
        <el-table-column prop="name" label="文件名" :show-overflow-tooltip="true" width="400">
        </el-table-column>
        <el-table-column prop="sizeM" :show-overflow-tooltip="true" label="文件大小(KB)">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <span class="g-link" @click="remove(scope.row)">移除</span>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button type="primary" @click="uploadArbitralDocuments()">确 定</el-button>
      </div>
    </el-dialog>
    <arrived-dialog ref="arrivedDialog" :confirmFn="arrivedSuccess" :quantity="quantity"></arrived-dialog>
    <mail-dialog ref="mailDialog" :mailFn="postMail" :mailData="mailData"></mail-dialog>
    <email-detail-dialog ref="emailDetailDialog" :emailData="emailData"></email-detail-dialog>
    <el-dialog title="短信文书送达" :visible.sync="dialogVisibles" width="1200px" :close-on-click-modal="false" >
      <div class="g-send-document">
        <p class="tips"><b>💡系统已签章，</b>如需线下签章，请先下载，再上传。</p>
        <el-table :data="emailData" stripe class="css-table mt20">
          <el-table-column prop="arbNumber" label="案件编号" width="170">
          </el-table-column>
          <el-table-column prop="roleName" label="送达对象" width="80">
          </el-table-column>
          <el-table-column prop="userName" label="送达人" width="150">
          </el-table-column>
          <el-table-column label="文件名">
            <template slot-scope="scope">
              <el-checkbox-group v-model="scope.row.checkList">
                <div v-for="file in scope.row.documents" :key="file.arbitralDocumentId" class="g-document-checkbox">
                  <el-checkbox v-if="file.unSend" :label="file.arbitralDocumentId" :disabled="file.disabled"><span></span></el-checkbox>
                  <span class="css-sent" v-else><i class="el-icon-check"></i></span>
                  <a class="g-document-span" :href="file.url" target="_blank">{{file.documentName}}</a>
                  <div v-if="file.isUpload === 1" class="actions">
                    <span style="margin-right: 30px;">上传时间： {{file.updateTime}}</span>
                    <a :href="file.url" :download="file.documentName" class="css-download">下载</a>
                    <el-upload ref="upload" action="uploadUrl" :show-file-list="false" accept="application/pdf"  :auto-upload="false" style="display: inline-block;">
                      <span class="g-link" slot="trigger" @click="getDocumentInfo(file)">上传</span>
                    </el-upload>
                  </div>
                </div>
              </el-checkbox-group>
            </template>
          </el-table-column>
          <el-table-column prop="userPhone " label="手机号码" width="150">
          </el-table-column>
          <el-table-column label="送达情况" width="80">
            <template slot-scope="scope">
              {{scope.row.status}}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer">
        <el-button @click="dialogVisibles = false">取 消</el-button>
        <el-button type="primary" @click="submit()">发送</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
import arrivedDialog from '@admin/components/arrivedDialog'
import mailDialog from '@admin/components/mailDialog'
import emailDetailDialog from '@admin/components/emailDetailDialog'
import util from '@/util/util'
import downloadFileTool from '@/util/downloadFile'
export default {
  components: { listFilter, arrivedDialog, mailDialog, emailDetailDialog},
  data() {
    return {
      fileList: [],
      uploadDialogVisible: false,
      formInlineFirst: {
        arbProductName: '',
        arbProsecutorName: '',
        arbDefendantName: '',
        arbNumber: '',
        arbName: '',
        startTime: '', //查询开始时间
        endTime: '' //查询end时间
      },
      formInlineSecond: {
        arbProductName: '',
        arbProsecutorName: '',
        arbDefendantName: '',
        arbNumber: '',
        arbName: '',
        startTime: '', //查询开始时间
        endTime: '' //查询end时间
      },
      tableDataFirst: [], //表格数据
      tableDataSecond: [], //表格数据
      currentPage: 1,
      sizes: 10, //每页多少条
      totalNum: 0,
      loading: false,
      dialogVisibles:false,
      activeName: 'first',
      firstSelection: [],
      secondSelection: [],
      pageNoFirst: 1,
      pageNoSecond: 1,
      pageSizeFirst: 10,
      pageSizeSecond: 10,
      totalFirst: 0,
      totalSecond: 0,
      uploadDetail: [],
      checkList: [],
      reUploadDialogVisible: false,
      rowStyle: {
        'font-size': '12px'
      },
      errorText: '',
      queryData: {},
      mailData: [],
      emailData: []
    }
  },
  computed:{
    quantity(){
      return this.secondSelection.length
    }
  },
  methods: {
    handleClick(tab, event) {
      if(tab.name === 'second'){
        this.$refs.tableSecond.clearSelection()
        this.getArbitralInfosBySys(2)
      }
      else{
        this.$refs.tableFirst.clearSelection()
        this.getArbitralInfosBySys(1)
      }
    },
    // short () {
    //   this.dialogVisibles = true
    //   this.querySmsProcessArbitralDocument()
    // },
    // 短信发送
    querySmsProcessArbitralDocument(){
      let params = {}
      params = {
        arbitralDocumentDataRequests: this.secondSelection.map(item => {
          return {
            arbitralInfoId: item.id
          }
        }),
        documentType: 6
      }
      api.querySmsProcessArbitralDocument(params).then((res) => {
        if (res.data.code == '1') {
          // this.emailData = res.data.data
          let data = res.data.data
          this.emailData = this.formatEmailData(data)
          let allNumber = res.data.mapDocumentCount
          let successNumber = res.data.mapDocumentArrivedStateCount
          this.emailData.forEach(item => {
            let success = successNumber[item.userName] || '0'
            item.status = success + '/' + allNumber[item.userName]
          })
        } else {
          this.emailData = []
          this.$message.error(res.data.msg);
        }
      })
    },
    formatEmailData(data){
      let obj = {}
      let array = []
      data.forEach(item => {
        if(obj[item.arbNumber+item.userName] === undefined){
          let roleName = item.userType == 1 ? '被申请人' : item.userType == 2 ? '申请人' : '仲裁员'
          obj[item.arbNumber+item.userName] = {
            arbNumber: item.arbNumber,
            userName: item.userName,
            roleName: roleName,
            userEmail: item.userEmail,
            documents: [],
            checkList: [],
            oldCheckList: [],
            arbitralInfoId: item.arbitralInfoId
          }
        }
        item.url = api.getPdfURL(item.documentGeneratorUrlDes)
        let line = obj[item.arbNumber+item.userName]

        if(item.isUpload === 1 && !item.documentSignatureUrlDes&&item.documentName.indexOf('接受指定')>-1){
          item.updateTime = '暂无'
          item.disabled = true
        }
        item.unSend = true
        if(item.documentArrivedState === 1 || item.documentArrivedType === 3){
          item.unSend = false
        }
        else{
          if(item.isSend === 1){
            item.disabled = true
            line.checkList.push(item.arbitralDocumentId)
          }
        }
        line.documents.push(item)
      })
      for(let key in obj){
        array.push(obj[key])
      }
      return array
    },
    submit () {
      let ids = []
      let arbitralInfoIds = []
      this.emailData.forEach(item => {
        arbitralInfoIds.push(item.arbitralInfoId)
        let array = item.checkList.concat(item.oldCheckList).filter(function(v, i, arr) {
          return arr.indexOf(v) === arr.lastIndexOf(v);
        });
        ids.push(...array)
      })
      // if(ids.length === 0){
      //   this.$message.error('请选择至少一个送达')
      //   return false
      // }
      arbitralInfoIds = Array.from(new Set(arbitralInfoIds))
      this.dialogVisibles = true
      api.arrivedSmsArbitralDocumentBatch({
         "arbitralDocumentIds": arbitralInfoIds,
        'documentType': 6,
        // "arbitralInfoIds": arbitralInfoIds
      }).then(res => {
        this.dialogVisibles = false
        if(res.data.code === '103007'){
          // this.$refs['email-dialog'].close()
          this.$alert('操作成功！', '',{
            type: 'success',

          })
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
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
    search(key) { //表单查询（搜索案件编号、案件名、申请人、被申请人。搜索字符长度不超过20个）
      if(key === 1){
        this.pageNoFirst = 1
        this.getArbitralInfosBySys(1);
      }
      else{
        this.pageNoSecond = 1
        this.getArbitralInfosBySys(2);
      }
    },
    pageSizeFirstChange(val) {
      this.pageSizeFirst = val;
      this.getArbitralInfosBySys(1);
    },
    pageNoFirstChange(val) {
      this.pageNoFirst = val;
      this.getArbitralInfosBySys(1);
    },
    pageSizeSecondChange(val) {
      this.pageSizeSecond = val;
      this.getArbitralInfosBySys(2);
    },
    pageNoSecondChange(val) {
      this.pageNoSecond = val;
      this.getArbitralInfosBySys(2);
    },
    selectionChangeFirst(val){
      this.firstSelection = val
    },
    selectionChangeSecond(val) {
      this.secondSelection = val
    },
    getArbitralInfosBySys(key){
      let params = null
      if(key === 1){
        params = Object.assign(this.formInlineFirst, {
          pageNo: this.pageNoFirst,
          pageSize: this.pageSizeFirst,
          //arbStatus: 14
        })
      }
      else{
        params = Object.assign(this.formInlineSecond, {
          pageNo: this.pageNoFirst,
          pageSize: this.pageSizeFirst,
          //arbStatus: 14,
          arbitralAwardSignatureState: 2
        })
      }
      this.loading = true
      api.getJudgeArrivedArbitralInfos(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let tableData = res.data.list
          tableData.forEach( v => {
            v.code = v.arbNumber
            v.status = util.getStatus(v.arbStatus)
          })
          if(key === 1){
            this.tableDataFirst = tableData
            this.totalFirst = res.data.total
          }
          else{
            this.tableDataSecond = tableData
            this.totalSecond = res.data.total
          }
        }
        else{
          if(key === 1){
            this.tableDataFirst = []
            this.totalFirst = 0
          }
          else{
            this.tableDataSecond = []
            this.totalSecond = 0
          }
        }
      })
    },
    clearList(done) {
      this.fileList = []
      done()
    },
    remove(file){
      let i = this.fileList.findIndex(item => {
        return item.uid === file.uid
      })
      this.fileList.splice(i, 1)
    },
    fileChange(file, fileList) {
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isLt2M) {
        this.$message.error('单个文件不可超过10 MB!');
        return false
      }
      this.uploadDialogVisible = true
      file.sizeM = Math.floor(file.size / 1024)
      this.fileList.push(file)
    },
    uploadArbitralDocuments() {
      let allSize = this.fileList.reduce((prev,next) => {
        return prev + next.sizeM
      }, 0)
      if(allSize >= 1024*10){
        this.$message.error('文件总大小不可超过10 MB!');
        return false
      }
      let formData = new FormData()
      this.fileList.forEach(item => {
        formData.append('files', item.raw)
      })
      formData.append('documentType', '6')
      this.loading = true
      api.uploadArbitralDocuments(formData).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          this.$message.success(res.data.msg)
          this.uploadDialogVisible = false
          this.fileList = []
          if(this.reUploadDialogVisible) {
            this.openReUpload(this.queryData)
          }
          this.getArbitralInfosBySys(1)
          this.getArbitralInfosBySys(2)
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    openMail(){
      this.mailData = []
      this.$refs.mailDialog.open()
      this.querySendDetail()
    },
    short(){
      this.dialogVisibles = true
      this.emailData = []
      this.querySmsProcessArbitralDocument()
    },
    openEmailDetailDialog(row){
      this.emailData = []
      this.$refs.emailDetailDialog.open()
      this.querySendDetail(row)
    },
    download(){
      let data = this.firstSelection.map(item => {
        return {
          arbitralInfoId: item.id
        }
      })
      this.queryDocuments(data, 'download')
    },
    // 查询文书或开启下载
    queryDocuments(data, key){
      let params = {
        arbitralDocumentDataRequests: data,
        documentType: 6
      }
      this.loading = true;
      api.queryArbitralDocumentBatch(params).then((res) => {
        this.loading = false;
        if (res.data.code == '1') {
          let data = res.data.data
          if(key === 'uploadDetail'){
            data.forEach(item => {
              item.status = item.documentGeneratorUrlDes&&item.documentSignatureUrlDes!=''?'已上传':'未上传'
            })
            this.uploadDetail = data
          }
          else if(key === 'download'){
            data.forEach(item => {
              api.downloadOtherFile({
                filePath: item.documentGeneratorUrlDes,
                fileName: item.documentName
              }).then(res => {
                console.log(res);
                
                if (res.data instanceof Blob) {
                  downloadFileTool(res.data, item.documentName)
                }
              })
            })
            this.$refs.tableFirst.clearSelection();
          }
          else if(key === 'smsDetail'){
            data.forEach(item => {
              item.roleName = item.userType==1?'被申请人':item.userType==2?'申请人':'仲裁员'
              item.status = item.status || util.formatTime(new Date(), 'yyyy-MM-dd')
              item.formArrivedTime = ''
            })
            this.mailData = data
          }
          else if(key === 'mailDetail'){
            data.forEach(item => {
              item.roleName = item.userType==1?'被申请人':item.userType==2?'申请人':'仲裁员'
              item.expressTime = item.expressTime || util.formatTime(new Date(), 'yyyy-MM-dd')
              item.formArrivedTime = ''
            })
            this.mailData = data
          }
          else if(key === 'emailDetail'){
            data.forEach(item => {
              item.roleName = item.userType==1?'被申请人':item.userType==2?'申请人':'仲裁员'
              item.status = item.documentArrivedState==1?'已送达':'送达失败'
            })
            this.emailData = data
          }
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    openReUpload(row){
      this.queryData = row
      let data = [{arbitralInfoId: row.id}]
      this.uploadDetail = []
      this.queryDocuments(data, 'uploadDetail')
      this.reUploadDialogVisible = true
    },
    postMail(data){

      this.loading = true
      api.postMail({
        arbitralExpressRecordDatas: data
      }).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          this.$message.success(res.data.msg)
          this.$refs.mailDialog.close()
          this.$refs.tableSecond.clearSelection();
          this.getArbitralInfosBySys(2)
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    querySendDetail(row){
      let data = []
      if(row){
        data = [{arbitralInfoId: row.id}]
        this.queryDocuments(data, 'emailDetail')
      }
      else{
        data = this.secondSelection.map(item => {
          return {
            arbitralInfoId: item.id
          }
        })
        this.queryDocuments(data, 'mailDetail')
      }

    },
    refresh(){
      this.getArbitralInfosBySys(2)
      this.$refs.tableSecond.clearSelection()
    },
    // 重新发送
    // reSend(row){
    //   this.loading = true
    //   api.arrivedArbitralDocument({
    //     arbitralDocumentId: row.arbitralDocumentId
    //   }).then((res) => {
    //     this.loading = false;
    //     if (res.data.code == '1') {
    //       this.$message.success(res.data.msg);
    //       this.querySendDetail(this.queryData)
    //     } else {
    //       this.$message.warning(res.data.msg);
    //     }
    //   })
    // },
    openArrivedDialog(){
      this.$refs['arrivedDialog'].openDialog()
    },
    arrivedSuccess() {
      //
      let params = this.secondSelection.map(item => {
          return {
            arbitralInfoId: item.id,
            processTaskId: item.arbProcessTask,
            arbNumber: item.arbNumber
          }
        })

      this.loading = true
      api.arbitralAwardArrivedSuccess(params).then(res => {
        this.loading = false;
        if (res.data.code === '1') {
          this.$message.success(res.data.msg)
          this.$refs['arrivedDialog'].closeDialog()
          this.refresh()
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    }
  },
  created(){
    this.getArbitralInfosBySys(1)
  }
}

</script>
<style lang="scss" scoped>
.send-ul{
  span{
    color: #999;
    margin-right: 20px;
    font-size: 14px;
  }
  p{
    font-size: 16px;
  }
}
.send-li{
  margin-top: 15px;
  display: flex;
  line-height: 30px;
  .send-type{
    margin-left: 50px;
    background: #f2f2f2;
    padding: 0 10px;
  }
  .error-text{
    color: #F56C6C;
    font-size: 12px;
    padding-left: 5px;
  }
}
.table-input{
  line-height: 40px;
  width: 136px;
  outline: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  text-indent: 5px;
  &::-webkit-input-placeholder{
    color: #aaa;
  };
}
.table-date.el-input{
  width: 130px;

}
.revoke {
  color: #409EFF;
  cursor: pointer;
}
.css-sent{
  color:#409eff;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  width: 24px;
}
</style>
