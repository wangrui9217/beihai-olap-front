<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="4">
          <div class="logo"><img src="../../assets/logo.jpg">北海国际仲裁院</div>
        </el-col>
        <el-col :span="15" class="headerLogin_nav">
          <div
            :class="{active : activeIndex == index}"
            @click="goleftnav(item)"
            v-for="(item, index) in menulist"
            :key="item.name"
          >{{item.name}}</div>
        </el-col>
        <el-col :span="5" style="text-align:right">
          <div class="btnwork">
            <span>欢迎登录，<label>{{user_fullname}}</label></span>
            <a style="cursor:pointer;margin-right:20px;display: inline-block;vertical-align: bottom;" @click="goMsg()"><el-badge :value="unreadNO" :hidden="!unreadNO" :max="99"><i class="fa fa-bullhorn" aria-hidden="true"></i>我的消息</el-badge></a>
            <a style="cursor:pointer" @click.prevent="logout"><i class="fa fa-power-off" aria-hidden="true"></i>退出</a>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside width="200px" style="background-color:#22345E">
        <el-menu text-color="#fff" :router="true" :default-active="mapActivePath || $route.path" class="g-el-menu" :unique-opened="true">
          <!--menulist-->
          <div v-for="b in menulistFilters">
            <el-submenu v-if="b.type==0" :index="'' + b.menuId" >
              <template slot="title">
                <i :class="b.icon"></i>
                <span>{{b.name}}</span>
              </template>
              <div v-for="c in b.list">
                <el-submenu v-if="c.type==0" :index="'' + c.menuId" >
                  <template slot="title">
                    <i class="el-icon-location"></i>
                    <span>{{c.name}}</span>
                  </template>
                  <div v-for="d in c.list">
                    <el-submenu v-if="d.type==0" :index="'' + d.menuId">
                      <template slot="title">
                        <i class="el-icon-location"></i>
                        <span>{{d.name}}</span>
                      </template>
                    </el-submenu>
                    <el-menu-item v-if="d.type==1" :index="d.url" :key="d.menuId">
                      <template slot="title">{{d.name}}</template>
                    </el-menu-item>
                  </div>
                </el-submenu>
                <el-menu-item v-if="c.type==1" :index="c.url" :key="c.menuId" >
                  <template slot="title">{{c.name}}</template>
                </el-menu-item>
              </div>
            </el-submenu>
            <el-menu-item v-if="b.type==1" :index="b.url" :key="b.menuId">
              <template slot="title">{{b.name}}</template>
            </el-menu-item>
          </div>
          <!-- <el-submenu index="213">
            <template slot="title">
              <i class="fa fa-rmb fa-fw"></i>
              <span>案件管理</span>
            </template>
            <el-menu-item index="/admin/manage/queryArbitral">
              <template slot="title">案件查询</template>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="2222">
            <template slot="title">
              <i class="fa fa-rmb fa-fw"></i>
              <span>立案管理</span>
            </template>
            <el-menu-item index="/admin/audit/auditJurisdiction/auditJurisdictionList">
              <template slot="title">审核管辖权</template>
            </el-menu-item>
            <el-menu-item index="/admin/manage/notice">
              <template slot="title">立案送达</template>
            </el-menu-item>
            <el-menu-item index="/admin/manage/reply">
              <template slot="title">案件答辩</template>
            </el-menu-item>
          </el-submenu> -->
        </el-menu>
      </el-aside>
      <el-main class="admin_main">
        <breadcrumb></breadcrumb>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import { api } from '@/api'
import breadcrumb from '@/views/common/breadcrumb'
export default {
  components: { breadcrumb },
  data() {
    return {
      menulist: [],
      msgRedShow: false,
      active: '',
      menulistFilters: [],
      activeIndex: -1,
      mapRoutes: [{path: '/admin/dissent/dissentCheck', list: [{path: '/admin/dissent/dissentCheckDetail'}]}, {
        path: '/admin/court/courtRecordList', list: [{path: '/admin/court/courtRecordDetail'}, {path: '/admin/court/courtRecordTotalDetail'}]}, {
          path: '/admin/dissent/dissentVerify', list: [{path: '/admin/dissent/dissentVerifyDetail'}]}, {
            path: '/admin/dissent/dissentReview', list: [{path: '/admin/dissent/dissentReviewDetail'}]}, {
              path: '/admin/court/courtInfo', list: [{path: '/admin/audit/auditData/auditDataDetail'}]}, {
                path: '/admin/manage/proofread/verifyList', list: [{path: '/admin/manage/proofread/verifyDetail'}]}, {
                  path: '/admin/audit/auditArbitralAward/auditArbitralAwardList', list: [{path: '/admin/audit/auditArbitralAward/auditArbitralAwardDetail'}]}, {
                    path: '/admin/manage/proofread/proofreadList', list: [{path: '/admin/manage/proofread/proofreadDetail'}]}, {
                      path: '/admin/manage/dissent/dissentReviewList', list: [{path: '/admin/manage/dissent/dissentReviewItemDetail'}]}, {
                        path: '/admin/audit/auditJurisdiction/auditJurisdictionList', list: [{path: '/admin/audit/auditJurisdiction/auditJurisdictionDetail'}]}],
      mapActivePath: ''
    }
  },
  computed: {
    user_fullname(){
      return this.$store.state.admin.adminName
    },
    unreadNO(){
      return this.$store.state.unreadNumber
    },
  },
  watch: {
    $route: {
      handler (to, from) {
        this.refreshLeftMenu(to.path)
      },
      deep: true
    }
  },
  methods: {
    // 根据path返回所属的单元和左侧菜单
    refreshLeftMenu (Path) {
      let path = ''
      this.mapActivePath = ''
      this.mapRoutes.map(value => {
        value.list.map(val => {
          if (val.path === Path) {
            this.mapActivePath = value.path
          }
        })
      })
      path = this.mapActivePath || Path
      this.menulist.map((value, index) => {
        if (value.list.length === 0) {
          return
        }
        value.list.map(val => {
          if (val.list instanceof Array && val.list.length > 0) {
            val.list.map(v => {
              if (v.url === path) {
                this.menulistFilters = value.list
                this.activeIndex = index
              }
            })
          } else {
            if (val.url === path) {
              this.menulistFilters = value.list
              this.activeIndex = index
            }
          }
        })
      })
      console.log(this.activeIndex, '============activeIndex=========')
    },
    goleftnav(item) {
      console.log(item)
      let path = ''
      if (item.list.length === 0) {
        path = item.url
      } else if (!item.list[0].list || (item.list[0].list instanceof Array && item.list[0].list.length === 0)) {
        path = item.list[0].url
      } else {
        path = item.list[0].list[0].url
      }
      console.log(path, 'path')
      this.$router.push({ path })
    },
    msgUnread() {
      var params = {
        pageSize: 10,
        type: 2,
        pageNo: 1
      }
      api.queryMessageListByType(params).then((res) => {
        if (res.data.code == '1') {
          let data = res.data.data
          let msglenth = data.total;
          if (msglenth > 0) {
            this.$store.commit('setUnreadNumber', msglenth)
          }
        }
        else{
          this.$store.commit('setUnreadNumber', 0)
        }
      })
    },
    logout() {
      api.sysLogout().then(res => {
        this.$store.commit('set_admin_token','')
        this.$router.push({
          path: '/arbLogin'
        })
      })
    },
    getMenu() {
      api.menulists().then((res) => {
        if(res.data.code === '1'){
          this.menulist = res.data.data;
          this.refreshLeftMenu(this.$route.path)
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    goMsg() {
      this.$router.push({ path: '/admin/manage/adminMsg' })
    }
  },
  mounted() {
    this.getMenu();
    this.msgUnread();
  }
};

</script>
<style scoped lang="scss">
  .headerLogin_nav{
    display: flex;
    height: 60px;
    &>div{
      cursor: pointer;
      box-sizing: border-box;
      line-height: 60px;
      height: 100%;
      padding: 0 10px;
      margin: 0 10px;
      &:hover{
        color: #409EFF;
        border-bottom: 3px solid #409EFF;
      }
    }
    .active{
      color: #409EFF;
      border-bottom: 3px solid #409EFF;
    }
  }
.admin_main{
  /*min-width: 1160px;*/
  min-width: 1300px;
  background: #fff;
  padding: 20px 0 0;
}
.el-header{
  min-width: 1500px;
	border-bottom: solid 1px #DCE3E9;
	background-color: #fff;
	padding: 0 20px;
	box-sizing: border-box;
	z-index: 1;
}
.logo{
  line-height: 60px;
  font-size: 20px;
  color: #363D4D;
  img{
    height: 35px;
    width: auto;
    vertical-align: middle;
    margin-right: 5px;
  }
}
.btnwork {
  line-height: 24px;
  padding: 20px 0;
  span {
    display: inline-block;
  }
  label {
    margin: 0 5px;
  }
  a {
    margin: 0 5px;
  }
  i {
    margin-right: 5px;
  }
}
</style>
