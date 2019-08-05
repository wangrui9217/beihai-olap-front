<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <list-filter :filter-data="formInline" :searchFn="search"></list-filter>
    <el-table :data="tableData" border style="width: 100%" header-cell-class-name="g-thead-class">
      <el-table-column type="index" width="60" label="序号">
      </el-table-column>
      <el-table-column label="案件编号" :show-overflow-tooltip="true" width="180">
        <template slot-scope="scope">
          <span class="revoke" @click="into(scope.row)">{{scope.row.code}}</span>
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
      <el-table-column prop="status" :show-overflow-tooltip="true" label="案件状态">
        <template slot-scope="scope">
          <span v-if="scope.row.arbProcessExplain == 1">申请</span>
          <span v-if="scope.row.arbProcessExplain == 2">立案</span>
          <span v-if="scope.row.arbProcessExplain == 3">答辩</span>
          <span v-if="scope.row.arbProcessExplain == 4">审理</span>
          <span v-if="scope.row.arbProcessExplain == 5">结案</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" :show-overflow-tooltip="true" label="更新时间">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <span class="revoke" @click="openDialog(scope.row)">异议申请</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog title="管辖权异议申请" :visible.sync="addDialogVisible" width="800px" :close-on-click-modal="false" @close='closeDialog'>
      <div v-loading="dialogLoading">
        <p style="font-size: 16px;font-weight: bold">案件编号：{{selectRow.code}}</p>
        <div style="display:flex;margin-top:20px;">
          <p style="font-size: 14px;width:50%">案由：{{selectRow.arbName}}</p>
          <p style="font-size: 14px;width:50%">申请人：{{selectRow.arbProsecutorName}}</p>
        </div>
        <div style="display:flex;margin-top:24px;margin-bottom:24px;">
          <p style="font-size: 14px;width:50%">被申请人：{{selectRow.arbDefendantName}}</p>
        </div>
        <div style="height:1px;background:#d9d9d9;"></div>
        <div style="display:flex;margin-top:24px;">
         <p style="font-size: 14px;width:50%">异议申请人对象：被申请人</p>
        </div>
        <div style="display:flex;margin-top:24px;margin-bottom:24px;line-height:40px;">
          <p style="font-size: 14px;">异议申请人姓名：
          </p>
          <el-checkbox-group v-model="checkedList">
              <el-checkbox v-for="item in applicantList" :label="item" :key="item.id">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div style="height:1px;background:#d9d9d9;"></div>
        <div v-loading="eviLoading">
        <div>
          <el-upload style="margin-top:24px;"
            class="g-uploader" multiple :headers="headers" :action="uploadUrl" :on-error="uploadError" :on-success="success(attachmentDatas)" :before-upload="fileFilter" :show-file-list="false">
            <el-button size="small" type="default" icon="el-icon-upload2">上传申请书</el-button>
          </el-upload>
        </div>
        <div class="attachmentDatas" style="margin-bottom:24px">
          <div class="attachmentDatas-item" v-for="(file, ind) in attachmentDatas" :key="ind" v-if="file.attachStatus!=2">
            <ul>
              <li>
                <span class="file-name">{{file.attachName}}</span>
                <span class="remove-file"><i @click="removeAttachmentDatas(attachmentDatas, ind)" class="el-icon-close"></i></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
        <div style="height:1px;background:#d9d9d9;"></div>
        <el-button @click="addEvidence" class="add-button margin-10" style="margin-top:24px;margin-bottom:24px;"> + 新增证据资料</el-button>
        <upload-evidence
          ref="evidenceForm"
          :headers="headers"
          :my-evidences="evidences"
          :uploadUrl="uploadUrl"
          :fullWidth="true"
          :addEvidence="true"
          :evidenceNameIndex="evidenceNameIndex"
          :selectRow="selectRow"
        ></upload-evidence>
        <div class="el-upload__tip">只能上传pdf和word,jpg,png格式文件，且不超过10M</div>
         <div style="height:1px;background:#d9d9d9;margin-top:24px;"></div>
        <div style="display:flex;margin-top:24px;margin-bottom:24px;">
         <p style="font-size: 14px;width:15%">事实和理由：</p>
         <el-input type="textarea" :autosize="{ minRows: 4}"  :maxLength="2000" v-model="remark"/>
        </div>
        <!--<p>{{evidences}}</p>-->
        <!-- <upload-evidence-list :evidencesList="evidencesList"></upload-evidence-list> -->
        <div slot="footer" class="dialog-footer" style="text-align: center;">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="save()">确 定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
  import DICT from '@/const/dict'
import util from '@/util/util'
import uploadEvidence from '@/views/common/uploadEvidence'
import uploadEvidenceList from '@/views/common/uploadEvidenceList'
export default {
  components: { listFilter, uploadEvidence, uploadEvidenceList },
  data() {
    return {
      remark:'',
      eviLoading:false,
      attachmentDatas:[],
      mime: [".jpeg", ".jpg", ".png", ".pdf", '.doc', '.docx', '.docm'],

      checkedList:[],
      applicantList:[],
      addDialogVisible: false,
      formInline: {
      },
      evidences: [],
      evidencesList: [],
      dialogLoading: false,
      selectRow: {},
      uploadUrl: api.uploadURL,
      tableData: [], //表格数据
      pageNo: 1,
      pageSize: 10, //每页多少条
      total: 0,
      loading: false, //
      arbTypes: DICT.arbTypes.map((v,i) => {
        let bool = i===0?true:false
        return {
          isActive: bool,
          value: v.arbStatus,
          label: v.label,
          content: v.content
        }
      }),
      arbStatus: '',
      evidenceNameIndex: 0
    }
  },
  methods: {

    removeAttachmentDatas(datas,ind){
      this.$confirm(`确定移除 ${datas[ind].attachName}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if(this.isMediation === true){
          datas[0].attachName = ''
          datas[0].attachUrlBase64 = ''
        }
        else{
          if(datas[ind].attachId){
            let item = datas[ind]
            item.attachStatus = 2
          }
          else{
            datas.splice(ind, 1)
          }
        }

      }).catch(() => {});
    },

    uploadError(res){
      this.eviLoading = false
      this.$store.dispatch('httpError', res)
    },

    success(datas){

      return (res, file) => {
        this.eviLoading = false
        console.log(datas)
        if (res.code == '1') {
          let f = {
            attachUrlBase64: res.data.filePath,
            attachName: file.name,
            attachType: 8,
            attachProperty: 7,
            attachStatus: 1
          }
          if(this.isMediation === true && datas.length > 0){
            datas.pop()
            datas.push(f)
          }
          else{
            datas.push(f)
          }
        } else {
          this.$message.error(res.msg)
        }
      }
  	},
    fileFilter(file) {
      if(this.isMediation && file.type !== 'application/pdf'){
        this.$message.error('仅支持pdf格式文件!');
        return false
      }
      let endName = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      const isMime = this.mime.some((value) => {
        return value == endName
      })
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isMime) {
        this.$message.error('仅支持pdf和word,jpg,png格式文件上传!');
        return false
      }
      if (!isLt2M) {
        this.$message.error('单个文件不可超过10 MB!');
        return false
      }
      this.eviLoading = true;
      return isMime && isLt2M;
    },
    closeDialog(){
      this.remark=''
      this.checkedList=[]
      this.attachmentDatas=[],
      this.applicantList=[],
      this.evidences=[],
      this.evidencesList= []
    },
    openDialog (row) {
      this.addDialogVisible = true
      this.selectRow = row
      this.dialogLoading = true
      this.evidences = [{attachmentDatas: [], evidenceNameIndex: '', evidenceName: ''}]
      api.getEvidenceSuppleInfoByArbId({}, {arbitralInfoId: row.id}).then(res => {
        this.dialogLoading = false
        if (res.data.code == '1') {
          const list = res.data.data
          // this.evidencesList = list.filter(val => val.evidenceProperty === 2)
          this.evidenceNameIndex = this.evidencesList.length + 1
          this.$nextTick(() => {
            this.$refs.evidenceForm.clearValidate()
          })
        }
      })
      api.getApplicantList({arbitralInfoId: row.id}).then(res => {
        this.dialogLoading = false
        if (res.data.code == '1') {
          this.applicantList = res.data.data
        }
      })
    },
    addEvidence(){
      this.$refs.evidenceForm.addList()
    },
    save () {
      if(!this.checkedList||this.checkedList.length==0){
        this.$message.warning('请选择异议申请人姓名')
        return
      }
      if(!this.attachmentDatas||this.attachmentDatas.length==0){
        this.$message.warning('请上传申请书')
        return
      }
      if(!this.remark||this.remark==''){
        this.$message.success('请填写事实和理由')
        return
      }
      this.$refs.evidenceForm.validateSubmit().then(() => {
        let params = {
          remark:this.remark,
          applyList:this.checkedList,
          arbitralInfoId: this.selectRow.id
        }
        params.mediationAttachDatas = [...this.evidences]
        this.evidences.map(val => {
          val.evidenceProperty=8
          val.attachmentDatas.map(val => {
            val.attachType=8
            val.attachProperty=8
          })

        })
        params.mediationAttachDatas.push({attachmentDatas:this.attachmentDatas,evidenceProperty:7,evidenceName:'管辖权异议申请书'})
        api.applyDecision(params).then(res => {
          if (res.data.code === '1') {
            this.addDialogVisible = false
            this.$message.success('操作成功')
            this.getDecisionList()
          }
        })
      })
    },
    tabFilter(val){
      this.arbTypes.forEach((item, i) => {
        if(item.value === val){
          item.isActive = true
        }
        else if(item.isActive === true){
          item.isActive = false
        }
      })
      this.arbStatus = val
      this.search()
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
      this.getDecisionList();
    },
    pageSizeChange(val) {
      this.pageSize = val;
      this.getDecisionList();
    },
    pageNoChange(val) {
      this.pageNo = val;
      this.getDecisionList();
    },
    getDecisionList(){
      var arbStatusList = this.arbStatus?this.arbStatus.split(','): []
      if(arbStatusList.length > 0){
        this.formInline.arbStatusBegin = arbStatusList[0]
        this.formInline.arbStatusEnd = arbStatusList[arbStatusList.length-1]
      }
      else{
        delete this.formInline.arbStatusBegin
        delete this.formInline.arbStatusEnd
      }
      let params = Object.assign({},this.formInline, {
        pageNo: this.pageNo,
        pageSize: this.pageSize
      })
      delete params.status
      this.loading = true
      api.getDecisionList(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let tableData = res.data.list
          tableData.forEach( v => {
            v.code = v.arbNumber || v.arbTemporaryNumber
            v.status = util.getStatus(v.arbStatus)

          })
          this.tableData = tableData
          this.total = res.data.total
        }
        else{
          this.tableData = []
          this.total = 0
        }
      })
    }
  },
  computed: {
    headers(){
      return {
        Authorization: this.$store.state.admin.adminAccessToken
      }
    }
  },
  created(){
    this.getDecisionList()
  }
}

</script>
<style lang="scss" scoped>
.revoke {
  color: #409EFF;
  cursor: pointer;
}
  .margin-10{
    margin: 10px 0;
  }
 .attachmentDatas{
    li{
      line-height: 28px;
      margin-top: 10px;
      position: relative;
      transition: all .3s cubic-bezier(.55,0,.1,1);
      .file-name{
        background: url(../../../../assets/attach_icon.png) no-repeat 5px 50%;
        padding-left: 25px;
        display: block;
        cursor: pointer;
        margin-right: 40px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .remove-file{
        position: absolute;
        right: 5px;
        top: 0;
        padding: 0 5px;
        cursor: pointer;
        display: none;
      }
      &:hover{
        background-color: #e8feff;
        .remove-file{
          display: block;
        }
      }
    }
  }
</style>
