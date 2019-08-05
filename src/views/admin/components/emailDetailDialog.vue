<template>
  <el-dialog title="电子送达详情" :visible.sync="dialogVisible" width="1024px" :close-on-click-modal="false">
    <div>
      <el-table :data="emailData" style="width: 100%" >
        <el-table-column type="index" width="50" label="序号">
        </el-table-column>
        <el-table-column prop="documentName" label="文书名" :show-overflow-tooltip="true" width="180">
        </el-table-column>
        <el-table-column prop="roleName" :show-overflow-tooltip="true" label="送达对象">
        </el-table-column>
        <el-table-column prop="userEmail" :show-overflow-tooltip="true" label="邮箱地址">
        </el-table-column>
        <el-table-column prop="userName" :show-overflow-tooltip="true" label="收受人">
        </el-table-column>
        <el-table-column prop="status" :show-overflow-tooltip="true" label="送达情况">
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    emailData: Array
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    open(){
      this.dialogVisible = true
    },
    close(){
      this.dialogVisible = false
    }
  }
}

</script>
<style lang="scss" scoped>

</style>
