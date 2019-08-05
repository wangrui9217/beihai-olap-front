<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div class="mt20" style="margin-top:20px">
      <span>用户名</span>
      <el-input class="formula-form" v-model.trim="searchForm.username" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <span>真实姓名</span>
      <el-input class="formula-form" v-model.trim="searchForm.realname" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <div class="mt20" style="margin-top:20px">
      <el-button type="primary" @click="openAddbox">+ 新增</el-button>
      <button class="g-on-btn" @click="on()" :disabled="!onActive">启用</button>
      <button class="g-off-btn" @click="off()" :disabled="!offActive">停用</button>
    </div>
    <el-table :data="tableData" ref="mytable" border class="g-table" @selection-change="handleSelectionChange" row-key="userId">
      <el-table-column type="selection" width="50" :selectable="getSelectable" :reserve-selection="true">
      </el-table-column>
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column prop="username" label="用户名/登录账号">
      </el-table-column>
      <el-table-column prop="realname" label="真实姓名">
      </el-table-column> 
      <el-table-column prop="sex" label="性别">
      </el-table-column>
      <el-table-column prop="address" label="所在地">
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span :class="{'g-unactive':scope.row.status==='停用'}">{{scope.row.status}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <div class="actions">
            <button @click="getSysUserInfo(scope.row)" >修改</button>
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form :model="dialogForm">
        <el-form-item label="姓名" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormRealname" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="登录名" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormUsername" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormMobile" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormPassword" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormEMail" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别" :label-width="formLabelWidth">
          <el-select v-model="dialogForm.dFormSex" placeholder="请选择">
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label=角色 :label-width="formLabelWidth">
          <el-checkbox-group v-model="dialogForm.dFormRolecheckList">
            <el-checkbox  v-for="item in roleList"
                :key="item.roleId"
                :value="item.roleId"
                :label="item.roleId">{{item.roleName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="常驻地" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormAddress" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="简介" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.dFormDescription" type="email" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSysUser">确 定</el-button>
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
      roleList: [], //角色信息列表
      tableData: [],
      title: "新增",
      arbFormulaInfo: null,
      sysUserInfo: null,
      //弹框表单
      dialogForm: {
        dFormSysUserId: "",
        dFormRealname: "",
        dFormUsername: "",
        dFormPassword: "",
        dFormMobile: "",
        dFormEMail: "",
        dFormSex: "",
        dFormAddress: "",
        dFormDescription: "",
        // dFormDiccheckList: [],
        dFormRolecheckList: []
      },
      searchForm: {
        username: "",
        realname: ""
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
  computed:{
    onActive (){
      return this.multipleSelection.some(item => {return item.status === '停用'})
    },
    offActive(){
      return this.multipleSelection.some(item => {return item.status === '启用'})
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    pageSizeChange(size) {
      this.pageSize = size;
      this.getUserList();
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo;
      this.getUserList();
    },
    on(){
      let params = {status: 1}
      let selected = this.multipleSelection.filter(item => {
        return item.status!=='启用'
      })
      if(selected.length == 0){
        this.$message.error('您选择的账号是已启用的，不需要再次启用')
        return false
      }
      params.userIds = selected.map(item => {
        return item.userId
      }).join(',')

      let msg = '确认启用已选的账号吗？'
      this.updateSysUserStatus(params, msg)
    },
    off(){
      let params = {status: 2}
      let selected = this.multipleSelection.filter(item => {
        return item.status!=='停用'
      })
      if(selected.length == 0){
        this.$message.error('您选择的账号是已停用的，不需要再次停用')
        return false
      }
      params.userIds = selected.map(item => {
        return item.userId
      }).join(',')
      let msg = '确认停用已选的账号吗？'
      this.updateSysUserStatus(params, msg)
    },
    updateSysUserStatus(params, msg){
      
      this.$confirm(msg,'提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        api.deleteAdminSysUser(params).then(res => {
          this.loading = false
          if(res.data.code === '1'){
            this.$refs.mytable.clearSelection()
            this.getUserList();
            this.$message.success(res.data.msg)
          }
          else{
            this.$message.error(res.data.msg)
          }
        })
      }).catch(() => {
                  
      });
    },
    saveSysUser() {
      var add = this.dialogForm.dFormSysUserId ? false : true;

      if (this.dialogForm.dFormRealname == "") {
        this.$message.warning("请输入姓名");
      } else if (this.dialogForm.dFormUsername == "") {
        this.$message.warning("请输入登录名");
      } else if (this.dialogForm.dFormPassword == "") {
        this.$message.warning("请输入密码");
      } else if (this.dialogForm.dFormMobile == "") {
        this.$message.warning("请输入手机号");
      } else if (this.dialogForm.dFormEMail == "") {
        this.$message.warning("请输入邮箱");
      } else if (this.dialogForm.dFormSex == "") {
        this.$message.warning("请选择性别");
      }else if (this.dialogForm.dFormAddress == "") {
        this.$message.warning("请输入常驻地址");
      } else if (add) {
        // var specialtyStr = this.dialogForm.dFormDiccheckList.join(",");
        let params = Object.assign({
          username: this.dialogForm.dFormUsername,
          realname: this.dialogForm.dFormRealname,
          email: this.dialogForm.dFormEMail,
          mobile: this.dialogForm.dFormMobile,
          password: this.dialogForm.dFormPassword,
          sex: this.dialogForm.dFormSex,
          address: this.dialogForm.dFormAddress,
          roleIdList: this.dialogForm.dFormRolecheckList,
          // specialtyList: this.dialogForm.dFormDiccheckList,
          description: this.dialogForm.dFormDescription,
          status: 1
        });
        api.saveAdminSysUser(params).then(res => {
          if (res.data.code === '1') {
            this.$message.success("保存成功！"), this.getUserList();
          } else {
            this.$message.error(res.data.msg);
          }
        });
        this.dialogFormVisible = false;
      } else {
        var sexValue = "";
        if (
          this.dialogForm.dFormSex === "男" ||
          this.dialogForm.dFormSex === "1"
        ) {
          sexValue = "1";
        } else {
          sexValue = "2";
        }
        let params = null;
        if (this.dialogForm.dFormPassword == "******") {
          params = Object.assign({
            username: this.dialogForm.dFormUsername,
            realname: this.dialogForm.dFormRealname,
            email: this.dialogForm.dFormEMail,
            mobile: this.dialogForm.dFormMobile,
            sex: sexValue,
            address: this.dialogForm.dFormAddress,
            roleIdList: this.dialogForm.dFormRolecheckList,
            // specialtyList: this.dialogForm.dFormDiccheckList,
            description: this.dialogForm.dFormDescription,
            userId: this.dialogForm.dFormSysUserId,
            status: 1
          });
        } else {
          params = Object.assign({
            username: this.dialogForm.dFormUsername,
            realname: this.dialogForm.dFormRealname,
            email: this.dialogForm.dFormEMail,
            password: this.dialogForm.dFormPassword,
            mobile: this.dialogForm.dFormMobile,
            sex: sexValue,
            address: this.dialogForm.dFormAddress,
            roleIdList: this.dialogForm.dFormRolecheckList,
            // specialtyList: this.dialogForm.dFormDiccheckList,
            description: this.dialogForm.dFormDescription,
            userId: this.dialogForm.dFormSysUserId,
            status: 1
          });
        }

        api.updateAdminSysUser(params).then(res => {
          if (res.data.code === '1') {
            this.$message.success("保存成功！"), this.getUserList();
          } else {
            this.$message.error(res.data.msg);
          }
        });
        this.dialogFormVisible = false;
      }
    },

    openAddbox() {
      if(this.roleList.length === 0){
        this.getRoleList()
      }
      this.dialogTitle = "新增管理员";
      this.dialogForm.dFormSysUserId = "";
      // this.dialogForm.dFormDiccheckList = [];
      this.dialogForm.dFormRolecheckList = [];
      this.dialogForm.dFormRealname = "";
      this.dialogForm.dFormUsername = "";
      this.dialogForm.dFormPassword = "";
      this.dialogForm.dFormEMail = "";
      this.dialogForm.dFormMobile = "";
      this.dialogForm.dFormDescription = "";
      this.dialogForm.dFormSex = "";
      this.dialogForm.dFormAddress = "";
      this.dialogFormVisible = true;
    },

    getSysUserInfo(row) {
      let url = "/api/sys/user/info/" + row.userId;
      api.getSysUserInfo(url).then(res => {
        if (res.data.code == '1') {
          this.sysUserInfo = res.data.data;
          this.openEditbox(this.sysUserInfo);
        } else {
        }
      });
    },

    openEditbox(userinfo) {
      if(this.roleList.length === 0){
        this.getRoleList()
      }
      this.dialogTitle = "修改管理员信息";
      this.dialogForm.dFormSysUserId = userinfo.userId;
      // this.dialogForm.dFormDiccheckList = userinfo.specialtyList;
      this.dialogForm.dFormRolecheckList = userinfo.roleIdList;
      this.dialogForm.dFormPassword = "******";
      this.dialogForm.dFormRealname = userinfo.realname;
      this.dialogForm.dFormUsername = userinfo.username;
      this.dialogForm.dFormMobile = userinfo.mobile;
      this.dialogForm.dFormEMail = userinfo.email;
      this.dialogForm.dFormDescription = userinfo.description;
      this.dialogForm.dFormSex = userinfo.sex == 1 ? "男" : "女";
      this.dialogForm.dFormAddress = userinfo.address;
      this.dialogFormVisible = true;
    },
    getUserList() {
      let url =
        "/api/sys/user/list?_search=false&limit=" +
        this.pageSize +
        "&page=" +
        this.pageNo +
        "&sidx=&order=asc&username=" +
        this.searchForm.username +
        "&realname=" +
        this.searchForm.realname;
      api.getAdministratorList(url).then(res => {
        if (res.data.code == '1') {
          let data = res.data.data.list;

          data.forEach(v => {
            v.sex = v.sex == 1 ? "男" : "女";
            v.status = v.status == 1 ? "启用" : "停用";
          });

          this.tableData = data;
          this.total = res.data.data.totalCount;
        } else {
          this.tableData = [];
          this.total = 0;
        }
      });
    },
    getRoleList() {
      let url = "/api/sys/role/select?";
      api.getRoleList(url).then(res => {
        if (res.data.code == '1') {
          this.roleList = res.data.data;
          this.roleList = this.roleList.filter(item => {
            return item.remark !== 'arbitrator'
          })
        } else {
        }
      });
    },
    searchFn() {
      this.pageNo = 1;
      this.getUserList();
    },
    getSelectable(row, index){
      return row.arbStatus === 1
    }
  },
  created() {
    this.getUserList()
    // this.getRoleList()
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
</style>
