<template>
  <el-row type="flex" class="g-filter mt20">
    <el-col>
      <el-form :inline="true" :model="filterData" class="filter-form" label-width="80px" label-position="left">
        <el-form-item label="案件状态">
          <el-select v-model="filterData.status" @change="searchFn">
            <el-option v-for="item in arbTypes" :value="item.arbStatus" :key="item.arbStatus" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="案件编号">
          <el-input placeholder="案件编号" v-model.trim="filterData.arbNumber" :maxlength="20" @keyup.enter.native="searchFn">
          </el-input>
        </el-form-item>
        <el-form-item label="被申请人">
          <el-input placeholder="被申请人" v-model.trim="filterData.arbDefendantName" :maxlength="18" @keyup.enter.native="searchFn">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchFn">查询</el-button>
          <span class="expand" v-if="expand===false" @click="expand=true">展开</span>
          <span class="expand" v-else @click="expand=false">收起</span>
        </el-form-item>
        <div v-if="expand">
          <el-form-item label="案由" >
            <el-input placeholder="案由" v-model.trim="filterData.arbName" :maxlength="20" @keyup.enter.native="searchFn">
            </el-input>
          </el-form-item>
          <el-form-item label="申请时间">
            <el-date-picker v-model="dataRange" type="daterange" @change="dateChange" format="yyyy-MM-dd" value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" prefix-icon="">
            </el-date-picker>
          </el-form-item>
        </div>
      </el-form>
    </el-col>
  </el-row>
</template>
<script>
  import DICT from '@/const/dict'
export default {
  props: ['filterData', 'searchFn'],
  data() {
    return {
    	dataRange: '',
      arbTypes: DICT.arbTypes,
      expand: false
    }
  },
  methods: {
    dateChange(val){
    	if(!val){
    	  this.filterData.startTime = '';
  		  this.filterData.endTime = '';
    	}
    	else{
    	  this.filterData.startTime = val[0];
  		  this.filterData.endTime = val[1];
    	}
  	},
  }
}

</script>
<style scoped lang="scss">
  .filter-form {
    .el-date-editor,.el-input, .el-select{
      width: 225px;
    }
  }
  .expand{
    color: #1890ff;
    cursor: pointer;
    line-height: 36px;
    margin-left: 8px;
    font-size: 14px;
  }
</style>