<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div>
      <span>申请人：</span>
      <el-select clearable v-model="searchForm.pRealname" placeholder="请选择" class="value-select" @change="roleSelsctChange($event)">
        <el-option v-for="(item,index) in pRealnameList" :key="index" :label="item.pRealname? item.pRealname:item.coName" :value="item.pRealname? item.pRealname:item.coName">
        </el-option>
      </el-select>
      <span>产品编号：</span>
      <el-input class="formula-form" v-model.trim="searchForm.productNumber" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <span>产品类型名称：</span>
      <el-input class="formula-form" v-model.trim="searchForm.productName" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <el-table :data="tableData" border class="g-table">
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column prop="pRealname" label="申请人" width="180">
      </el-table-column>
      <el-table-column prop="productNumber" label="产品编号">
      </el-table-column>
      <el-table-column prop="productName" label="产品类型名称">
      </el-table-column>
      <el-table-column prop="secretaryRealname" label="办案秘书">
      </el-table-column>
      <!-- <el-table-column prop="arbArbitratorName" label="组庭方式">
      </el-table-column> -->
      <el-table-column prop="realname" label="仲裁员">
      </el-table-column>
      <el-table-column prop="templateName" label="裁决书模板">
      </el-table-column>
      <el-table-column prop="regularName" label="费用计算规则">
      </el-table-column>
      <el-table-column prop="procedureName" label="适用程序">
      </el-table-column>
      <el-table-column prop="defencesLimitDay" label="答辩时限">
      </el-table-column>
      <el-table-column prop="defencesRemindDay" label="答辩提醒">
      </el-table-column>
      <el-table-column prop="arbitralAwardLimitDay" label="裁决时限">
      </el-table-column>
      <el-table-column prop="arbitralAwardRemindDay" label="裁决提醒">
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="scope">
          <div class="actions">
            <button @click="openEditbox(scope.row)">配置案件参数</button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="prev, pager, next, jumper,total, sizes" :total="total">
    </el-pagination>
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="800px">
      <el-form :model="dialogForm" ref="dialogForm" :label-width="formLabelWidth">
        <h3 class="formhead">基础配置</h3>
        <el-row>
          <el-col :span="12">
            <el-form-item label="申请人：" >
              <span>{{dialogForm.pRealname}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案件编号：" >
              <span>{{dialogForm.productNumber}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品类型名称：" >
              <span>{{dialogForm.productName}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="办案秘书：" >
              <el-select clearable v-model="dialogForm.arbSecretaryId">
                <el-option v-for="item in secretaryList" :key="item.userId" :label="item.realname" :value="item.userId">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仲裁员：" >
              <el-select clearable v-model="dialogForm.arbArbitratorId" >
                <el-option v-for="item in sysUserList" :key="item.userId" :label="item.name" :value="item.userId" :disabled="item.disabled">
                  <span style="float: left;margin-right: 30px;">{{ item.realname }}</span>
                  <span>{{ item.job }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="裁决书模板：" >
              <el-select clearable v-model="dialogForm.ftlTemplateId">
                <el-option v-for="item in arbitralFtlTemplateList" :key="item.id" :label="item.templateName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="费用计算规则：" >
              <el-select clearable v-model="dialogForm.fundRegularId" >
                <el-option v-for="item in fundRegularList" :key="item.id" :label="item.regularName" :value="item.id" :disabled="item.disabled">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <h3 class="formhead">设置时限</h3>
        <el-row>
          <el-col :span="12">
            <el-form-item label="适用程序：" class="style-limit-height">
              <el-select clearable v-model="dialogForm.arbitralProcedureId" @change="getKinds" >
                <el-option v-for="item in procedures" :key="item.id" :label="item.procedureName" :value="item.id" :disabled="item.disabled">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仲裁庭组成：" >
              {{dialogForm.kinds}}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="答辩时限："  prop="defencesLimitDay" :rules="rules">
              <el-input v-model.number="dialogForm.defencesLimitDay" placeholder="请输入时限(天)" style="width: 218px;"></el-input>
            </el-form-item>
            <el-form-item label="" prop="defencesRemindDay" :rules="rules">
              <el-input v-model.number="dialogForm.defencesRemindDay" placeholder="请输入提醒天数" style="width: 218px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="裁决时限："  prop="arbitralAwardLimitDay" :rules="rules">
              <el-input v-model.number="dialogForm.arbitralAwardLimitDay" placeholder="请输入时限(天)" style="width: 218px;"></el-input>
            </el-form-item>
            <el-form-item label=""  prop="arbitralAwardRemindDay" :rules="rules">
              <el-input v-model.number="dialogForm.arbitralAwardRemindDay" placeholder="请输入提醒天数" style="width: 218px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateArbitralInitParameter">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from "@/api";
import util from "@/util/util";
export default {
  data() {
    return {
      pRealnameList: [], //申请人列表
      sysUserList: [], //仲裁员列表
      secretaryList: [], //办案秘书列表
      fundRegularList: [], //费用规则列表
      arbitralFtlTemplateList: [], //模板列表
      formLabelWidth: "120px",
      dialogTitle: "",
      dialogFormVisible: false, //dialog 是否显示
      loading: false,
      date: "",
      total: 0,
      pageSize: 10,
      pageNo: 1,
      tableData: [],
      title: "新增",
      //弹框表单
      dialogForm: {
        initParameterId: "", // 案件id
        arbitralProductId: "", //产品类型id
        arbArbitratorId: "", //仲裁员id
        arbSecretaryId: '', //案件秘书id
        ftlTemplateId: "", //裁决书模板id
        fundRegularId: "", //费用规则表id
        arbArbitratorType: '',  //仲裁类型：1-独任，2-合议
        pRealname: "",
        productNumber: "",
        productName: "",
        arbitralProcedureId: '',
        defencesLimitDay: '',
        defencesRemindDay: '',
        arbitralAwardLimitDay: '',
        arbitralAwardRemindDay: ''
      },
      searchForm: {
        pRealname: "",
        productNumber: "",
        productName: ""
      },
      multipleSelection: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        }
      },
      rules: { pattern: /^[1-9]\d*$/, message: '请输入正整数' },
      procedures: []
    };
  },
  methods: {
    getKinds(id){
      if(id){
        let obj = this.procedures.find(item => {return id === item.id})
        this.dialogForm.arbArbitratorType = obj.arbArbitratorType
        this.dialogForm.kinds = obj.arbArbitratorType==1?'独任':'合议'
      }
    },
    handleSelectionChange(val) {
      // console.log(val);
      let that = this;
      if (val.length == 0) {
        that.isHaveSelected = false;
      } else {
        that.isHaveSelected = true;
      }
      this.multipleSelection = val;
    },
    pageSizeChange(size) {
      this.pageSize = size;
      this.getArbitralInitParameterList();
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo;
      this.getArbitralInitParameterList();
    },
    openEditbox(row) {
      if (this.sysUserList.length === 0) {
        this.getSysUserList();
      }
      if (this.fundRegularList.length === 0) {
        this.getCalcRuleList();
      }
      if (this.arbitralFtlTemplateList.length === 0) {
        this.getArbitralFtlTemplateList();
      }
      if (this.secretaryList.length === 0) {
        this.getArbitralInitsecretaryList();
      }
      if(this.procedures.length === 0){
        this.getProcedures()
      }
      this.dialogForm.arbitralAwardLimitDay = row.arbitralAwardLimitDay
      this.dialogForm.arbitralAwardRemindDay = row.arbitralAwardRemindDay
      this.dialogForm.defencesLimitDay = row.defencesLimitDay
      this.dialogForm.defencesRemindDay = row.defencesRemindDay
      this.dialogForm.pRealname = row.pRealname;
      this.dialogForm.productNumber = row.productNumber;
      this.dialogForm.productName = row.productName;
      this.dialogForm.initParameterId = row.initparId;
      this.dialogForm.arbArbitratorId = row.arbArbitratorId;
      this.dialogForm.arbitralProcedureId = row.arbitralProcedureId
      this.dialogForm.arbArbitratorType = row.arbArbitratorType
      this.dialogForm.kinds = ''
      if(row.arbArbitratorType){
        this.dialogForm.kinds = row.arbArbitratorType===1?'独任':'合议'
      }
      if (Number.isNaN(Number.parseInt(row.arbSecretaryId)) === false) {
        this.dialogForm.arbSecretaryId = Number.parseInt(row.arbSecretaryId)
      } else {
        this.dialogForm.arbSecretaryId = ''
      }
      this.dialogForm.ftlTemplateId = row.ftlTemplateId;
      this.dialogForm.fundRegularId = row.fundRegularId;

      this.dialogTitle = "配置案件参数";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs.dialogForm.clearValidate()
      })

    },

    getArbitralInitParameterList() {
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        pRealname: this.searchForm.pRealname,
        productNumber: this.searchForm.productNumber,
        productName: this.searchForm.productName
      });
      api.getArbitralInitParameterList(params).then(res => {
        if (res.data.code === "1") {
          let data = res.data.list;
          data.forEach(v => {
            v.pRealname = v.pRealname ? v.pRealname : v.coName;
          });
          this.tableData = data;
          this.total = res.data.total;
        } else {
          this.tableData = [];
          this.total = 0;
        }
      });
    },

    // 获取仲裁员列表
    getSysUserList() {
      let params = Object.assign({
        pageNo: 1,
        pageSize: 100
      });
      api.getSysUserList(params).then(res => {
        let data = res.data.list;
        data.forEach(v => {
          v.job = v.job ? v.job.replace(/,/g, '/') : ''
          v.name = v.realname + '  ' + v.job
          if (v.status == 2) {
            v.disabled = true;
          }
        });

        this.sysUserList = data;
      });
    },
    // 查询所有仲裁程序
    getProcedures(){
      api.getProcedures({}).then(res => {
        if(res.data.code === '1'){
          this.procedures = res.data.list
        }
        else{
          this.procedures = []
        }
      })
    },
    // 获取申请人
    queryUserCoInfo() {
      // let params = Object.assign({
      //   pageNo: 1,
      //   pageSize: 100
      // });
      api.queryUserCoInfo({}).then(res => {
        this.pRealnameList = res.data.data.list;
      });
    },
    // 费用计算规则列表
    getCalcRuleList() {
      let params = Object.assign({
        pageNo: 1,
        pageSize: 100
      });
      api.getCalcRuleList(params).then(res => {
        let data = res.data.list;
        data.forEach(v => {
          if (v.status == 2) {
            v.disabled = true;
          }
        });

        this.fundRegularList = data.filter(item => { return item.status != 2 });
      });
    },

    // 办案模板列表
    getArbitralFtlTemplateList() {
      api.getArbitralFtlTemplateList().then(res => {
        this.arbitralFtlTemplateList = res.data.data;
      });
    },

    // 查询办案秘书
    getArbitralInitsecretaryList() {
      api.getArbitralInitsecretaryList().then(res => {
        this.secretaryList = res.data.data;
      });
    },

    updateArbitralInitParameter() {
      if (!this.dialogForm.arbSecretaryId) {
        this.$message.error("请选择办案秘书！");
      } else if (!this.dialogForm.arbArbitratorId) {
        this.$message.error("请选择办案仲裁员！");
      } else if (!this.dialogForm.ftlTemplateId) {
        this.$message.error("请选择裁决书模板！");
      } else if (!this.dialogForm.fundRegularId) {
        this.$message.error("请选择费用计算规则！");
      } else if (!this.dialogForm.arbitralProcedureId) {
        this.$message.error("请选择适用程序！");
      } else if (!this.dialogForm.defencesLimitDay) {
        this.$message.error("请输入答辩时限！");
      } else if (!this.dialogForm.defencesRemindDay) {
        this.$message.error("请输入答辩提醒时间！");
      } else if (!this.dialogForm.arbitralAwardLimitDay) {
        this.$message.error("请输入裁决时限！");
      } else if (!this.dialogForm.arbitralAwardRemindDay) {
        this.$message.error("请输入裁决提醒时间！");
      } else if (this.dialogForm.arbitralAwardLimitDay < this.dialogForm.arbitralAwardRemindDay || this.dialogForm.defencesLimitDay < this.dialogForm.defencesRemindDay) {
        this.$message.error('时限天数不能小于提醒天数！')
      } else {
        this.$refs.dialogForm.validate((valid) => {
          if (valid) {
            let params = {
              initParameterId: this.dialogForm.initParameterId,
              arbArbitratorId: this.dialogForm.arbArbitratorId,
              arbSecretaryId: this.dialogForm.arbSecretaryId,
              ftlTemplateId: this.dialogForm.ftlTemplateId,
              fundRegularId: this.dialogForm.fundRegularId,
              arbitralAwardLimitDay: this.dialogForm.arbitralAwardLimitDay,
              arbitralAwardRemindDay: this.dialogForm.arbitralAwardRemindDay,
              defencesLimitDay: this.dialogForm.defencesLimitDay,
              defencesRemindDay: this.dialogForm.defencesRemindDay,
              arbitralProcedureId: this.dialogForm.arbitralProcedureId,
              arbArbitratorType: this.dialogForm.arbArbitratorType
            }
            this.loading = true
            api.updateArbitralInitParameter(params).then(res => {
              this.loading = false
              if (res.data.code === "1") {
                this.$message.success("保存成功！"),
                  (this.dialogFormVisible = false);
                this.getArbitralInitParameterList();
              } else {
                this.$message.error(res.data.msg);
              }
            });
          }
        })
      }
    },
    searchFn() {
      this.pageNo = 1;
      this.getArbitralInitParameterList();
    },
    roleSelsctChange(){
      this.searchFn()
    }
  },
  created() {
    this.getArbitralInitParameterList();
    // this.getSysUserList();
    // this.getCalcRuleList();
    // this.getArbitralFtlTemplateList();
    // this.getArbitralInitsecretaryList();
    this.queryUserCoInfo();
  },
  mounted() {}
};

</script>
<style lang="scss" scoped>
.formula-form {
  width: 200px;
  margin-right: 20px;
}
.formhead{
  font-size: 1.17em;
  margin-bottom: 15px;
}
.actions {
  color: #0000ff;

  button {
    color: #0000ff;
    border: none;
    background: none;
    cursor: pointer;
    outline: none;

    &[disabled] {
      cursor: no-drop;
      color: #999;
    }
  }
}
.style-limit-height{
  height: 40px;
  overflow: hidden;
}
</style>
