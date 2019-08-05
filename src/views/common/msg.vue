<template>
  <div class="g-message" >
    <div class="message-inner">
      <div class="message-left" v-loading="loading">
        <el-tabs type="card" v-model="filter.type" @tab-click="handlefilter">
          <el-tab-pane label="全部" name="0" style="margin-bottom: 0">
            <div class="message-list">
              <div v-if="messagesAll.length === 0">暂无消息</div>
              <ul v-else>
                <li v-for="m in messagesAll" :class="{ 'unread':m.readType==2, 'clicked': m.clicked}" @click="openMessage(m,messagesAll)"><a >{{m.messageTitle}}</a> <span>{{m.createTime}}</span></li>
              </ul>
            </div>
            <div style="margin-top:10px;">
              <el-pagination class="g-pages" @current-change="handleCurrentChange" :current-page="currentPageAll" :page-size="pageSize" layout="total, prev, pager, next, jumper" :total="totalAll">
              </el-pagination>
            </div>
          </el-tab-pane>
          <el-tab-pane label="已读" name="1">
            <div class="message-list">
              <div v-if="messagesRead.length === 0">暂无消息</div>
              <ul v-else>
                <li v-for="m in messagesRead" :class="{'clicked': m.clicked}" @click="openMessage(m,messagesRead)"><a >{{m.messageTitle}}</a> <span>{{m.createTime}}</span></li>
              </ul>
            </div>
            <div style="margin-top:10px;">
              <el-pagination class="g-pages" @current-change="handleCurrentChange" :current-page="currentPageRead" :page-size="pageSize" layout="total, prev, pager, next, jumper" :total="totalRead">
              </el-pagination>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="unreadLabel" name="2">
            <div class="message-list">
              <div v-if="messagesUnread.length === 0">暂无消息</div>
              <ul v-else>
                <li v-for="m in messagesUnread" :class="{'unread':m.readType==2, 'clicked': m.clicked}" @click="openMessage(m,messagesUnread)"><a >{{m.messageTitle}}</a><span>{{m.createTime}}</span></li>
              </ul>
            </div>
            <div style="margin-top:10px;">
              <el-pagination class="g-pages" @current-change="handleCurrentChange" :current-page="currentPageUnread" :page-size="pageSize" layout="total, prev, pager, next, jumper" :total="unreadNumber">
              </el-pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="message-right" v-if="messageInfo.messageContent">
        <div class="f-detail" v-show="show">
          <h3>{{messageInfo.messageTitle}}</h3>
          <p v-html="messageInfo.messageContent"></p>
          <span @click="close" class="close-detail"><i class="el-icon-close"></i></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/api'
import { baseURL } from '@/config'

export default {
  data() {
    return {
      messagesAll: [],
      messagesUnread: [],
      messagesRead: [],
      currentPageAll: 1,
      currentPageRead: 1,
      currentPageUnread: 1,
      pageSize: 10,
      totalAll: 0,
      totalRead: 0,
      loading: false,
      filter: {
      	type: '0',
        pageNo: 1
      },
      messageInfo: {
        messageTitle: '',
        messageContent: ''
      },
      show: false,
      appName: baseURL
    }
  },
  computed: {
    unreadNumber() {
      return this.$store.state.unreadNumber
    },
    unreadLabel() {
      return `未读（${this.unreadNumber}）`
    }
  },
  methods: {
    getList() {
      var params = {
        pageSize: this.pageSize
      }
      Object.assign(params,this.filter)
      this.loading = true
      api.queryMessageListByType(params).then((res) => {
        this.loading = false
        if (res.data.code == '1') {
          const data = res.data.data;
          if(this.filter.type == '0'){
            this.messagesAll = data.list
            this.totalAll = data.total
          }
          else if(this.filter.type == '1'){
            this.messagesRead = data.list
            this.totalRead = data.total
          }
          else{
            this.messagesUnread = data.list
            this.$store.commit('setUnreadNumber', data.total)
          }
        }
        else{
          if(this.filter.type == '0'){
            this.messagesAll = []
            this.totalAll = 0
            this.$store.commit('setUnreadNumber', 0)
          }
          else if(this.filter.type == '1'){
            this.messagesRead = []
            this.totalRead = 0
          }
          else{
            this.messagesUnread = []
            this.$store.commit('setUnreadNumber', 0)
          }
        }
      })
    },
    handleCurrentChange(val) {
      if(this.filter.type == '0'){
        this.currentPageAll = val
      }
      else if(this.filter.type == '1'){
        this.currentPageRead = val
      }
      else{
        this.currentPageUnread = val
      }
      this.filter.pageNo = val
      this.getList()
    },
  	handlefilter(tab) {
      this.filter.pageNo = this.currentPageRead
      this.getList()
      this.close()
  	},
  	openMessage(m,array) {
      this.show = false
      m.clicked = true
      array.forEach((v) => {
        if(v.id != m.id){
          v.clicked = false
        }
      })
      if(m.message && m.message.messageContent){  // 判断是否有缓存
        setTimeout(()=>{
          this.show = true
          this.messageInfo = m.message
        },200)
        return false
      }
  		api.messageDetail({
        id: m.id
      }).then((res) => {
        if(res.data.code == '1'){
          
          this.show = true
          this.messageInfo = res.data.data
          this.messageInfo.messageContent = this.messageInfo.messageContent.replace(/^(.*<a\s)(href=\")(\/api.*)$/,'$1target="_blank" $2' + this.appName +'$3').replace(/font-size: 10\.5px;/g,'')
          m.message = this.messageInfo  // 缓存数据
          if(m.readType == 2){  // 未读数-1
            this.$store.commit('setUnreadNumber', this.unreadNumber-1)
            m.readType = 1
          }
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
  	},
    close(){
      this.show = false;
      this.messageInfo.messageContent = ''
    }
  },
  mounted() {
    this.getList()
  }
}

</script>
<style lang="scss" scoped>
/*.g-message {
 */
.message-inner{
  padding: 0 30px;
  display: flex;
  .message-left{
    flex: 1;
    width: 50%;
  } 
  .message-right{
    flex: 1;
    width: 50%;
  }
}
.el-tabs{
  height: 600px;
  overflow: auto;
}
.message-list{
  height: auto;
  min-height: 60px;
  &>div{
    border: solid 1px #e4e7ed;
    border-top: none;
    height: 59px;
    text-align: center;
    line-height: 59px;
    color: #aaa;
  }
  li{
    position: relative;
    line-height: 50px;
    font-size: 13px;
    height:50px;
    white-space: nowrap;
    padding-right: 140px;
    overflow: hidden;
    text-overflow:ellipsis;
    padding-left:15px;
    color: #666;
    cursor: pointer;
    &.unread{
      &:before{
        content: '';
        display:block;
        width: 5px;
        height: 5px;
        background: #f00;
        border-radius:50%;
        position: absolute;
        left:5px;
        top:50%;
        margin-top: -3px;
      }
    }
    &:hover{
      background: #f0f2f5;
    }
    &.clicked{
      color: #409EFF;
      background: rgba(240,242,245,0.4);
      &:hover{
        background: rgba(240,242,245,0.4);
      }
    }
  }
  li span{
    position: absolute;
    top: 0;
    right: 0;
    line-height: 50px;
    padding-right: 10px;
  }
}
.f-detail{
  height: 490px;
  margin-top: 40px;
  background: rgba(240,242,245,0.4);
  padding:20px;
  overflow: auto;
  font-size: 12px;
  position: relative;
  border-top: 1px solid #e4e7ed;
  .close-detail{
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    cursor: pointer;
  }
  h3{
    text-align: center;
    margin-top: 20px;
  }
  p{
    color: #666;
    font-size: 12px;
    margin-top: 20px;
    line-height: 30px;
    word-break:break-all;
    a{
      color:#2b85ff;
    }
  }
}
/*}*/
	
</style>

