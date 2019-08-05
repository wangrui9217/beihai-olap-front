<template>
  <div v-loading.fullscreen="loading">
    <div class="g-listpage__style g-send-document">
      <list-filter :filter-data="formInline" :searchFn="search"></list-filter>
      <div>
        <!--<el-button @click="short()" :disabled="secondSelection.length === 0">短信发送</el-button>-->
        <el-button @click="openEmail()" :disabled="secondSelection.length === 0">线上邮件</el-button>
        <el-button @click="openPostal()" :disabled="secondSelection.length === 0">快递发送</el-button>
        <el-button type="primary" @click="openArrivedDialog" :disabled="secondSelection.length === 0">确认送达</el-button>
        <span class="tips"><b>！短信发送与快递发送为可选，确认送达后进入下一阶段。</b></span>
      </div>
      <div class="mt20">
        <el-table :data="tableData" border style="width: 100%" @selection-change="selectionChange" ref="table" row-key="id">
          <el-table-column type="selection" width="60" :reserve-selection="true">
          </el-table-column>
          <el-table-column prop="code" label="案件编号" :show-overflow-tooltip="true" width="180">
            <template slot-scope="scope">
              <span class="revoke" @click="into(scope.row)">{{scope.row.code}}</span>
            </template>
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
            <!--<template slot-scope="scope">-->
              <!--<span>{{scope.row.smsSome}}</span>-->
            <!--</template>-->
          <!--</el-table-column>-->
          <el-table-column :show-overflow-tooltip="true" label="电子送达情况">
            <template slot-scope="scope">
              <span>{{scope.row.onlineSome}}</span>
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" label="邮递送达情况">
            <template slot-scope="scope" >
              <span>{{scope.row.expressSome}}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>

    <postal-dialog title="线下文书送达" ref="postal-dialog" :postal-submit="postalSubmit" :postal-data="postalData" :postalUpload="postalUpload"></postal-dialog>
    <arrived-dialog ref="arrivedDialog" :confirmFn="arrivedSuccess" :quantity="quantity"></arrived-dialog>
    <email-dialog title="线上文书送达" ref="email-dialog" :email-submit="emailSubmit" :email-data="emailData" :emailUpload="emailUpload"></email-dialog>
    <el-dialog title="短信文书送达" :visible.sync="dialogVisible" width="1200px" :close-on-click-modal="false" >
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
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit()">发送</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
import arrivedDialog from '@admin/components/arrivedDialog'
// import mailDialog from '@admin/components/mailDialog'
import emailDialog from '@admin/components/emailDialog'
import postalDialog from '@admin/components/postalDialog'
import util from '@/util/util'
import downloadFileTool from '@/util/downloadFile'
export default {
  components: { listFilter, arrivedDialog, postalDialog, emailDialog},
  data() {
    return {
      formInline: {},
      tableData: [], //表格数据
      loading: false, //
      secondSelection: [],
      postalData: [],
      dialogVisible:false,
      pageNo: 1,
      pageSize: 10,
      total: 0,
      emailData: []
    }
  },
  props: {
    arbStatus: Number,
    documentTypes: String
  },
  computed: {
    quantity() {
      return this.secondSelection.length
    }
  },
  methods: {
    // clearList(done) {
    //   this.fileList = []
    //   done()
    // },

    openPostal() {
      this.postalData = []
      this.$refs['postal-dialog'].open()
      this.queryDocuments()
    },
    openEmail() {
      this.emailData = []
      this.$refs['email-dialog'].open()
      this.queryProcessArbitralDocument()
    },
    openArrivedDialog() {
      this.$refs['arrivedDialog'].openDialog()
    },
    short () {
      this.dialogVisible = true
      this.querySmsProcessArbitralDocument()
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
      api.registerDocumentArrivedSuccess(params).then(res => {
        this.loading = false;
        if (res.data.code === '1') {
          this.$message.success(res.data.msg)
          this.$refs['arrivedDialog'].closeDialog()
          this.refresh()
        } else {
          this.$message.error(res.data.msg)
        }
      })
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
      if(ids.length === 0){
        this.$message.error('请选择至少一个送达')
        return false
      }
      arbitralInfoIds = Array.from(new Set(arbitralInfoIds))
      this.dialogVisible = true
      api.arrivedSmsArbitralDocumentBatch({
        "arbitralDocumentIds": ids,
        "arbitralInfoIds": arbitralInfoIds
      }).then(res => {
        this.dialogVisible = false
        if(res.data.code === '1'){
          this.$refs['email-dialog'].close()
          this.$alert('操作成功！', '',{
            type: 'success',

          })
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    // 短信发送
    querySmsProcessArbitralDocument(){
      let params = {}
      params = {
        arbitralDocumentDataRequests: this.secondSelection.map(item => {
          return {
            arbitralInfoId: item.id
          }
        }),
        documentType: '2,4'
      }
      api.querySmsProcessArbitralDocument(params).then((res) => {
        if (res.data.code == '1') {
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
    // 查询线上文书情况
    queryProcessArbitralDocument(){
      let params = {}
      params = {
        arbitralDocumentDataRequests: this.secondSelection.map(item => {
          return {
            arbitralInfoId: item.id
          }
        }),
        documentType: '2,4'
      }
      api.queryProcessArbitralDocument(params).then((res) => {
        if (res.data.code == '1') {
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
    // 查询线下文书情况
    queryDocuments() {
      let params = {}
      params = {
        arbitralDocumentDataRequests: this.secondSelection.map(item => {
          return {
            arbitralInfoId: item.id
          }
        }),
        documentType: '2, 4'
      }
      api.queryArbitralDocumentExpressRecord(params).then((res) => {
        if (res.data.code == '1') {
          let data = res.data.data

          this.postalData = this.formatPostalData(data)
        } else {
          this.postalData = []
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
        item.url = api.getPdfURL(item.restartUpaloadUrl)
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
    formatPostalData(data){
      let obj = {}
      let array = []
      data.forEach(file => {
        let expressType = file.expressType || 1
        if(obj[file.arbNumber+file.userName+expressType] === undefined){
          let roleName = file.userType == 1 ? '被申请人' : file.userType == 2 ? '申请人' : '仲裁员'
          obj[file.arbNumber+file.userName+expressType] = {
            arbNumber: file.arbNumber,
            userName: file.userName,
            roleName: roleName,
            documents: [],
            checkList: [],
            expressType: expressType,
            expressNumber: file.expressNumber,
            expressTime: file.expressTime,
            arrivedTime: file.arrivedTime,
            allowSupply: true,   // 是否开启补充按钮
            allowDel: false,   // 是否开启删除按钮
            visible1: false    // 删除的确认框el-popover
          }
        }
        file.url = api.getPdfURL(file.restartUpaloadUrl)
        let line = obj[file.arbNumber+file.userName+expressType]
        if(file.expressType){
          file.disabled = true
          line.checkList.push(file.arbitralDocumentId)
        }
        if(expressType === 2){
          line.allowSupply = false
          line.allowDel = true
          if(obj[file.arbNumber+file.userName+'1']){
            obj[file.arbNumber+file.userName+'1'].allowSupply = false
          }
        }
        else if(obj[file.arbNumber+file.userName+'2'] && obj[file.arbNumber+file.userName+'2'].allowSupply === false){
          line.allowSupply = false
        }
        line.documents.push(file)
      })
      for(let key in obj){
        array.push(obj[key])
      }
      // 数组中补发的数据放到原数据下一个位置
      array.forEach((item,index,arr) => {
        if(item.expressType === 2){
          let i = arr.findIndex(v => {return v.arbNumber+v.userName === item.arbNumber+item.userName && v.expressType === 1})
          let ids1 = arr[i].documents.map(file => {
            return file.arbitralDocumentId
          })
          let ids2 = item.documents.map(file => {
            return file.arbitralDocumentId
          })
          arr[i].documents.forEach(file => {
            if(ids2.indexOf(file.arbitralDocumentId) < 0){
              item.documents.push(Object.assign({},file, {
                disabled: false,
                expressType: 2,
                arbitralExpressRecordId: '',
                arrivedTime: '',
                expressNumber: '',
                expressTime: ''
              }))
            }
          })
          item.documents.forEach(file => {
            if(ids1.indexOf(file.arbitralDocumentId) < 0){
              arr[i].documents.push(Object.assign({},file, {
                disabled: false,
                expressType: 1,
                arbitralExpressRecordId: '',
                arrivedTime: '',
                expressNumber: '',
                expressTime: ''
              }))
            }
          })
          if(i + 1!== index){
            arr.splice(index,1)
            if(i > index){
              arr.splice(i,0,item)
            }
            else{
              arr.splice(i+1,0,item)
            }
          }
        }
      })
      array.sort(function(a,b){
        let arr1 = a['arbNumber'].match(/^.*第(\d+)号.*$/)
        let val1 = arr1?Number(arr1[1]):1
        let arr2 = b['arbNumber'].match(/^.*第(\d+)号.*$/)
        let val2 = arr2?Number(arr2[1]):1
        return val1 - val2
      })
      return array
    },
    refresh() {
      this.getArbitralInfosBySys()
      this.$refs.table.clearSelection();
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
    search() { //表单查询（搜索案件编号、案件名、申请人、被申请人。搜索字符长度不超过20个）
      this.pageNo = 1
      this.getArbitralInfosBySys();
    },
    pageSizeChange(val) {
      this.pageSize = val;
      this.getArbitralInfosBySys();
    },
    pageNoChange(val) {
      this.pageNo = val;
      this.getArbitralInfosBySys();
    },
    selectionChange(rows) {
      this.secondSelection = rows
    },
    getArbitralInfosBySys() {
      let params = null
      params = Object.assign(this.formInline, {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        //arbStatus: 4,
        arbitralRegisterSignatureState: 2
      })
      this.loading = true
      api.getRegisterArbitralInfos(params).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          let tableData = res.data.list
          tableData.forEach(item => {
            item.code = item.arbNumber
            item.status = util.getStatus(item.arbStatus)
            item.onlineSome = this.setDocumentStatus(item.onlineStatus)
            // item.smsSome = this.setDocumentStatus(item.smsStatus)
            item.expressSome = this.setDocumentStatus(item.expressStatus)
          })
          this.tableData = tableData
          this.total = res.data.total
        } else {
          this.tableData = []
          this.total = 0
        }
      })
    },
    setDocumentStatus(status){
      let some = ''
      let doucumentSum = Number.parseInt(status.doucumentSum)
      let documenSuccessSum = Number.parseInt(status.documenSuccessSum)
      if(doucumentSum !==0 && documenSuccessSum === doucumentSum){
        some = `已送达(${documenSuccessSum}/${doucumentSum})`
      }
      else if(documenSuccessSum > 0){
        some = `部分送达(${documenSuccessSum}/${doucumentSum})`
      }
      else{
        some = '未送达'
      }
      return some
    },

    postalSubmit(data) {
      this.loading = true
      api.postMail({
        arbitralExpressRecordDatas: data
      }).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          this.$message.success(res.data.msg)
          this.$refs['postal-dialog'].close()
          this.$refs['table'].clearSelection()
          this.getArbitralInfosBySys()
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    emailSubmit(){
      let ids = []
      let arbitralInfoIds = []
      this.emailData.forEach(item => {
        arbitralInfoIds.push(item.arbitralInfoId)
        let array = item.checkList.concat(item.oldCheckList).filter(function(v, i, arr) {
          return arr.indexOf(v) === arr.lastIndexOf(v);
        });
        ids.push(...array)
      })
      if(ids.length === 0){
        this.$message.error('请选择至少一个文书进行送达')
        return false
      }
      arbitralInfoIds = Array.from(new Set(arbitralInfoIds))
      this.loading = true
      api.arrivedArbitralDocumentBatch({
        "arbitralDocumentIds": ids,
        "arbitralInfoIds": arbitralInfoIds
      }).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          this.$refs['email-dialog'].close()
          this.$alert('操作成功！邮件发送需要1分钟，请稍后查询结果。', '',{
            type: 'success'
          })
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    postalUpload(data){
      this.upload(data, () => {
        this.openPostal()
      })
    },
    emailUpload(data, fileInfo){
      this.upload(data, () => {
        fileInfo.disabled = false
        fileInfo.updateTime = util.formatTime(new Date(), 'yyyy-MM-dd hh:mm:ss')
        this.queryProcessArbitralDocument()
      })
    },
    upload(data, callback){
      this.loading = true
      api.uploadReplaceDocument(data).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          this.$message.success(res.data.msg)
          callback()
        } else {
          this.$message.error(res.data.msg)
        }
      })
    }
  },
  created() {
    this.getArbitralInfosBySys();
  }
}

</script>
<style lang="scss" scoped>
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


