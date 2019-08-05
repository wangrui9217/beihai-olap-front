<template>
  <el-dialog title="线下邮递文书" :visible.sync="dialogVisible" width="1024px" :close-on-click-modal="false">
    <div class="g-mail">
      <el-table :data="mailData" style="width: 100%" :row-style="{'font-size':'12px'}">
        <el-table-column type="index" width="50" label="序号">
        </el-table-column>
        <el-table-column prop="documentName" label="文件名" :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column prop="roleName" label="送达对象" :show-overflow-tooltip="true" width="80">
        </el-table-column>
        <el-table-column prop="userName" label="收件人" :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column label="快递单号">
          <template slot-scope="scope">
            <input v-if="!scope.row.arbitralExpressRecordId" class="table-input" v-model.trim="scope.row.expressNumber" :maxLength="15" @blur="e => {validate(e, scope.row)}" />
            <span v-else>{{scope.row.expressNumber}}</span>
          </template>
        </el-table-column>
        <el-table-column label="邮递日期">
          <template slot-scope="scope">
            <el-date-picker
              v-if="!scope.row.arbitralExpressRecordId"
              class="table-date"
              v-model="scope.row.expressTime"
              type="date"
              :editable="false"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions1(scope.row)">
            </el-date-picker>
            <span v-else>{{scope.row.expressTime}}</span>
          </template>
        </el-table-column>
        <el-table-column label="送达日期">
          <template slot-scope="scope">
            <el-date-picker
              v-if="!scope.row.arrivedTime"
              class="table-date"
              v-model="scope.row.formArrivedTime"
              type="date"
              :editable="false"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions2(scope.row)">
            </el-date-picker>
            <span v-else>{{scope.row.arrivedTime}}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="mail()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    mailData: Array,
    mailFn: Function
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    pickerOptions1(row){
      return {
        disabledDate:(time) => {
          if(row.formArrivedTime || row.arrivedTime){
            let formArrivedTime = row.formArrivedTime?new Date(row.formArrivedTime.replace(/-/g,'/')).getTime():0
            let arrivedTime = row.arrivedTime?new Date(row.arrivedTime.replace(/-/g,'/')).getTime():0
            let max = arrivedTime?arrivedTime:formArrivedTime
            return time.getTime() > max
          }
        }
      }
    },
    pickerOptions2(row){
      return {
        disabledDate:(time) => {
          if(row.expressTime){
            let expressTime = new Date(row.expressTime.replace(/-/g,'/')).getTime()
            let min = expressTime
            return time.getTime() < min
          }
        }
      }
    },
    mail(){
      let data = []
      let error = ''
      this.mailData.map(item => {
        if(!item.arbitralExpressRecordId){
          if(item.expressTime && item.expressNumber){
            let o = Object.assign({},
              item,
              {
                documentArrivedType: 2,
                expressType: 1
              }
            )
            if(item.formArrivedTime) o.arrivedTime = item.formArrivedTime
            data.push(o)
          }
          else if(item.formArrivedTime){
            error = '不能只填写送达时间，请填写对应文书的邮递单号和邮递时间'
          }
        }
        else{
          if(item.formArrivedTime){
            data.push(Object.assign({},
              item,
              {
                documentArrivedType: 2,
                arrivedTime: item.formArrivedTime,
                expressType: 1
              }
            ))
          }
        }
      })
      if(data.length === 0){
        this.$message.error('请填写至少一个文书的邮递单号和邮递时间，或已邮递文书的送达时间')
        return false
      }
      else if(error){
        this.$message.error(error)
        return false
      }
      this.mailFn(data)
    },
    validate(e,row){
      let value = e.target.value
      if(value && /^[0-9a-zA-Z]+$/.test(value) === false){
        this.$message.warning('快递单号通常只包含字母和数字，请检查单号')
        row.expressNumber = value.replace(/[^0-9a-zA-Z]/g,'')
      }
    },
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
.table-input{
  line-height: 38px;
  height: 38px;
  width: 136px;
  outline: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  text-indent: 5px;
  &::-webkit-input-placeholder{
    color: #aaa;
  };
}
</style>