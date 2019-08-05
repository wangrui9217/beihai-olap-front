<template>
  <el-row type="flex">
    <el-col>
      <el-form :inline="true" :model="filterData" class="filter-form" label-width="120px" label-position="left">
        <el-form-item label="合并案件编号">
          <el-input placeholder="案号" v-model.trim="filterData.arbMergeNumber" :maxlength="20" @keyup.enter.native="searchFn">
          </el-input>
        </el-form-item>
        <el-form-item label="仲裁员名称">
          <el-input placeholder="仲裁员名称" v-model.trim="filterData.arbitratorName" :maxlength="20" @keyup.enter.native="searchFn">
          </el-input>
        </el-form-item>
        <el-form-item label="案由">
          <el-input placeholder="案由" v-model.trim="filterData.arbName" :maxlength="20" @keyup.enter.native="searchFn">
          </el-input>
        </el-form-item>
        <el-button type="primary" style="width: 105px" @click="searchFn">搜索</el-button>
        <span class="expand" v-if="expand===false" @click="expand=true">展开</span>
        <span class="expand" v-else @click="expand=false">收起</span>
        <div v-if="expand">
          <el-form-item label="产品类型">
            <el-input placeholder="产品类型" v-model.trim="filterData.arbProductName" :maxlength="20" @keyup.enter.native="searchFn">
            </el-input>
          </el-form-item>
          <el-form-item label="申请人名称">
            <el-input placeholder="申请人名称" v-model.trim="filterData.prosecutorName" :maxlength="18" @keyup.enter.native="searchFn">
            </el-input>
          </el-form-item>
          <el-form-item label="庭审时间">
            <el-date-picker v-model="dataRange" type="daterange" @change="dateChange" format="yyyy-MM-dd" value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" prefix-icon="" @keyup.enter.native="searchFn">
            </el-date-picker>
          </el-form-item>
        </div>
      </el-form>
    </el-col>
  </el-row>
</template>
<script>
  export default {
    props: ['filterData', 'searchFn'],
    data() {
      return {
        dataRange: '',
        expand: false
      }
    },
    methods: {
      dateChange(val){
        if(!val){
          this.filterData.beginTime = '';
          this.filterData.endTime = '';
        }
        else{
          this.filterData.beginTime = val[0];
          this.filterData.endTime = val[1];
        }
      },
    }
  }

</script>
<style scoped lang="scss">
  .filter-form {
    .el-input{
      width: 200px;
    }
    .el-date-editor{
      width: 225px;
    }
  }
  .expand{
    color: #1890ff;
    cursor: pointer;
    line-height: 36px;
    margin-left: 5px;
  }
</style>
