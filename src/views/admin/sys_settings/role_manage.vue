<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div>
      <span>角色名称：</span>
      <el-input class="formula-form" v-model.trim="searchForm.roleName" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <div class="mt20" style="margin-top:20px">
      <el-button type="primary" icon="el-icon-plus" @click="openAddbox">新增</el-button>
      <el-button type="danger" icon="el-icon-delete" @click="deleteRole" :disabled="!this.isHaveSelected">删除</el-button>
    </div>
    <el-table :data="tableData" ref="table" border class="g-table" @selection-change="handleSelectionChange" row-key="roleId">
      <el-table-column type="selection" width="50" :reserve-selection="true">
      </el-table-column>
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column prop="roleId" label="角色id">
      </el-table-column>
      <el-table-column prop="roleName" label="角色名称">
      </el-table-column>
      <el-table-column prop="remark" label="备注">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
      </el-table-column> 
       <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <div class="actions">
            <button @click="openEditbox(scope.row)" :disabled="scope.row.status==='启用'">修改</button>
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
    <el-dialog :title="this.dialogTitle" :visible.sync="dialogFormVisible" @close="dialogClose">
      <el-form :model="dialogForm">
        <el-form-item label="角色名称" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.roleName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" :label-width="formLabelWidth">
          <el-input v-model="dialogForm.remark" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="授权" :label-width="formLabelWidth">
          <el-tree 
          :data="menuList"
          :props="menuTreeProps"
          :checkedKeys="selectedKeys"
          :default-checked-keys="selectedKeys"
          :default-expanded-keys="selectedKeys"
          v-model="selectedKeys"
          node-key="menuId"
          show-checkbox
          ref="tree"
         ></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from "@/api";
import util from "@/util/util";
import arrayToTree from "array-to-tree";

export default {
  data() {
    return {
      menuTreeProps: {
        label: "name"
      },
      selectedKeys: [],
      menuList: [],
      isHaveSelected: false,
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
      arbFormulaInfo: null,
      //弹框表单
      dialogForm: {
        roleName: "",
        roleId: "",
        remark: ""
      },
      searchForm: {
        roleName: ""
      },
      multipleSelection: []
    };
  },
  methods: {
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
      this.getRoleList();
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo;
      this.getRoleList();
    },
    offTree() {
      for (var i = 0; i < this.$refs.tree.store._getAllNodes().length; i++) {
        this.$refs.tree.store._getAllNodes()[i].expanded = false;
      }
    },

    dialogClose() {
      this.selectedKeys = [];

      if(this.$refs.tree){
        this.$refs.tree.setCheckedKeys(this.selectedKeys);
        this.offTree();
      }
    },

    openAddbox() {
      if(this.menuList.length === 0){
        this.getMenuList();
      }
      this.dialogTitle = "新增角色";
      this.dialogForm.roleName = "";
      this.dialogForm.roleId = "";
      this.dialogForm.remark = "";
      this.dialogFormVisible = true;
    },
    openEditbox(row) {
      if(this.menuList.length === 0){
        this.getMenuList();
      }
      this.arbFormulaInfo = row;
      this.dialogTitle = "修改角色信息";
      this.dialogForm.roleId = row.roleId;
      let url = "/api/sys/role/info/" + row.roleId;

      api.getRoleInfo(url).then(res => {
        if (res.data.code == '1') {
          this.dialogForm.roleName = res.data.data.roleName;
          this.dialogForm.remark = res.data.data.remark;
          this.selectedKeys = res.data.data.menuIdList;
          this.$refs.tree.setCheckedKeys(this.selectedKeys);
        } else {
        }
      });

      this.dialogFormVisible = true;
    },

    deleteRole() {
      let params = [];
      params = this.multipleSelection.map(item => {
        return item.roleId;
      });
      let msg = "确认删除已选的角色吗？";

      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          api.deleteRole(params).then(res => {
            if (res.data.code === '1') {
              this.$message.success("删除成功！");
              if(params.length >= this.tableData.length){
                this.pageNo--
              }
              this.$refs['table'].clearSelection()
              this.getRoleList();
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },

    saveRoleInfo() {
      var add = this.dialogForm.roleId ? false : true;
      this.selectedKeys = this.$refs.tree.getCheckedKeys();
      let selectedKeysTemp = this.$refs.tree.getHalfCheckedKeys();
      for (var i in selectedKeysTemp) {
        this.selectedKeys.push(selectedKeysTemp[i]);
      }
      if (this.dialogForm.roleName == "") {
        this.$message.warning("请输入角色名称");
      } else if (this.dialogForm.remark == "") {
        this.$message.warning("请输入备注");
      } else if (this.selectedKeys.length == 0) {
        this.$message.warning("请选择授权");
      } else if (add) {
        let params = Object.assign({
          remark: this.dialogForm.remark,
          roleName: this.dialogForm.roleName,
          menuIdList: this.selectedKeys
        });
        this.loading = true;
        api.saveRoleInfo(params).then(res => {
          this.loading = false;
          if (res.data.code === '1') {
            this.$message.success("保存成功！");
            this.getRoleList();
          } else {
            this.$message.error(res.data.msg);
          }
        });
        this.dialogFormVisible = false;
      } else {
        let params = Object.assign({
          roleId: this.dialogForm.roleId,
          remark: this.dialogForm.remark,
          roleName: this.dialogForm.roleName,
          menuIdList: this.selectedKeys
        });
        this.loading = true;
        api.updateRoleInfo(params).then(res => {
          this.loading = false;
          if (res.data.code === '1') {
            this.$message.success("保存成功！");
            this.getRoleList();
          } else {
            this.$message.error(res.data.msg);
          }
        });
        this.dialogFormVisible = false;
      }
    },

    
    getRoleList() {
      let url =
        "/api/sys/role/list?_search=false&limit=" +
        this.pageSize +
        "&page=" +
        this.pageNo +
        "&sidx=&order=asc&roleName=" +
        this.searchForm.roleName;

      api.getRoleList(url).then(res => {
        if (res.data.code == '1') {
          let data = res.data.data.list;
          this.tableData = data;
          this.total = res.data.data.totalCount;
        } else {
          this.tableData = [];
          this.total = 0;
        }
      });
    },

    getMenuList() {
      let url = "/api/sys/menu/perms?";
      api.getMenuList(url).then(res => {
        if (res.data.code === '1') {
          this.menuList = arrayToTree(res.data.data, {
            parentProperty: "parentId",
            customID: "menuId"
          });
        } else {
        }
      });
    },
    searchFn() {
      this.pageNo = 1;
      this.getRoleList();
    }
  },
  created() {
    this.getRoleList();
    // this.getMenuList();
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
