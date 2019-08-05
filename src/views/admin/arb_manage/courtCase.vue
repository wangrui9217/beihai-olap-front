<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <list-filter :filter-data="formInline" :searchFn="search"></list-filter>
    <el-button type="primary" @click="handelOpen">合并开庭</el-button>
    <el-row class="mt20">
      <el-col>
        <el-table :data="tableData" ref="table" border style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" label="序号">
          </el-table-column>
          <el-table-column label="案件编号" :show-overflow-tooltip="true" width="180">
            <template slot-scope="scope">
              <span class="revoke" @click="into(scope.row)">{{scope.row.arbNumber}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="arbName" :show-overflow-tooltip="true" label="案由">
          </el-table-column>
          <el-table-column prop="prosecutorName" :show-overflow-tooltip="true" label="申请人">
          </el-table-column>
          <el-table-column prop="defendantName" :show-overflow-tooltip="true" label="被申请人">
          </el-table-column>
          <el-table-column prop="arbProductName" :show-overflow-tooltip="true" label="产品类型">
          </el-table-column>
          <el-table-column prop="arbitratorName" :show-overflow-tooltip="true" label="仲裁员">
          </el-table-column>
          <el-table-column prop="location" :show-overflow-tooltip="true" label="庭审地点">
          </el-table-column>
          <el-table-column prop="beginTime" :show-overflow-tooltip="true" label="庭审时间">
          </el-table-column>
        </el-table>
        <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
        <el-dialog  title="合并开庭"  :visible.sync="dialogVisible"  width="600px"  class="dislog">
          <p class="title-tip">本次所选案件有 {{arbitralOpenCourtList.arbitralInfoId.length}} 个</p>
          <p class="title-tip">
            <label>案件编号:</label>
            <span>{{arbitralOpenCourtList.arbNumber.join()}}</span>
          </p>
          <p class="title-tip">
            <label>申请人:</label>
            <span>{{arbitralOpenCourtList.prosecutor.join()}}</span>
          </p>
          <p class="title-tip">
            <label>案由:</label>
            <span>{{arbitralOpenCourtList.arbName}}</span>
          </p>
          <p class="title-tip">
            <label>产品类型:</label>
            <span>{{arbitralOpenCourtList.productName}}</span>
          </p>
          <el-form :model="ruleForm" status-icon ref="ruleForm" label-width="150px" class="demo-ruleForm">
            <el-form-item label="仲裁庭组成:">
              <el-select v-model="ruleForm.trialComposition" placeholder="请选择庭审地点">
                <el-option  v-for="(item,index) in option" :key="index" :label="item.label" :value="item.value" ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="庭审程序:" prop="arbProcedure" :rules="rules.requireSelect">
              <el-select v-model="ruleForm.arbProcedure" placeholder="请选择庭审程序" >
                <el-option  v-for="(item,index) in option4" :key="index" :label="item" :value="item" ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="首席仲裁员:" prop="arbitratorName" :rules="rules.requireSelect">
              <el-select v-model="ruleForm.arbitratorName" placeholder="请选择首席仲裁员">
                <el-option  v-for="(item,index) in option1" :key="index" :label="item.arbArbitratorName" :value="item.arbArbitratorId" ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="申请人仲裁员:" prop="prosecutorArbitratorName" v-if="ruleForm.trialComposition === '2'">
              <el-select v-model="ruleForm.prosecutorArbitratorName" placeholder="请选择申请人仲裁员">
                <el-option  v-for="(item,index) in option2" :key="index" :label="item.arbArbitratorName" :value="item.arbArbitratorId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="被申请人仲裁员:" prop="defendantArbitratorName" v-if="ruleForm.trialComposition === '2'">
              <el-select v-model="ruleForm.defendantArbitratorName" placeholder="请选择被申请人仲裁员">
                <el-option  v-for="(item,index) in option3" :key="index" :label="item.arbArbitratorName" :value="item.arbArbitratorId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="庭审地点:" prop="location" :rules="rules.requireSelect">
              <el-select v-model="ruleForm.location" placeholder="请选择庭审地点">
                <el-option  v-for="(item,index) in arbitralOpenCourtList.location" :key="index" :label="item" :value="item" ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="办案秘书:" :rules="rules.requireSelect" prop="arbSecretaryId">
              <el-select v-model="ruleForm.arbSecretaryId" placeholder="请选择办案秘书">
                <el-option  v-for="(item,index) in arbitralOpenCourtList.secretaryName" :key="index" :label="item.arbSecretaryName" :value="item.arbSecretaryId" ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="庭审时间:">
              <el-date-picker
                v-model="ruleForm.date"
                type="date"
                :picker-options="dateOptions"
                value-format="yyyy-MM-dd"
                :editable="false"
                style="width: 150px"
                placeholder="选择日期">
              </el-date-picker>
              <el-time-select
                v-model="ruleForm.startTime"
                style="width: 150px"
                :picker-options="{
              start: '08:00',
              step: '00:15',
              end: '20:00',
              maxTime: ruleForm.endTime
            }"
                placeholder="起始时间">
              </el-time-select>
              <el-time-select
                v-model="ruleForm.endTime"
                style="width: 150px"
                :picker-options="{
              start: '08:00',
              step: '00:15',
              end: '20:00',
              minTime: ruleForm.startTime
            }"
                placeholder="结束时间">
              </el-time-select>
            </el-form-item>
          </el-form>
          <div class="fr">
            <el-button @click="dialogVisible = false"  >取 消</el-button>
            <el-button type="primary" @click="submitAdd" :loading="isLoaing">确 定</el-button>
          </div>
        </el-dialog>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
import util from '@/util/util'
import DownloadFile from '@/util/downloadFile'
import uploadEvidence from '@/views/common/uploadEvidence'
import rules from '@/util/rules'
export default {
  components: { listFilter, uploadEvidence},
  data() {
    return {
      rules,
      uploadUrl: api.uploadURL,
      formInline: {},
      tableData: [], //表格数据
      pageNo: 1,
      pageSize: 10, //每页多少条
      total: 0,
      loading: false, //
      dialogVisible: false,
      mediationAttachDatas: [],
      mediationRecord: [],
      mediationDocumentData: [],
      arbitralInfo: null,
      ruleForm: {
        arbSecretaryId: '',
        arbitralInfoIds: [],
        prosecutorNames: [],
        location: '',
        time: '',
        defendantArbitratorName: '',
        prosecutorArbitratorName: '',
        arbitratorName: '',
        trialComposition: '1',
        startTime: '',
        endTime: '',
        date: '',
        arbProcedure: ''
      },
      option: [{label: '独任', value: '1'}, {label: '合议', value: '2'}],
      isLoaing: false,
      selectedRow: [],
      arbitralOpenCourtList: {
        arbNumber: [],
        location: [],
        prosecutorArbitrator: [],
        defendantArbitrator: [],
        arbitrator: [],
        prosecutor: [],
        arbitralInfoId: [],
        secretaryName: [],
        soleJudgeProcedure: [],
        fullJudgeProcedure: []
      },
      arbitrator: [],
      option1: [],
      option2: [],
      option3: [],
      dateOptions: {
        disabledDate(date){
          return date.getTime() < Date.now();
        }
      },
    }
  },
  computed: {
   headers(){
     return {
       Authorization: this.$store.state.admin.adminAccessToken
     }
   },
    option4() {
      if (this.ruleForm.trialComposition === '2') {
       return this.arbitralOpenCourtList.fullJudgeProcedure
     } else if (this.ruleForm.trialComposition === '1') {
       return this.arbitralOpenCourtList.soleJudgeProcedure
     } else {
       return []
     }
    }
  },
  watch: {
    'ruleForm.arbitratorName' () {
      this.option2 = this.arbitrator.filter(val => val.arbArbitratorId !== this.ruleForm.arbitratorName && val.arbArbitratorId !== this.ruleForm.defendantArbitratorName)
      this.option3 = this.arbitrator.filter(val => val.arbArbitratorId !== this.ruleForm.arbitratorName && val.arbArbitratorId !== this.ruleForm.prosecutorArbitratorName)
    },
    'ruleForm.prosecutorArbitratorName' () {
      this.option1 = this.arbitrator.filter(val => val.arbArbitratorId !== this.ruleForm.prosecutorArbitratorName && val.arbArbitratorId !== this.ruleForm.defendantArbitratorName)
      this.option3 = this.arbitrator.filter(val => val.arbArbitratorId !== this.ruleForm.arbitratorName && val.arbArbitratorId !== this.ruleForm.prosecutorArbitratorName)
    },
    'ruleForm.defendantArbitratorName' () {
      this.option1 = this.arbitrator.filter(val => val.arbArbitratorId !== this.ruleForm.prosecutorArbitratorName && val.arbArbitratorId !== this.ruleForm.defendantArbitratorName)
      this.option2 = this.arbitrator.filter(val => val.arbArbitratorId !== this.ruleForm.arbitratorName && val.arbArbitratorId !== this.ruleForm.defendantArbitratorName)
    },
    'ruleForm.trialComposition' () {
      this.ruleForm.arbitratorName = ''
      this.ruleForm.prosecutorArbitratorName = ''
      this.ruleForm.defendantArbitratorName = ''
    }
  },
  methods: {
    handelOpen () {
      const arbitralInfoIds = this.selectedRow.map(val => val.arbitralInfoId)
      api.getTribunalToMergeInfo({arbitralInfoIds}).then(res => {
        if (res.data.code === '1') {
          this.arbitralOpenCourtList = {...this.arbitralOpenCourtList, ...res.data.data}
          this.arbitrator = res.data.data.arbitrator
          this.option1 = this.arbitrator
          this.option2 = this.arbitrator
          this.option3 = this.arbitrator
          this.dialogVisible = true
          this.$nextTick(() => {
            this.$refs.ruleForm.clearValidate()
          })
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    handleSelectionChange (rows) {
      this.selectedRow = rows
    },
    submitAdd () {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          console.log(this.ruleForm)
          let data = {...this.ruleForm}
          data.arbitralInfoIds = this.arbitralOpenCourtList.arbitralInfoId
          data.prosecutorNames = this.arbitralOpenCourtList.prosecutor
          data.beginTime = this.ruleForm.date + ' ' + this.ruleForm.startTime + ':00'
          data.endTime = this.ruleForm.date + ' ' + this.ruleForm.endTime + ':00'
          data.arbName = this.arbitralOpenCourtList.arbName
          data.arbProductName = this.arbitralOpenCourtList.productName
          data.arbitratorName = (this.arbitrator.find(val => val.arbArbitratorId === this.ruleForm.arbitratorName) || {}).arbArbitratorName
          data.prosecutorArbitratorName = (this.arbitrator.find(val => val.arbArbitratorId === this.ruleForm.prosecutorArbitratorName) || {}).arbArbitratorName
          data.defendantArbitratorName = (this.arbitrator.find(val => val.arbArbitratorId === this.ruleForm.defendantArbitratorName) || {}).arbArbitratorName

          console.log(data)
          api.mergeOpenCourt(data).then(res => {
            if (res.data.code === '1') {
              this.getList()
              this.dialogVisible = false
              this.$message.success(res.data.msg)
            } else {
              this.$message.error(res.data.msg)
            }
          })
        }
      })
    },
    openReview(row){
    },
    query(row){
    },
    save(){
    },
    httpSave(type){
    },
    into(row) {
      let routeData = this.$router.resolve({
        name: "仲裁请求详情",
        query: {
          data: row.arbitralInfoId
        }
      });
      window.open(routeData.href, '_blank');
    },
    search() { //表单查询（搜索案件编号、案件名、申请人、被申请人。搜索字符长度不超过20个）
      this.pageNo = 1
      this.getList();
    },
    pageSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    pageNoChange(val) {
      this.pageNo = val;
      this.getList();
    },
    getList(){
      let params = Object.assign({},this.formInline, {
        pageNo: this.pageNo,
        pageSize: this.pageSize
      })
      this.loading = true
      api.getArbitralOpenCourtList(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          this.tableData = res.data.data
          this.total = res.data.total
        } else {
          this.tableData = []
          this.total = 0
        }
      })
    },
    download(row){
    },
    submit() {
    },
  },
  created(){
    this.getList()
  }
}

</script>
<style lang="scss" scoped>
.revoke {
  color: #409EFF;
  cursor: pointer;
}
.css-upload-box{
  margin-top: -30px;
}
.css-save{
  background: rgba(168, 221, 241, 1);
  color: #fff;
}
  .fr{
    text-align: right;
  }
  .title-tip{
    /*margin-bottom: 22px;*/
    line-height: 40px;
    display: flex;
    label{
      width: 150px;
      padding-right: 12px;
      text-align: right;
      box-sizing: border-box;
    }
    span{
      flex: 1;
      flex-wrap: wrap;
    }
  }
</style>
