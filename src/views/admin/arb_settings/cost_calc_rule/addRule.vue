<template>
  <div v-loading.fullscreen="loading">
    <div class="header">
      <el-button type="default" @click="$router.go(-1)">返回</el-button>
      <el-button type="primary" @click="submit()">保存</el-button>
    </div>
    <div style="margin-top:-32px"></div>
    <div class="g-listpage__style">
      <el-card class="g-box-card" style="margin-top: 0">
        <div slot="header">
          <span>基本信息</span>
        </div>
        <el-form :inline="true" :model="mainFrom" ref="mainFrom">
          <el-form-item label="规则编号" >
            <el-input v-model="mainFrom.regularNumber" disabled></el-input> 
          </el-form-item>
          <el-form-item label="规则名称" prop="regularName" :rules="{required: true, message: '请填写计算规则名称'}" style="margin-left: 50px">
            <el-input v-model="mainFrom.regularName" :maxLength="100"></el-input> 
          </el-form-item>
          <el-form-item label="规则模板" v-if="showTemplate">
            <el-select v-model="templateId" :clearable="true" @change="getTemplate">
              <el-option v-for="item in templates" :value="item.id" :label="item.label" :key="item.id"></el-option>
            </el-select> 
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="g-box-card">
        <div slot="header" class="actions">
          <el-button type="default" :disabled="selected.length === 0" @click="del()">删除</el-button>
          <el-button type="default" :disabled="selected.length !== 1" @click="openEditbox()">修改</el-button>
          <el-button type="default" @click="openAddbox()">新增</el-button>
          <span>仲裁费用计算规则</span>
        </div>
        <el-table :data="calcRules" ref="table" border @selection-change="selectionChange">
          <el-table-column type="selection" width="50">
          </el-table-column>
          <el-table-column prop="arbDisputeMoney" label="争议金额" width="216">
          </el-table-column>
          <el-table-column prop="percent" label="收费标准百分比" >
          </el-table-column>
          <el-table-column prop="arbFixedAmount" label="固定金额">
          </el-table-column>
          <el-table-column prop="arbExcessThreshold" label="超过阈值" >
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
    <el-dialog :title="title" :visible.sync="centerDialogVisible" width="600px" :close-on-click-modal="false">
      <el-form :model="ruleForm" class="ruleForm" label-width="130px" ref="ruleForm" :rules="rules">
        <el-form-item label="争议金额左区间" prop="arbDisputeLeftMoney">
          <el-input v-model="ruleForm.arbDisputeLeftMoney" :maxLength="13"></el-input>
        </el-form-item>
        <el-form-item label="争议金额右区间" prop="arbDisputeRightMoney">
          <el-input v-model="ruleForm.arbDisputeRightMoney" :maxLength="13"></el-input>
        </el-form-item>
        <el-form-item label="收费标准百分比" prop="arbChargeStandard">
          <el-input v-model="ruleForm.arbChargeStandard" :maxLength="13">
             <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="固定金额" prop="arbFixedAmount">
          <el-input v-model="ruleForm.arbFixedAmount" :maxLength="13"></el-input>
        </el-form-item>
        <el-form-item label="阈值" prop="arbExcessThreshold">
          <el-input v-model="ruleForm.arbExcessThreshold" :maxLength="13"></el-input>
        </el-form-item>
        <el-form-item label="备注说明" prop="arbContent">
          <el-input type="textarea" :maxLength="100" :autosize="{ minRows: 4}" v-model="ruleForm.arbContent"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="g-text-center">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addToList()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'
export default {
  data() {
    let numberValid = {pattern: /^\d+(\.\d+)?$/, message: '请输入数字'}
    const validateLeftMoney = (rule, value, callback) => {
      if (this.ruleForm.arbDisputeRightMoney && value - this.ruleForm.arbDisputeRightMoney >= 0) {
        callback(new Error('请输入比右区间小的数字'))
      } else {
        this.$refs.ruleForm.validateField('arbDisputeRightMoney')
        callback()
      }
    }
    const validateRightMoney = (rule, value, callback) => {
      if (this.ruleForm.arbDisputeLeftMoney && value - this.ruleForm.arbDisputeLeftMoney <= 0) {
        callback(new Error('请输入比左区间大的数字'))
      } else {
        callback()
      }
    }
    const validatearbExcessThreshold = (rule, value, callback) => {
      if (this.ruleForm.arbDisputeLeftMoney && value - this.ruleForm.arbDisputeLeftMoney > 0) {
        callback(new Error('阈值≥0且≤争议金额最小值，请重新输入'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      mainFrom: {
        regularName: '',
        regularNumber: ''
      },
      templateId: '1',
      showTemplate: false,
      templates: [{
        id: '1',
        label: '诉讼费收费标准',
        calcRules: [{
            "arbChargeStandard": '0',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '1',
            "arbDisputeRightMoney": '9,999', 
            "arbExcessThreshold": '0',
            "arbFixedAmount": '300',
          },
          {
            "arbChargeStandard": '2.5',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '10,000',
            "arbDisputeRightMoney": '99,999', 
            "arbExcessThreshold": '10,000',
            "arbFixedAmount": '50',
          },
          {
            "arbChargeStandard": '2',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '100,000',
            "arbDisputeRightMoney": '199,999', 
            "arbExcessThreshold": '100,000',
            "arbFixedAmount": '2,300',
          },
          {
            "arbChargeStandard": '1.5',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '200,000',
            "arbDisputeRightMoney": '499,999', 
            "arbExcessThreshold": '200,000',
            "arbFixedAmount": '4,300',
          },
          {
            "arbChargeStandard": '1',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '500,000',
            "arbDisputeRightMoney": '999,999', 
            "arbExcessThreshold": '500,000',
            "arbFixedAmount": '8,800',
          },
          {
            "arbChargeStandard": '0.9',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '1,000,000',
            "arbDisputeRightMoney": '1,999,999', 
            "arbExcessThreshold": '1,000,000',
            "arbFixedAmount": '13,800',
          },
          {
            "arbChargeStandard": '0.8',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '2,000,000',
            "arbDisputeRightMoney": '4,999,999', 
            "arbExcessThreshold": '2,000,000',
            "arbFixedAmount": '22,800',
          },
          {
            "arbChargeStandard": '0.7',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '5,000,000',
            "arbDisputeRightMoney": '9,999,999', 
            "arbExcessThreshold": '5,000,000',
            "arbFixedAmount": '46,800',
          },
          {
            "arbChargeStandard": '0.7',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '10,000,000',
            "arbDisputeRightMoney": '19,999,999', 
            "arbExcessThreshold": '10,000,000',
            "arbFixedAmount": '81,800',
          },
          {
            "arbChargeStandard": '0.5',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '20,000,000',
            "arbDisputeRightMoney": '999,999,999,999', 
            "arbExcessThreshold": '20,000,000',
            "arbFixedAmount": '141,800',
          }]
      },{
        id: '2',
        label: '北海仲裁费收费标准',
        calcRules: [{
            "arbChargeStandard": '0',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '1',
            "arbDisputeRightMoney": '1,000', 
            "arbExcessThreshold": '0',
            "arbFixedAmount": '100',
          },
          {
            "arbChargeStandard": '5',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '1,001',
            "arbDisputeRightMoney": '50,000', 
            "arbExcessThreshold": '1,000',
            "arbFixedAmount": '100',
          },
          {
            "arbChargeStandard": '4',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '50,001',
            "arbDisputeRightMoney": '100,000', 
            "arbExcessThreshold": '50,000',
            "arbFixedAmount": '2,550',
          },
          {
            "arbChargeStandard": '3',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '100,001',
            "arbDisputeRightMoney": '200,000', 
            "arbExcessThreshold": '100,000',
            "arbFixedAmount": '4,550',
          },
          {
            "arbChargeStandard": '2',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '200,001',
            "arbDisputeRightMoney": '500,000', 
            "arbExcessThreshold": '200,000',
            "arbFixedAmount": '7,550',
          },
          {
            "arbChargeStandard": '1',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '500,001',
            "arbDisputeRightMoney": '1,000,000', 
            "arbExcessThreshold": '500,000',
            "arbFixedAmount": '13,550',
          },
          {
            "arbChargeStandard": '0.5',
            "arbCostType": 1,
            "arbDisputeLeftMoney": '1,000,001',
            "arbDisputeRightMoney": '999,999,999,999', 
            "arbExcessThreshold": '1,000,000',
            "arbFixedAmount": '18,550',
          }]
        }
      ],
      ruleForm: {
        "arbChargeStandard": '',  // 收费标准百分比
        "arbCostType": 1,  // 费用类型 1-受理费用 2-处理费用
        "arbDisputeLeftMoney": '',  // 争议金额左区间
        "arbDisputeRightMoney": '', // 争议金额右区间 
        "arbExcessThreshold": '',   // 阈值
        "arbFixedAmount": '',  // 固定金额
        arbContent: ''
      },
      centerDialogVisible: false,
      calcRules: [],
      deletedLists: [],
      selected: [],
      title: '',
      rules: {
        arbChargeStandard: [
          {required: true, message: '请输入收费标准百分比'},
          {pattern: /^[1-9]?\d(\.\d{1,2})?$|^0\.\d{1,2}$|^100$/, message: '收费标准为0~100之间的数字，可以输入2位小数，请重新输入',trigger: 'blur'}
        ],
        arbDisputeLeftMoney: [
          {required: true, message: '请输入争议金额'},
          numberValid,
          { validator: validateLeftMoney, trigger: 'blur' }
        ],
        arbDisputeRightMoney: [
          {required: true, message: '请输入争议金额'},
          numberValid,
          { validator: validateRightMoney, trigger: 'blur' }
        ],
        arbExcessThreshold: [
          {required: true, message: '请输入阈值'},
          numberValid,
          { validator: validatearbExcessThreshold, trigger: 'blur' }
        ],
        arbFixedAmount: [
          {required: true, message: '请输入固定金额'},
          numberValid
        ]
      },
      id: '',
      selectedIndex: 0 // 保存被修改对象在数组中的位置，以便修改保存的时候校验争议金额
    }
  },
  methods: {
    getTemplate(value){
      if(value){
        let ruleInfo = this.templates.find(item => {return item.id === value }).calcRules
        ruleInfo.forEach(item => {
          item.arbDisputeMoney = item.arbDisputeLeftMoney + '~' + item.arbDisputeRightMoney
          item.percent = item.arbChargeStandard==='0'?'0': item.arbChargeStandard+ '%'
        })
        this.calcRules = ruleInfo
      }
      else{
        this.calcRules = []
      }
    },
    addToList(){
      this.$refs['ruleForm'].validate((valid) =>{
        if(valid){
          let data = Object.assign({},this.ruleForm)
          // 数字转化数额：加逗号
          for(let k in data){
            if(Number.parseInt(data[k]) > 999){
              data[k] = util.toThousands(data[k])
            }
          }
          data.arbDisputeMoney = data.arbDisputeLeftMoney + '~' + data.arbDisputeRightMoney
          data.percent = data.arbChargeStandard==='0'?'0': data.arbChargeStandard+ '%'
          if (this.title === '新增计算规则') {
            let prev = this.calcRules[this.calcRules.length-1]
            if(prev && data.arbDisputeLeftMoney - prev.arbDisputeRightMoney <= 0){
              this.$message.error('争议金额最小值必须大于已有数据的争议金额最大值')
              return false
            }
            data.arbCostType = 1
            data.arbStatus = 1
            data.fundRegularId = this.id
            this.calcRules.push(data)
          }
          else if (this.title === '修改计算规则') {
            let prev = this.calcRules[this.selectedIndex-1]
            let next = this.calcRules[this.selectedIndex+1]
            if(prev && data.arbDisputeLeftMoney - prev.arbDisputeRightMoney <= 0){
              this.$message.error('争议金额最小值必须大于上一条数据的争议金额最大值')
              return false
            }
            else if(next && data.arbDisputeRightMoney - next.arbDisputeLeftMoney >= 0){
              this.$message.error('争议金额最大值必须小于下一条数据的争议金额最小值')
              return false
            }
            this.calcRules.splice(this.selectedIndex, 1, data)
          }
          
          this.centerDialogVisible = false
          this.$refs['table'].clearSelection()
        }
      })
    },
    submit() {
      this.$refs['mainFrom'].validate((valid) =>{
        if(valid){
          if(this.calcRules.length === 0){
            this.$message.error('请添加仲裁费用规则')
          }
          else{
            this.loading = true
            let arr = [].concat(this.calcRules, this.deletedLists)
            arr.forEach(item => {
              for(let k in item){
                if(typeof item[k] === 'string' && k!=='arbContent'){
                  item[k] = item[k].replace(/,/g,'')
                }
              }
            })
            let params = {
              "configureRequest": this.calcRules.concat(this.deletedLists),
              "regularName": this.mainFrom.regularName,
              "regularNumber": this.mainFrom.regularNumber,
            }
            if (this.id === '') {  // 新增
              api.saveCalcRule(params).then(res => {
                this.loading = false
                if (res.data.code === '1') {
                  this.$message.success(res.data.msg)
                  this.$router.push({
                    path: 'costCalcRule'
                  })
                } else {
                  this.$message.error(res.data.msg)
                }
              })
            } else{  // 修改
              params.id = this.id
              api.updateCalcRule(params).then(res => {
                this.loading = false
                if (res.data.code === '1') {
                  this.$message.success(res.data.msg)
                  this.$router.push({
                    path: 'costCalcRule'
                  })
                } else {
                  this.$message.error(res.data.msg)
                }
              })
            }
          }
        }
      })
    },
    openAddbox() {
      this.title = '新增计算规则'
      this.centerDialogVisible = true
      this.ruleForm = {}
      this.$nextTick(() => {
        this.$refs['ruleForm'].resetFields()
      })
    },
    openEditbox(key) {
      let data = {}
      this.title = '修改计算规则'
      this.selectedIndex = this.calcRules.indexOf(this.selected[0])
      data = Object.assign({},this.selected[0])
      // 删除数字的逗号
      for(let k in data){
        if(typeof data[k] === 'string' && k!=='arbContent'){
          data[k] = data[k].replace(/,/g,'')
        }
      }
      this.ruleForm = data
      this.centerDialogVisible = true
      this.$nextTick(() => {
        this.$refs['ruleForm'].clearValidate()
      })
    },
    del(){
      this.$confirm('删除之后无法恢复，请再次确认', '提示', {
        type: 'warning'
      }).then(() => {
        this.calcRules = this.calcRules.filter(item => {
          return this.selected.indexOf(item) < 0
        })
        this.selected.forEach(item => {
          if(item.id){
            item.arbStatus = 2
            this.deletedLists.push(item)
          }
        })
        this.$refs['table'].clearSelection();
      },() => {})
    },
    selectionChange(rows){
      this.selected = rows
    },
    getFundRegularNumber(){
      api.getFundRegularNumber().then(res => {
        if(res.data.code === '1'){
          this.mainFrom.regularNumber = res.data.data.regularNumber
        }
      })
    },
    getRuleDetail(){
      let ruleInfoString = localStorage.getItem('ruleInfo')
      if(ruleInfoString){
        try{
          let ruleInfo = JSON.parse(ruleInfoString)
          if(ruleInfo.id === this.id && ruleInfo.arbStatus===1 && ruleInfo.status=='停用'){  // 校验数据的一致性以及合理性
            this.mainFrom = {
              regularNumber: ruleInfo.regularNumber,
              regularName: ruleInfo.regularName
            }
            ruleInfo.configureRequest.forEach(item => {
              if(item.arbStatus === 1){
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
          else{
            this.$router.replace({
              path: 'costCalcRule'
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
    else{
      this.getFundRegularNumber()
      this.showTemplate = true
      this.getTemplate('1')
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
.actions {
  .el-button {
    float: right; 
    padding: 5px 10px;
    margin-top: -2px;
    margin-left: 10px;
  }
}
</style>
