<template>
    <router-view id="arbi"></router-view>
</template>

<script>
export default {
  name: 'arbi',
   created(){
    //判断是否有本地存储中是否有token，并更新vuex仓库
    if(localStorage.getItem('adminAccessToken')){
      this.$store.commit('set_admin_token',localStorage.getItem('adminAccessToken'))
      this.$store.commit('set_admin_name',localStorage.getItem('adminName'))
    }
    if(localStorage.getItem('userAccessToken')){
      this.$store.commit('set_user_token',localStorage.getItem('userAccessToken'))
      this.$store.commit('set_user_name',localStorage.getItem('userName'))
      this.$store.commit('set_email',localStorage.getItem('email'))
      this.$store.commit('set_mobile',localStorage.getItem('mobile'))
    }
  }
}
</script>
<style lang="scss" scoped>
  #arbi{
  	height: 100%;
  }
</style>