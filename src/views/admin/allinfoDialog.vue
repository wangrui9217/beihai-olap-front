<template>
  <el-dialog
    class="box"
    title="组庭信息"
    :visible.sync="dialogVisible"
    width="600px">
    <div>
      <label>合并开庭编号：</label>
      <span>{{obj.arbitralMergeNumber}}</span>
    </div>
    <div>
      <label>庭审类型：</label>
      <span>{{obj.trialType}}</span>
    </div>
    <div>
      <label>庭审地点：</label>
      <span>{{obj.trialAddress}}</span>
    </div>
    <div>
      <label>庭审日期：</label>
      <span>{{obj.trialBeginTime}}-{{(obj.trialEndTime || '').substring(11)}}</span>
    </div>
    <div>
      <label>仲裁庭组成：</label>
      <span v-if="obj.composition === 1">独任仲裁庭</span>
      <span v-if="obj.composition === 2">合议仲裁庭</span>
    </div>
    <div>
      <label>适合程序：</label>
      <span>{{obj.arbProcedure}}</span>
    </div>
    <div>
      <label>首席仲裁员：</label>
      <span>{{obj.arbitrator}}</span>
    </div>
    <template v-if="obj.composition !== 1">
      <div>
        <label>申请人仲裁员：</label>
        <span>{{obj.prosecutorArbitrator}}</span>
      </div>
      <div>
        <label>被申请人仲裁员：</label>
        <span>{{obj.defendantArbitrator}}</span>
      </div>
    </template>

  </el-dialog>
</template>

<script>
export default {
  data(){
    return {
      dialogVisible: false,
      obj: {}
    }
  },
  methods: {
    openDialog (obj) {
      this.dialogVisible = true
      this.obj = obj || {}
    }

  },
  created() {

  },
  mounted(){

  }
}
</script>
<style lang="scss" scoped>
  .box{
    .el-dialog__body{
      div{
        line-height: 40px;
        display: flex;
        align-items: center;
        label{
          width: 180px;
          text-align: right;
        }
        span{
          flex: 1;
          flex-wrap: wrap;
        }
      }
    }
  }

</style>
