<template>
  <div class="reg">
    <div class="reg-width">
      <el-container>
        <el-main>
           <transition >
            <div class="flex">
              <img src="../../assets/404.jpg" alt="">
              <div>
                <el-button type="primary" @click="$router.back(-1)">返回上一页</el-button>
          	  </div>
            </div>
          </transition>
        </el-main>
      </el-container>
    </div>
  </div>
</template>
<script>

export default {
  data () {
    return {
    }
  }
}
</script>
<style lang="scss" scoped>
.reg-width {
  padding-top: 30px;
  width: 800px;
  margin: auto;
}
.flex{
  height:500px;
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction: column;
  .el-button{
  	display: inline-block;
  	margin: 0 30px;
  }
  img{
    margin-bottom: 30px;
  }
  h3{
    margin-bottom: 50px;
  }
}
</style>
