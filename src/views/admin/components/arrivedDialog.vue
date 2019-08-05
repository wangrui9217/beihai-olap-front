<template>
  <el-dialog title="确认送达" :visible.sync="dialogVisible" width="400px" :close-on-click-modal="false">
    <p style="text-align: center;line-height: 30px;">您选择案件数为{{quantity}}个，<br />是否确认送达？</p>
    <div slot="footer" style="text-align: right;">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirm()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    confirmFn: Function,
    quantity: Number
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    openDialog(){
      this.dialogVisible = true
    },
    closeDialog(){
      this.dialogVisible = false
    },
    confirm(){
      this.confirmFn()
    }
  }
}

</script>