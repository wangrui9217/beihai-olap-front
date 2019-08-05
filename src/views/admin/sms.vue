<template>
  <div v-loading.fullscreen="loading">
    <div class="g-listpage__style g-send-document">
      <div style="float: right;margin-bottom: 20px">
        <el-button type="primary" @click="download()" v-if="multipleSelection.length != 0">下载</el-button>
      </div>
      <div class="mt20">
        <el-table :data="tableData" border style="width: 100%"   row-key="id" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" :reserve-selection="true">
          </el-table-column>
          <el-table-column prop="documentName" :label="multipleSelection.length === 0 ? '文件名称':`已选中${multipleSelection.length}个文件`" :show-overflow-tooltip="true" >
          </el-table-column>
        </el-table>
        <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>

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
        multipleSelection: [],
        formInline: {},
        tableData: [], //表格数据
        loading: false, //
        secondSelection: [],
        postalData: [],
        dialogVisible:false,
        firstSelection: [],
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
      handleSelectionChange (val) {
        this.multipleSelection = val
      },
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
            // this.$refs['arrivedDialog'].closeDialog()
            this.refresh()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      },
      download(){
        let data = this.multipleSelection.map(item => {
          return {
            arbitralInfoId: item.arbitralInfoId
          }
        })
        this.queryDocuments(data, 'download')
      },
      //下载
      queryDocuments(data, key){
        let params = {
          // arbitralInfoId: "a28722a6784311e98bd8005056ae47c6",
          arbitralDocumentDataRequests: data,
          documentType: 6
        }
        this.loading = true;
        api.queryArbitralDocumentBatch(params).then((res) => {
          this.loading = false;
          if (res.data.code == '1') {
            let data = res.data.data;
            if(key === 'download') {
              data.forEach(item => {
                api.downloadOtherFile({
                  filePath: item.restartUpaloadUrl,
                  fileName: item.documentName
                }).then(res => {
                  if (res.data instanceof Blob) {
                    downloadFileTool(res.data, item.documentName)
                  }
                })
              })
            }
              this.$refs.tableFirst.clearSelection();
            } else {
            this.$message.error(res.data.msg);
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
      // // 查询线下文书情况
      // queryDocuments() {
      //   let params = {}
      //   params = {
      //     arbitralDocumentDataRequests: this.secondSelection.map(item => {
      //       return {
      //         arbitralInfoId: item.id
      //       }
      //     }),
      //     documentType: '2, 4'
      //   }
      //   api.queryArbitralDocumentExpressRecord(params).then((res) => {
      //     if (res.data.code == '1') {
      //       let data = res.data.data
      //
      //       this.postalData = this.formatPostalData(data)
      //     } else {
      //       this.postalData = []
      //       this.$message.error(res.data.msg);
      //     }
      //   })
      // },
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
        this.getH5ArbitralList()
        // this.$refs.table.clearSelection();
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
        this.getH5ArbitralList();
      },
      pageSizeChange(val) {
        this.pageSize = val;
        this.getH5ArbitralList();
      },
      pageNoChange(val) {
        this.pageNo = val;
        this.getH5ArbitralList();
      },
      selectionChange(rows) {
        this.secondSelection = rows
      },
      //短信信息
      getH5ArbitralList() {
        let params = {}
        params = {
          // arbitralDocumentDataRequests: this.secondSelection.map(item => {
            // return {
            // }
          // }),
          arbitralInfoId:"a28722a6784311e98bd8005056ae47c6",
          documentType: '2,4',
          type : 0,
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        }
        api.getH5ArbitralList(params).then(res => {
          this.tableData = res.data.data
          // if(secondSelection.length !=0){
          //
          // }
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
            this.getH5ArbitralList()
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
      this.getH5ArbitralList();
      this.arrivedSuccess()
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
