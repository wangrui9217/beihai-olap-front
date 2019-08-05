<template>
  <div class="user" v-loading.fullscreen="loading">
    <div class="ly-head">
      <h2 class="g-title">用户中心</h2>
      <div class="user-info">
        <div class="money">
          <p>账户余额</p>
          <p><b>{{balance}}</b>元</p>
        </div>
        <div class="user-actions">
          <p @click="openUserInfo()">
            <span class="user-img">{{userName.substring(0,2)}}</span>
            欢迎， <span class="user-name" >{{userName}}</span>
          </p>
          <span class="mod-pass" @click="modPass">修改密码</span>
        </div>
      </div>
    </div>
    <div class="ly-body">
      <h2>账单列表</h2>
      <div class="table-container">
        <el-table :data="tableData" border>
          <el-table-column prop="type" label="账单分类" width="100">
          </el-table-column>
          <el-table-column prop="code" label="案件编号">
          </el-table-column>
          <el-table-column prop="capital" label="充值金额/仲裁费用（元）">
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间">
          </el-table-column>
        </el-table>
        <el-pagination @current-change="pageNoChange" style="text-align: center;" :current-page="pageNo" :page-size="10" layout="total, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
    <userInfoForm ref="userInfoForm"></userInfoForm>
  </div>
</template>
<script>
import { api } from '@/api'
import userInfoForm from '@user/common/userInfoForm'
export default {
  components: {userInfoForm},
  data() {
    return {
      loading: false,
      userName: '',
      tableData: [],
      total: 0,
      pageNo: 1,
      balance: 0
    }
  },
  methods: {
    openUserInfo(){
      this.$refs.userInfoForm.openUserInfo()
    },
    modPass() {
      this.$router.push({
        path: 'updatePassword'
      })
    },
    pageNoChange(val){
      this.pageNo = val
      this.getUserPayment()
    },
    getUserPayment() {
      this.loading = true;
      api.getUserPayment({
        "detailName": this.userName,
        "pageNo": this.pageNo,
        "pageSize": 10
      }).then((res) => {
        this.loading = false;
        if (res.data.code == 1) {
          const data = res.data.data.list;
          data.forEach(item => {
            item.type = item.detailType==1?'充值':item.detailType==2?'缴费':'退费'
            item.code = item.arbNumber || item.arbTemporaryNumber
            item.capital = item.detailType==2?('-' + item.capital):('+' + item.capital)
          })
          this.tableData = data;
          this.total = res.data.data.total;
        } else {
          this.tableData = []
          this.total = 0
        }
      })
    },
    getUserReconciliation() {
      this.loading = true;
      api.getUserReconciliation({
        "capitalName": this.userName,
        "pageNo": 1,
        "pageSize": 10
      }).then((res) => {
        this.loading = false;
        if (res.data.code == 1) {
          const data = res.data.data;
          this.balance = data.remainSum
        }
      })
    }
  },
  mounted() {
    this.userName = this.$store.state.user.userName
    this.getUserPayment()
    this.getUserReconciliation()
  }
}

</script>
<style lang="scss" scoped>
.ly-head{
  height: 105px;
  border-radius: 2px;
  padding: 30px;
  background: #fff;
  border-bottom: solid 20px #f0f2f5;
  .user-info{
    margin-top: 20px;
    .money{
      float: right;
      text-align: right;
      p{
        color: #999;
        b{
          color: #333;
          font-size: 24px;
          font-weight: normal;
        }
        &+p{
          margin-top: 6px;
        }
      }
    }
    .user-actions{
      p{
        cursor: pointer;
        display: inline-block;
        font-size: 20px;
        color: #333;
      }
      .user-img{
        width: 56px;
        height: 56px;
        background: #1890FF;
        color: #fff;
        font-size: 20px;
        text-align: center;
        line-height: 56px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 15px;
        color: pointer;
      }
      .mod-pass{
        color: #169BD5;
        cursor: pointer;
        font-size: 14px;
        margin-left: 30px;
      }
    }
  }
}
.ly-body{
  overflow: auto;
  margin-top: 10px;
  &>h2{
    font-size: 16px;
    padding: 15px 20px;
    border-bottom: solid 1px #eee;
  }
  .table-container{
    padding: 20px;
  }
}
</style>
