<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false">
    <el-form label-width="100px">
      <el-form-item label="审核结果">
        <el-radio-group @change="changeRadio" v-model="reviewRadio">
          <el-radio label="1">通过</el-radio>
          <el-radio label="2">不通过</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- <el-form-item label="仲裁庭组成" v-if="title==='审核管辖权' && reviewRadio==='1'">
        <el-radio-group v-model="arbArbitratorType">
          <el-radio :label="1">独任仲裁庭</el-radio>
          <el-radio :label="2">合议仲裁庭</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="审核意见">
        <el-input type="textarea" :rows="5" :placeholder="placeholder" :maxlength="8000" v-model.trim="reviewTextarea">
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" style="text-align: center;">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="review()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    reviewFn: Function,
    title: String
  },
  data() {
    return {
      dialogVisible: false,
      reviewRadio: '1',
      placeholder: '请输入意见（选填）',
      reviewTextarea: '',
      // arbArbitratorType: ''
    }
  },
  methods: {
    closeDialog(){
      this.dialogVisible = false
    },
    openDialog(){
      this.reviewTextarea = ''
      this.placeholder = '请输入意见（选填）'
      this.reviewRadio = '1' 
      this.dialogVisible = true
      // this.arbArbitratorType = ''
    },
    review(){
      if(this.title==='审核管辖权'){
        this.reviewFn(this.reviewRadio, {
          text: this.reviewTextarea,
          // arbArbitratorType: this.arbArbitratorType
        })
      }
      else{
        this.reviewFn(this.reviewRadio, this.reviewTextarea)
      }
    },
    changeRadio(v){
      if(v=='1'){
        // this.arbArbitratorType = ''
        this.placeholder = '请输入意见（选填）'
      }
      else{
        this.placeholder = '请输入意见（必须）'
      }
      this.reviewTextarea = ''
    },
  }
}

</script>