<template>
  <div class="g-review-data" v-loading.fullscreen="loading">
    <div class="ly-header">
      <div class="msg">
        <h2>编号：{{arbiInfo.arbNumber || arbiInfo.arbTemporaryNumber}}<span class="g-link" @click="editArbNumber(arbiInfo.arbTemporaryNumber, arbiInfo.id)" style="font-size: 14px;font-weight: normal;margin-left: 10px;" v-if="arbiInfo.arbStatus=== 10">编辑</span></h2>
        <p><span>案由：</span>{{arbiInfo.arbName}}</p><p><span>产品类型：</span>{{arbitralContractAdvancey.arbProductName}}</p>
        <p><span>申请人：</span>{{arbiInfo.arbProsecutorName}}</p><p><span>被申请人：</span>{{arbiInfo.arbDefendantName}}</p>
        <p><span>申请日期：</span>{{arbiInfo.createTime}}</p>
      </div>
      <div class="actions">
        <div>
          <el-button type="default" @click="$router.go(-1)">返回</el-button>
          <el-button type="primary" @click="reviewPass()">审核</el-button>
          <el-button type="primary" id="css_refuse" @click="refuse()">拒绝</el-button>
        </div>
        <div class="mt20">
          <p><span>状态</span></p>
          <p><b>待审核</b></p>
        </div>
      </div>
    </div>
    <show-evidence :arbi-info="arbiInfo" title="仲裁申请书"></show-evidence>
    <review-dialog title="审核管辖权" :reviewFn="review" ref="reviewDialog"></review-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import reviewDialog from '@admin/components/reviewDialog'
import showEvidence from '@admin/components/showEvidence'
export default {
  components: { reviewDialog, showEvidence},
  data() {
    return {
      loading: false, //
      arbiInfo: {},
      arbitralContractAdvancey: {}
    }
  },
  methods: {
    editArbNumber (info, id) {
      this.$prompt('请输入编号', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.*[^\s]+.*$/,
        closeOnClickModal: false,
        inputErrorMessage: '编号不能为空',
        inputValue: info
      }).then(({ value }) => {
        const data = {temporaryNum: value, arbitralInfoId: id}
        api.updateTemporaryNum(data).then(res => {
          if (res.data.code == '1') {
            this.$message.success (res.data.msg)
            this.queryData()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      }).catch(() => {
      })
    },
    queryData(){
      this.loading = true;
      api.getArbitralInfoDetailBySys({
        arbitralId: this.id
      }).then((res) => {
        this.loading = false;
        if(res.data.code == '1'){
          let data = res.data
          if(data.arbStatus === 10){
            this.arbiInfo = data
            this.arbiInfo.arbitralAttachments = data.arbitralAttachment
            this.arbitralContractAdvancey = this.arbiInfo.arbitralContractAdvancey
          }
          else{
            this.$message.error('案件不处在审核管辖权流程中，请返回上一级页面确认')
          }
        }
      })
    },
    reviewPass() {
      this.$refs.reviewDialog.openDialog()
    },
    refuse(){
      this.$prompt('拒绝理由', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S+/,
          inputErrorMessage: '请输入拒绝理由',
          closeOnClickModal: false
        }).then(({ value }) => {
          this.loading = true;
          api.applyJurisdictionReject({
            "passOpinion": value,
            "processCommonRequest": {
              "arbitralInfoId": this.arbiInfo.id, //案件id
              "processTaskId": this.arbiInfo.arbProcessTask, //案件流程id
            }
          }).then(res => {
            this.loading = false;
            if(res.data.code === '1'){
              this.$message.success(res.data.msg);
              this.$router.go(-1)
            }
            else{
              this.$message.error(res.data.msg);
            }
          })
        }).catch(() => {

        });
    },
    review(passOrNot, options){
      if (passOrNot == '2' && options.text == '') {
        this.$message.error('请输入意见');
      }
      else if(passOrNot === '1'){
        this.loading = true;
        api.applyJurisdictionPass({
          processCommonRequest: {
            "arbitralInfoId": this.arbiInfo.id, //案件id
            "processTaskId": this.arbiInfo.arbProcessTask, //案件流程id
          },
          passOpinion: options.text
        }).then((res) => {
          this.loading = false;
          if (res.data.code == '1') {
            this.$message.success(res.data.msg);
            this.$router.go(-1)
          } else {
            this.$message.error(res.data.msg);
          }
        })
      }
      else{
        this.loading = true;
        api.applyJurisdictionNoPass({
          processCommonRequest: {
            "arbitralInfoId": this.arbiInfo.id, //案件id
            "processTaskId": this.arbiInfo.arbProcessTask, //案件流程id
          },
          passOpinion: options.text
        }).then((res) => {
          this.loading = false;
          if (res.data.code == '1') {
            this.$message.success(res.data.msg);
            this.$router.go(-1)
          } else {
            this.$message.error(res.data.msg);
          }
        })
        // ...不通过
      }
    }
  },
  created(){
    this.id = this.$route.query.data
    if(this.id){
      this.queryData()
    }
  }
}

</script>
<style lang="scss" scoped>
.ly-header{
  display: flex;
  color: #666;
  font-size: 14px;
  justify-content: space-between;
  padding: 0 30px;
  .msg{
    width: 800px;
    overflow: hidden;
    h2{
      margin-bottom: 20px;
      font-size: 20px;
      line-height: 32px;
      color: #333;
      font-weight: bold;
    }
    p{
      width: 360px;
      float: left;
      height: 32px;
      line-height: 32px;
      span{
        display: inline-block;
        width: 80px;
      }
    }
  }
  .actions{
    margin-right: 20px;
    width: 300px;
    text-align: right;
    span{
      color: #999;
    }
    .el-button{
      padding: 8px 20px;
    }
    b{
      font-size: 18px;
      color: #333;
      font-weight: normal;
      line-height: 40px;
    }
  }
}
#css_refuse{
  background: #fff;
  color: #f00;
  border-color: #f00;
  &:hover{
    background: #f5f5f5;
  }
}

</style>
