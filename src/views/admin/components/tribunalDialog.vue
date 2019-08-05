<!--组庭弹窗-->
<template>
  <el-dialog title="组庭信息" :visible.sync="dialogVisible" width="660px" :close-on-click-modal="false">
    <el-form label-width="130px" label-position="left">
      <el-form-item label="案件编号：">
        <span>{{arbNumber}}</span>
      </el-form-item>
      <el-form-item label="仲裁庭类型：">
        <el-radio-group v-model="formdata.arbitralTribunalType" @change="changeType">
          <el-radio :label="1">线下审理</el-radio>
          <el-radio :label="2">书面审理</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="formdata.arbitralTribunalType===1">
        <el-form-item label="仲裁地点：">
          <el-radio v-model="placeRadio" :label="1">{{formdata.arbitralTribunalPlace }}</el-radio>
        </el-form-item>
        <el-form-item label="庭审时间：">
           <el-date-picker
            v-model="date"
            type="date"
            :picker-options="dateOptions"
            value-format="yyyy-MM-dd"
            :editable="false"
            style="width: 150px"
            placeholder="选择日期">
          </el-date-picker>
          <el-time-select
            v-model="startTime"
            style="width: 150px"
            :picker-options="{
              start: '08:00',
              step: '00:15',
              end: '20:00',
              maxTime: endTime
            }"
            placeholder="起始时间">
          </el-time-select>
          <el-time-select
            v-model="endTime"
            style="width: 150px"
            :picker-options="{
              start: '08:00',
              step: '00:15',
              end: '20:00',
              minTime: startTime
            }"
            placeholder="结束时间">
          </el-time-select>
        </el-form-item>
      </template>
      <el-form-item label="仲裁庭组成：" >
        <el-radio-group v-model="formdata.arbitralTribunalComposition" @change="changeComposition">
          <el-radio v-for="item in arr" :key="item.name" :label="item.value" >{{item.name}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="适用程序：" >
        <el-select clearable v-model="formdata.procedureName">
          <el-option v-for="item in procedures" :key="item.procedureName" :label="item.procedureName" :value="item.procedureName">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="仲裁员：">
        <span>{{arbitratorName}}</span>
      </el-form-item>
      <template v-if="formdata.arbitralTribunalComposition===2">
        <el-form-item label="申请人仲裁员：">
          <el-select v-model="proArbitrator" :clearable="true">
            <el-option v-for="item in arbitrators" :key="item.userId" :label="item.name" :value="item.userId" :disabled="item.disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="被申请人仲裁员：">
          <el-select v-model="accArbitrator" :clearable="true">
            <el-option v-for="item in arbitrators" :key="item.userId" :label="item.name" :value="item.userId" :disabled="item.disabled"></el-option>
          </el-select>
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="postTribunal()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { api } from '@/api'
export default {
  props: {
    postTribunalFn: Function
  },
  data() {
    return {
      date: '',
      dateOptions: {
        disabledDate(date){
          return date.getTime() < Date.now();
        }
      },
      startTime: '',
      endTime: '',
      arbitratorName: '',
      arbitratorId: '',
      placeRadio: 1,
      arbNumber: '',
      formdata: {
        "arbitralTribunalType": 1,
        "arbitralTribunalBeginTime": "",
        "arbitralTribunalEndTime": "",
        "arbitralTribunalPlace": "",
        "arbitralTribunalComposition": 1,
        procedureName: ''
      },
      dialogVisible: false,
      proArbitrator: '',
      accArbitrator: '',
      arbitrators: [],
      procedures: [],
      allProcedures: [],
      arr: [{
        name: '独任仲裁庭',
        value: 1
      },{
        name: '合议仲裁庭',
        value: 2
      }]
    }
  },
  watch: {
    proArbitrator(curVal,oldVal){
      this.setArbitrators(curVal,oldVal)
    },
    accArbitrator(curVal,oldVal){
      this.setArbitrators(curVal,oldVal)
    }
  },
  methods: {
    setArbitrators(curId, oldId){
      if(this.arbitrators.length > 0){
        this.arbitrators.forEach(item => {
          if(oldId === item.userId){
            item.disabled = false
          }
          else if(curId === item.userId){
            item.disabled = true
          }
        })
      }
    },
    changeComposition(val){
      if(val === 1){
        this.proArbitrator = ''
        this.accArbitrator = ''
      }
      this.procedures = this.allProcedures.filter(item => {return item.arbArbitratorType === val})
      this.formdata.procedureName = ''
    },
    changeType(val){
      if(val === 1){

      }
      else if(val === 2){
        this.date = ''
        this.startTime = ''
        this.endTime = ''
        // if(this.formdata.arbitralTribunalComposition === 1){
        //   return false
        // }
        // this.formdata.arbitralTribunalComposition = 1
        // this.changeComposition(1)
      }
    },
    closeDialog(){
      this.dialogVisible = false
    },
    openDialog(arbInfo){
      this.formdata = {
        procedureName: arbInfo.procedureName,
        "arbitralTribunalType": 1,
        "arbitralTribunalBeginTime": "",
        "arbitralTribunalEndTime": "",
        "arbitralTribunalPlace": '上海',
        "arbitralTribunalComposition": arbInfo.arbArbitratorType,
        "processCommonRequest": {
          "arbitralInfoId": arbInfo.id,
          "processTaskId": arbInfo.arbProcessTask
        },
      }
      this.proArbitrator = ''
      this.accArbitrator = ''
      this.date = ''
      this.startTime = ''
      this.endTime = ''
      this.arbNumber = arbInfo.arbNumber
      this.dialogVisible = true
      this.arbitratorName = arbInfo.arbitratorName
      this.arbitratorId = arbInfo.arbitratorId
      this.allProcedures = []
      this.procedures = []
      this.arbitrators = []
      for (var i = 0; i < this.arr.length; i++) {
        if(this.arr[i].value === this.formdata.arbitralTribunalComposition){
          if(this.arr[i].name.indexOf('（默认）') < 0){
            this.arr[i].name +='（默认）'
          }
        }
        else{
          this.arr[i].name.replace('（默认）', '')
        }
      }
      this.getArbitrators()
      this.getProcedures()
    },
    postTribunal(){
      if(this.formdata.arbitralTribunalType === 1){
        if(!this.date){
          this.$message.error('庭审日期不可为空')
          return false
        }
        else if(!this.startTime){
          this.$message.error('庭审起始时间不可为空')
          return false
        }
        else if(!this.endTime){
          this.$message.error('庭审结束时间不可为空')
          return false
        }
        this.formdata.arbitralTribunalBeginTime = this.date + ' ' + this.startTime + ':00'
        this.formdata.arbitralTribunalEndTime = this.date + ' ' + this.endTime + ':00'
      }
      if(this.formdata.arbitralTribunalComposition === 2){
        if(this.proArbitrator === ''){
          this.$message.error('申请人仲裁员未选择')
          return false
        }
        else if(this.accArbitrator === ''){
          this.$message.error('被申请人仲裁员未选择')
          return false
        }
        this.formdata.arbDefendantArbitratorId = this.accArbitrator
        this.formdata.arbProsecutorArbitratorId = this.proArbitrator
      }
      if(!this.formdata.procedureName){
        this.$message.error('适用程序未选择')
        return false
      }
      // console.log(this.formdata)
      this.postTribunalFn(this.formdata)
    },
    getProcedures(){
      api.getProcedures({}).then(res => {
        if(res.data.code === '1'){
          this.allProcedures = res.data.list
          this.procedures = this.allProcedures.filter(item => {return item.arbArbitratorType === this.formdata.arbitralTribunalComposition})
        }
        else{
          this.allProcedures = []
          this.procedures = []
        }
      })
    },
    getArbitrators(){
      // 获取仲裁员列表
      let params = Object.assign({
        pageNo: 1,
        pageSize: 100
      });
      api.getSysUserList(params).then(res => {
        let data = res.data.list;
        data.forEach(item => {
          item.job = item.job ? item.job.replace(/,/g, '/') : ''
          item.name = item.realname + '  ' + item.job
          if (item.userId === this.arbitratorId) {
            item.disabled = true;
          }
          if (item.status != 2) {
            this.arbitrators.push(item)
          }
        })
      });
    }
  }
}

</script>