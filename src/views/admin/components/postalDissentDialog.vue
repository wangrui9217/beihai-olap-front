<template>
  <div>
    <el-dialog :title="title" :visible.sync="dialogVisible" width="1300px" :close-on-click-modal="false">
      <div class="g-send-document g-mail">
        <!-- <p class="tips"><b>💡系统已签章，</b>如需线下签章，请先下载，再上传。</p> -->
        <el-table :data="postalData" stripe class="css-table mt20" :row-style="{'font-size':'12px'}">
          <el-table-column prop="arbNumber" label="案件编号" width="100">
          </el-table-column>
          <el-table-column prop="roleName" label="送达对象" width="80">
          </el-table-column>
          <el-table-column prop="userName" label="收件人" width="100">
          </el-table-column>
          <el-table-column label="文件名">
            <template slot-scope="scope">
              <!-- <el-checkbox :indeterminate="scope.row.isIndeterminate" v-model="scope.row.checkAll" @change="(val) =>handleCheckAllChange(val,scope.row)">全选</el-checkbox> @change="(val) => handleCheckedCitiesChange(val,scope.row)"-->
              <el-checkbox-group v-model="scope.row.checkList" >
                <div v-for="file in scope.row.documents" :key="file.arbitralDocumentId" class="g-document-checkbox">
                  <el-checkbox :label="file.arbitralDocumentId" :disabled="file.disabled"><span></span></el-checkbox>
                  <a class="g-document-span" :href="file.url" target="_blank">{{file.documentName}}</a>
                </div>
              </el-checkbox-group>
            </template>
          </el-table-column>
          <el-table-column label="快递单号" width="120">
            <template slot-scope="scope">
              <input v-if="!scope.row.arbitralExpressRecordId" class="table-input" v-model.trim="scope.row.expressNumber" :maxLength="15" @blur="e => {validate(e, scope.row)}" />
              <span v-else>{{scope.row.expressNumber}}</span>
            </template>
          </el-table-column>
          <el-table-column label="邮递日期" width="120">
            <template slot-scope="scope">
              <el-date-picker class="table-date" v-model="scope.row.expressTime" type="date" :editable="false" value-format="yyyy-MM-dd" :picker-options="pickerOptions1(scope.row)">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="送达日期" width="120">
            <template slot-scope="scope">
              <el-date-picker class="table-date" v-model="scope.row.arrivedTime" type="date" :editable="false" value-format="yyyy-MM-dd" :picker-options="pickerOptions2(scope.row)">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <span v-if="scope.row.allowSupply" class="g-link" @click="supply(scope.$index, scope.row)">补发快递</span>
              <el-popover
                placement="top"
                width="160"
                v-else-if="scope.row.allowDel"
                v-model="scope.row.visible1">
                <p>是否删除补发快递信息？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.visible1 = false">取消</el-button>
                  <el-button type="primary" size="mini" @click="del(scope.$index, scope.row)">确定</el-button>
                </div>
                <span  class="css-red" slot="reference" >删除</span>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit()">保存并确认</el-button>
      </div>
    </el-dialog>
    <!-- 待上传文书详情 -->
    <!-- <el-dialog title="上传文书" :visible.sync="uploadDialogVisible" width="660px" :close-on-click-modal="false">
      <el-table :data="fileList" style="width: 100%;font-size: 12px;">
        <el-table-column prop="name" label="文件名" :show-overflow-tooltip="true" width="500">
        </el-table-column>
        <el-table-column prop="sizeM" :show-overflow-tooltip="true" label="文件大小(KB)">
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button type="primary" @click="uploadArbitralDocuments()">确定上传</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>
<script>
  import {api} from '@/api'
export default {
  props: {
    postalSubmit: Function,
    postalUpload: Function,
    postalData: Array,
    title: String
  },
  data() {
    return {
      dialogVisible: false,
      // uploadDialogVisible: false,
      fileList: []
    }
  },
  methods: {
    pickerOptions1(row) {
      return {
        disabledDate: (time) => {
          if (row.arrivedTime) {
            let arrivedTime = row.arrivedTime ? new Date(row.arrivedTime.replace(/-/g, '/')).getTime() : 0
            let max = arrivedTime
            return time.getTime() > max
          }
        }
      }
    },
    pickerOptions2(row) {
      return {
        disabledDate: (time) => {
          if (row.expressTime) {
            let expressTime = new Date(row.expressTime.replace(/-/g, '/')).getTime()
            let min = expressTime
            return time.getTime() < min
          }
        }
      }
    },
    validate(e, row) {
      let value = e.target.value
      if (value && /^[0-9a-zA-Z]+$/.test(value) === false) {
        this.$message.warning('快递单号只包含字母和数字，请检查单号')
        e.target.select()
        // row.expressNumber = value.replace(/[^0-9a-zA-Z]/g,'')
      }
    },
    submit() {


      let data = []
      let dataTrue = []
      this.postalData.forEach(item => {
        let obj = {}
        let tempObj = {}
        let tempData=[]
        if (item.expressTime && item.expressNumber) {
          obj = {
            arrivedTime: item.arrivedTime,
            documentArrivedType: 2,
            expressNumber: item.expressNumber,
            expressTime: item.expressTime,
            expressType: item.expressType
          }
          if (item.arrivedTime) obj.arrivedTime = item.arrivedTime
          
          item.documents.forEach(file => {
            if(item.checkList.indexOf(file.arbitralDocumentId) > -1){
              data.push(Object.assign({}, obj, {
                "arbitralDocumentId": file.arbitralDocumentId,
                arbitralExpressRecordId: file.arbitralExpressRecordId,
                arbitralInfoId: file.arbitralInfoId,
                userName: file.userName
              }))
              tempData.push(Object.assign({}, obj, {
                "arbitralDocumentId": file.arbitralDocumentId,
                arbitralExpressRecordId: file.arbitralExpressRecordId,
                arbitralInfoId: file.arbitralInfoId,
                userName: file.userName
              }))
            }
          })
          if(tempData.length!=0)
          tempObj={
            arbNumber:item.arbNumber,
            decisionId:tempData[0].arbitralInfoId,
            arbitralExpressRecordDatas:tempData
          }
          dataTrue.push(tempObj)
        }
      })
      if (data.length === 0) {
        this.$message.error('请选择文书并填写邮递单号和邮递时间，或已邮递文书的送达时间')
        return false
      }
      // console.log(data)
      // return false
      this.postalSubmit(dataTrue)
    },
    open() {
      this.dialogVisible = true
    },
    close() {
      this.dialogVisible = false
    },
    supply(index, row) {
      row.allowSupply = false
      let obj = Object.assign({}, row, {
        checkList: [],
        arrivedTime: '',
        expressNumber: '',
        expressTime: '',
        expressType: 2,
        allowDel: true,
        // isIndeterminate: false,
        // checkAll: false,
        documents: row.documents.map(item => {
          let o = Object.assign({}, item,{
            arbitralExpressRecordId: '',
            expressType: 2
          })
          o.disabled = false
          return o
        })
      })
      this.postalData.splice(index + 1, 0, obj)
    },
    del(index,row) {
      // console.log(row)
      if(row.documents.length > 0 && row.documents[0].arbitralExpressRecordId){
        this.deleteExpressRecord(index, row)
      }
      else{
        this.postalData[index - 1].allowSupply = true
        this.postalData.splice(index, 1)
      }
      row.visible1 = false
    },
    deleteExpressRecord(index, row){
      let ids = []
      row.documents.forEach(item => {
        if(item.arbitralExpressRecordId){
          ids.push(item.arbitralExpressRecordId)
        }
      })
      this.loading = true
      api.deleteExpressRecord({
        arbitralExpressRecordIds: ids
      }).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          this.postalData[index - 1].allowSupply = true
          this.postalData.splice(index, 1)
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    // handleCheckAllChange(val, row) {
    //   row.checkList = val ? row.documents.map(item => { return item.arbitralDocumentId }) : [];
    //   row.isIndeterminate = false;
    // },
    // handleCheckedCitiesChange(value, row) {
    //   let checkedCount = value.length;
    //   row.checkAll = checkedCount === row.documents.length;
    //   row.isIndeterminate = checkedCount > 0 && checkedCount < row.documents.length;
    // },
    // getDocumentInfo(file) {
    //   this.fileInfo = file
    // },
    // uploadArbitralDocuments() {
    //   let formData = new FormData()
    //   this.fileList.forEach(item => {
    //     formData.append('files', item.raw)
    //   })
    //   formData.append('documentType', this.fileInfo.documentType)
    //   this.postalUpload(formData)
    //   this.uploadDialogVisible = false
    // },
  }
}

</script>
<style lang="scss" scoped>
.table-input {
  line-height: 38px;
  width: 108px;
  outline: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  text-indent: 2px;

  &::-webkit-input-placeholder {
    color: #aaa;
  }

  ;
}

.css-red {
  cursor: pointer;
  color: #f00;
}

</style>
