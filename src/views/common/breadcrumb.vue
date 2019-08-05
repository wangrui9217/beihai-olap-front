<template>
  <div>
    <el-breadcrumb separator="/" style="margin:0 0 20px;padding:0 30px">
      <el-breadcrumb-item v-for="(item,index) in breadList" :key = 'index'>{{item.name}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="g-title" v-if="currentTitle" style="padding: 0 30px 20px">{{currentTitle}}</div>
  </div>
</template>
审核资料详情
<script>
export default {
  created() {
    this.getBread();
  },
  data() {
    return {
      breadList: [],
      currentTitle: ''
    }
  },
  methods: {
    getBread() {
      let breadList = []
      this.$route.matched.forEach((item,index) => {
        if(index !=0 && item.name){
          breadList.push({
            path: item.path,
            name: item.name
          })
        }
      })
      if(breadList.length > 0){
        this.breadList = breadList
        this.currentTitle = breadList[breadList.length - 1].name
      }
      const MENUS = ['审核管辖权详情', '审核案件资料详情', '校对裁决书详情', '审核校对裁决书详情', '仲裁请求详情', '核对裁决书详情', '开庭笔录详情', '合并开庭笔录详情', '审核决定书详情','管辖权异议审核详情']
      if (MENUS.indexOf(this.currentTitle) !== -1) {
        this.currentTitle = ''
      }
    }
  },
  watch: {
    $route() {
      this.getBread();
    }
  }
}

</script>
