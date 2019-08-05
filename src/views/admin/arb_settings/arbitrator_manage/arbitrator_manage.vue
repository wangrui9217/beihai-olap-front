<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div>
      <span>姓名：</span>
      <el-input class="formula-form" v-model.trim="filter.realname" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <span>专业：</span>
      <el-input class="formula-form" v-model.trim="filter.specialty" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <span>职称：</span>
      <el-input class="formula-form" v-model.trim="filter.job" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <div class="mt20" style="margin-top:20px">
      <el-button type="primary" icon="el-icon-plus" @click="openAddbox">新增</el-button>
      <button class="g-on-btn" @click="updateSysUserStatus(1)" :disabled="!onActive">启用</button>
      <button class="g-off-btn" @click="updateSysUserStatus(2)" :disabled="!offActive">停用</button>
    </div>
    <p style="position: relative;top:10px;font-size: 12px;text-align: right">*tips：已启用的无法修改，其中已经在审理案件的，无法停用</p>
    <el-table :data="tableData" border class="g-table"
     @selection-change="handleSelectionChange" row-key="userId" ref="mytable">
      <el-table-column type="selection" width="50" :selectable="getSelectable" :reserve-selection="true">
      </el-table-column>
      <el-table-column prop="realname" label="姓名">
      </el-table-column>
      <el-table-column prop="sex" label="性别">
      </el-table-column>
      <el-table-column prop="specialty" label="专业">
      </el-table-column> 
      <el-table-column prop="job" label="职业/职称">
      </el-table-column>
      <el-table-column prop="address" label="常住地">
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span :class="{'g-unactive':scope.row.status==='停用'}">{{scope.row.status}}</span>
        </template>
      </el-table-column>
       <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <div class="actions">
            <button @click="openEditbox(scope.row)" v-if="scope.row.status==='停用'">修改</button>
            <button @click="read(scope.row)" v-else>查看</button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination 
    style="float:middle"
    @size-change="pageSizeChange" 
    @current-change="pageNoChange" 
    :current-page="pageNo" 
    :page-sizes="[10, 20, 30, 40]" 
    :page-size="10" 
    layout="prev, pager, next, jumper,total, sizes" 
    :total="total">
    </el-pagination>
    <el-dialog :title="this.dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form :model="dialogForm">
        <el-form-item label="姓名" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别" :label-width="formLabelWidth">
          <el-select v-model="dialogForm.dFormSex" placeholder="请选择">
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormPhone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="专业" :label-width="formLabelWidth">
          <el-checkbox-group v-model="dialogForm.dFormDiccheckList">
            <el-checkbox  v-for="item in sysDictList"
                :key="item.id"
                :value="item.id"
                :label="item.id">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="职业/职称" :label-width="formLabelWidth">
          <el-checkbox-group v-model="dialogForm.dFormJobcheckList">
            <el-checkbox  v-for="item in sysJobList"
                :key="item.id"
                :value="item.id"
                :label="item.id">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="常驻地" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormAddress" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormAgentZipcode" type="email" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSysUser">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="查看仲裁员" :visible.sync="readVisible" width="500px">
      <div class="read">
        <p><span>姓名：</span>{{arbitratorInfo.realname}}</p>
        <p><span>性别：</span>{{arbitratorInfo.sex}}</p>
        <p><span>专业：</span>{{arbitratorInfo.specialty}}</p>
        <p><span>职业/职称：</span>{{arbitratorInfo.job}}</p>
        <p><span>常住地：</span>{{arbitratorInfo.address}}</p>
        <p><span>状态：</span>{{arbitratorInfo.status}}</p>
        <p><span>邮箱：</span>{{arbitratorInfo.agentZipcode}}</p>
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
      formLabelWidth: "120px",
      dialogTitle: "",
      dialogFormVisible: false, //dialog 是否显示
      loading: false,
      date: "",
      total: 0,
      pageSize: 10,
      pageNo: 1,
      sysDictList: [], //专业信息列表
      sysJobList: [], //职业、职称列表
      tableData: [],
      title: "新增",
      arbFormulaInfo: null,
      //弹框表单
      dialogForm: {
        dFormSysUserId: "",
        dFormName: "",
        dFormPhone: "",
        dFormSex: "",
        dFormAddress: "",
        dFormAgentZipcode: "",
        dFormDiccheckList: [],
        dFormJobcheckList: []
      },
      arbitratorInfo: {},
      readVisible: false,
      filter: {
        realname: "",
        specialty: "",
        job: ""
      },
      multipleSelection: [],
      selectDicValue: "",
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        }
      }
    };
  },
  computed: {
    onActive() {
      return this.multipleSelection.some(item => {
        return item.status === "停用";
      });
    },
    offActive() {
      return this.multipleSelection.some(item => {
        return item.status === "启用";
      });
    }
  },
  methods: {
    handleSelectionChange(rows) {
      this.multipleSelection = rows;
    },
    pageSizeChange(size) {
      this.pageSize = size;
      this.getSysUserList();
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo;
      this.getSysUserList();
    },
    getSysDictList(type) {
      api.getSysDictList(type).then(res => {
        if(res.data.code === '1'){
          if (type === 1) {
            this.sysDictList = res.data.data;
          } else {
            this.sysJobList = res.data.data;
          }
        }
        else{
          this.$message.error(res.data.msg)
        }
      });
    },
    updateSysUserStatus(type) {
      let params = [];
      params = this.multipleSelection.map(item => {
        return {
          id: item.userId,
          status: type
        };
      });
      let msg =
        type == 1 ? "确认启用已选的仲裁员吗？" : "确认停用已选的仲裁员吗？";

      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          api.updateSysUserStatus({ configStatusList: params }).then(res => {
            if (res.data.code === "1") {
              if (type == 1) {
                this.$message.success("启用成功！");
              } else {
                this.$message.success("停用成功！");
              }
              this.$refs.mytable.clearSelection()
              this.getSysUserList();
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },

    saveSysUser() {
      var add = this.dialogForm.dFormSysUserId ? false : true;

      if (this.dialogForm.dFormName == "") {
        this.$message.warning("请输入姓名");
      } else if (this.dialogForm.dFormSex == "") {
        this.$message.warning("请选择性别");
      } else if (this.dialogForm.dFormPhone == "") {
        this.$message.warning("请输入手机号");
      } else if (this.dialogForm.dFormDiccheckList.length == 0) {
        this.$message.warning("请选择专业");
      } else if (this.dialogForm.dFormJobcheckList.length == 0) {
        this.$message.warning("请选择职业/职称");
      } else if (this.dialogForm.dFormAddress == "") {
        this.$message.warning("请输入常驻地址");
      } else if (this.dialogForm.dFormAgentZipcode == "") {
        this.$message.warning("请输入邮箱地址");
      } else if (
        /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(
          this.dialogForm.dFormAgentZipcode
        ) === false
      ) {
        this.$message.warning("请输入有效的邮箱地址");
      } else if (add) {
        var specialtyStr = this.dialogForm.dFormDiccheckList.join(",");
        var jobStr = this.dialogForm.dFormJobcheckList.join(",");
        let params = Object.assign({
          realname: this.dialogForm.dFormName,
          sex: this.dialogForm.dFormSex,
          mobile: this.dialogForm.dFormPhone,
          address: this.dialogForm.dFormAddress,
          specialty: specialtyStr,
          job: jobStr,
          agentZipcode: this.dialogForm.dFormAgentZipcode
        });
        this.loading = true;
        api.saveArbSysUser(params).then(res => {
          this.loading = false;
          if (res.data.code === "1") {
            this.$message.success("保存成功！");
            this.getSysUserList();
          } else {
            this.$message.error(res.data.msg);
          }
        });
        this.dialogFormVisible = false;
      } else {
        var specialtyStr = this.dialogForm.dFormDiccheckList.join(",");
        var jobStr = this.dialogForm.dFormJobcheckList.join(",");
        var sexValue = "";
        if (
          this.dialogForm.dFormSex === "男" ||
          this.dialogForm.dFormSex === "1"
        ) {
          sexValue = "1";
        } else {
          sexValue = "2";
        }
        let params = Object.assign({
          userId: this.dialogForm.dFormSysUserId,
          realname: this.dialogForm.dFormName,
          sex: sexValue,
          mobile: this.dialogForm.dFormPhone,
          address: this.dialogForm.dFormAddress,
          specialty: specialtyStr,
          job: jobStr,
          agentZipcode: this.dialogForm.agentZipcode
        });
        this.loading = true;
        api.updateSysUser(params).then(res => {
          this.loading = false;
          if (res.data.code === "1") {
            this.$message.success("保存成功！"), this.getSysUserList();
          } else {
            this.$message.error(res.data.msg);
          }
        });
        this.dialogFormVisible = false;
      }
    },

    openAddbox() {
      if(this.sysDictList.length === 0){
        this.getSysDictList(1)
      } 
      if(this.sysJobList.length === 0){
          this.getSysDictList(2)
      }
      this.dialogTitle = "新增仲裁员";
      this.dialogForm.dFormSysUserId = "";
      this.dialogForm.dFormDiccheckList = [];
      this.dialogForm.dFormJobcheckList = [];
      this.dialogForm.dFormName = "";
      this.dialogForm.dFormSex = "";
      this.dialogForm.dFormPhone = "";
      this.dialogForm.dFormAddress = "";
      this.dialogForm.dFormAgentZipcode = ''
      this.dialogFormVisible = true;
    },
    openEditbox(row) {
      if(this.sysDictList.length === 0){
        this.getSysDictList(1)
      } 
      if(this.sysJobList.length === 0){
          this.getSysDictList(2)
      }
      this.arbFormulaInfo = row;
      this.dialogTitle = "修改仲裁员信息";
      this.dialogForm.dFormSysUserId = row.userId;
      this.dialogForm.dFormPhone = row.mobile;
      this.dialogForm.dFormAgentZipcode = row.agentZipcode;
      this.dialogForm.dFormDiccheckList = this.arbFormulaInfo.specialtyList
        ? this.arbFormulaInfo.specialtyList.split(",")
        : [];
      this.dialogForm.dFormJobcheckList = this.arbFormulaInfo.jobList
        ? this.arbFormulaInfo.jobList.split(",")
        : [];
      this.dialogForm.dFormName = this.arbFormulaInfo.realname;
      this.dialogForm.dFormSex = this.arbFormulaInfo.sex;
      this.dialogForm.dFormAddress = this.arbFormulaInfo.address;
      this.dialogFormVisible = true;
    },
    read(row){
      this.arbitratorInfo = row
      this.readVisible = true
    },
    getSysUserList() {
      let params = Object.assign({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        realname: this.filter.realname,
        jobName: this.filter.job,
        specialtyName: this.filter.specialty
      });
      api.getSysUserList(params).then(res => {
        if (res.data.code === "1") {
          let data = res.data.list;
          data.forEach(v => {
            v.status = v.status == 1 ? "启用" : "停用";
            v.sex = v.sex == 1 ? "男" : "女";
          });
          this.tableData = data;
          this.total = res.data.total;
        } else {
          this.tableData = [];
          this.total = 0;
        }
      });
    },
    searchFn() {
      this.pageNo = 1;
      this.getSysUserList();
    },
    getSelectable(row, index) {
      return row.arbStatus === 1;
    }
  },
  created() {
    this.getSysUserList();
    // this.getSysDictList(1);
    // this.getSysDictList(2);
  },
  mounted() {}
};
</script>
<style lang="scss" scoped>
.formula-form {
  width: 200px;
  margin-right: 20px;
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
.read{
  p{
    margin-bottom: 10px;
    color: #666;
  }
  span{
    display: inline-block;
    width: 100px;
    color: #000;
  }
}
</style>
