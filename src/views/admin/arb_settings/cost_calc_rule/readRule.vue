<template>
  <div>
    <div class="header">
      <el-button type="default" @click="$router.go(-1)">返回</el-button>
    </div>
    <div style="margin-top:-32px"></div>
    <div class="g-listpage__style">
      <el-card class="g-box-card" style="margin-top: 0">
        <div slot="header">
          <span>基本信息</span>
        </div>
        <el-form :inline="true" >
          <el-form-item label="规则编号：" >
            {{template.regularNumber}}
          </el-form-item>
          <el-form-item label="规则名称：" style="margin-left: 100px">
            {{template.regularName}}
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="g-box-card">
        <div slot="header">
          <span>仲裁费用计算规则</span>
        </div>
        <el-table :data="calcRules" ref="table" border >
          <el-table-column type="index"  label="序号" width="50">
          </el-table-column>
          <el-table-column prop="arbDisputeMoney" label="争议金额">
          </el-table-column>
          <el-table-column prop="percent" label="收费标准百分比">
          </el-table-column>
          <el-table-column prop="arbFixedAmount" label="固定金额">
          </el-table-column>
          <el-table-column prop="arbExcessThreshold" label="阈值" >
          </el-table-column>
          <el-table-column prop="arbContent" label="备注说明" >
            
          </el-table-column>
        </el-table>
      </el-card>
      <el-card class="g-box-card">
        <div slot="header">
          <span>受理费用</span>
        </div>
        <div>
          受理费 = 仲裁费用 ÷ 1.3
        </div>
      </el-card>
      <el-card class="g-box-card">
        <div slot="header">
          <span>处理费用</span>
        </div>
        <div>
          处理费 = 仲裁费用 － 受理费
        </div>
      </el-card>
    </div>
  </div>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'
export default {
  data() {
    return {
      template: {
        regularName: '',
        regularNumber: ''
      },
      calcRules: [],
      id: ''
    }
  },
  methods: {
    getRuleDetail(){
      let ruleInfoString = localStorage.getItem('ruleInfo')
      if(ruleInfoString){
        try{
          let ruleInfo = JSON.parse(ruleInfoString)
          if(ruleInfo.id === this.id){  // 校验数据的一致性
            this.template = {
              regularNumber: ruleInfo.regularNumber,
              regularName: ruleInfo.regularName
            }
            ruleInfo.configureRequest.forEach(item => {
              if(item.arbStatus === 1){
                for(let k in item){
                  if(Number.parseInt(item[k]) > 999){
                    item[k] = util.toThousands(item[k])
                  }
                }
                item.arbDisputeMoney = item.arbDisputeLeftMoney + '~' + item.arbDisputeRightMoney
                item.percent = item.arbChargeStandard===0?'0': (item.arbChargeStandard+ '%')
                this.calcRules.push(item)
                // if(item.arbCostType === 1){
                //   this.acceptLists.push(item)
                // }
                // else{
                //   this.handleLists.push(item)
                // }
              }
            })
          }
        }
        catch(err){
          console.log(err)
        }
      }
    }
  },
  created() {
    let id = this.$route.query.data
    if(id){
      this.id = id
      this.getRuleDetail()
    }
  }
}

</script>
<style lang="scss" scoped>
.header{
  text-align: right;
  padding-right: 30px;
  .el-button{
    position: relative;
    top: -49px;
    padding: 8px 20px;
  }
}

.tips{
  font-size: 12px;
  b{
    color: #FF3399;
    font-weight: normal;
    margin-left: 20px;
  }
}
</style>
