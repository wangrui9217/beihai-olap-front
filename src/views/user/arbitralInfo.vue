<template>
  <div>
    <el-breadcrumb separator="/" style="padding: 20px 30px;" >
      <el-breadcrumb-item >仲裁请求查询</el-breadcrumb-item>
      <el-breadcrumb-item >仲裁请求详情</el-breadcrumb-item>
    </el-breadcrumb>
    <arbitral-info end-name="user"></arbitral-info>
  </div>
</template>
<script>
import arbitralInfo from '@/views/common/arbitralInfo'
export default {
  components: { arbitralInfo },
  data() {
    return {
      
    }
  },
  methods: {
    
  },
  mounted() {
   
  }
}

</script>
<style lang="scss" scoped>
  
</style>
