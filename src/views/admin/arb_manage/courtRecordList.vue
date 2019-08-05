<template>
  <div class="g-listpage__style" v-loading.fullscreen="loading">
    <list-filter :filter-data="formInline" :searchFn="search" v-if="activeName === 'first'"></list-filter>
    <list-filter-court :filter-data="formInline2" :searchFn="search" v-if="activeName === 'second'"></list-filter-court>
    <template>
      <el-radio-group v-model="activeName" style="margin-bottom: 20px;" @change="handelChange">
        <el-radio-button label="first">独立开庭</el-radio-button>
        <el-radio-button label="second">合并开庭</el-radio-button>
      </el-radio-group>
    </template>
    <el-row v-show="activeName === 'first'">
      <el-col>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="60" label="序号">
          </el-table-column>
          <el-table-column label="案件编号" :show-overflow-tooltip="true" width="180">
            <template slot-scope="scope">
              <span class="revoke" @click="into(scope.row)">{{scope.row.code}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="arbName" :show-overflow-tooltip="true" label="案由">
          </el-table-column>
          <el-table-column prop="arbProsecutorName" :show-overflow-tooltip="true" label="申请人">
          </el-table-column>
          <el-table-column prop="arbProductName" :show-overflow-tooltip="true" label="产品类型">
          </el-table-column>
          <el-table-column prop="arbDefendantName" :show-overflow-tooltip="true" label="被申请人">
          </el-table-column>
          <el-table-column prop="createTime" :show-overflow-tooltip="true" label="申请时间">
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" label="操作">
            <template slot-scope="scope"><span class="g-link" @click="openReview(scope.row)">笔录录入</span></template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-table
      v-show="activeName === 'second'"
      :data="tableData2"
      style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table :data="props.row.arbitralInfos" border style="width: 100%">
            <el-table-column prop="arbNumber" :show-overflow-tooltip="true" label="案件编号">
              <template slot-scope="scope">
                <span class="revoke" @click="intoClone(scope.row)">{{scope.row.arbNumber}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="arbName" :show-overflow-tooltip="true" label="案由">
            </el-table-column>
            <el-table-column prop="prosecutorName" :show-overflow-tooltip="true" label="申请人">
            </el-table-column>
            <el-table-column prop="productName" :show-overflow-tooltip="true" label="产品类型">
            </el-table-column>
            <el-table-column prop="defendantName" :show-overflow-tooltip="true" label="被申请人">
            </el-table-column>
            <el-table-column prop="createTime" :show-overflow-tooltip="true" label="申请时间">
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="合并编号" :show-overflow-tooltip="true" width="180" prop="mergeArbNumber">
      </el-table-column>
      <el-table-column prop="prosecutorName" :show-overflow-tooltip="true" label="申请人">
      </el-table-column>
      <el-table-column prop="trialBeginTime" :show-overflow-tooltip="true" label="庭审开始时间">
      </el-table-column>
      <el-table-column prop="trialEndTime" :show-overflow-tooltip="true" label="庭审结束时间">
      </el-table-column>
      <el-table-column prop="trialComposition" :show-overflow-tooltip="true" label="仲裁庭组成">
        <template slot-scope="scope">
          <span v-if="scope.row.trialComposition === 1">独任</span>
          <span v-if="scope.row.trialComposition === 2">合议</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="操作">
        <template slot-scope="scope"><span class="g-link" @click="openReview2(scope.row)">笔录录入</span></template>
      </el-table-column>
    </el-table>

    <el-pagination class="pages" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-pageSize="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalNum">
    </el-pagination>

  </div>
</template>
<script>
import { api } from '@/api'
import listFilter from '@admin/listFilter'
import listFilterCourt from '@admin/listFilterCourt'
import util from '@/util/util'
export default {
  components: { listFilter, listFilterCourt },
  data() {
    return {
      formInline: {
        arbProductName: '',
        arbProsecutorName: '',
        arbDefendantName: '',
        arbNumber: '',
        arbName: '',
        startTime: '', //查询开始时间
        endTime: '' //查询end时间
      },
      formInline2: {
        arbMergeNumber: '',
        arbitratorName: '',
        beginTime: '',
        endTime: '',
        location: '',
        prosecutorName: ''
      },
      tableData: [], //表格数据
      tableData2: [],
      pageNo: 1,
      pageSize: 10, //每页多少条
      totalNum: 0,
      loading: false, //
      reviewDialogVisible: false,
      reviewTextarea: '',
      placeholder: '请输入理由（选填）',
      reviewRadio: '1',
      activeName: 'first'
    }
  },
  methods: {
    into(row) {
      let routeData = this.$router.resolve({
        name: "仲裁请求详情",
        query: {
          data: row.id
        }
      });
      window.open(routeData.href, '_blank');
    },
    intoClone(row) {
      let routeData = this.$router.resolve({
        name: "仲裁请求详情",
        query: {
          data: row.arbitralInfoId
        }
      });
      window.open(routeData.href, '_blank');
    },
    search() { //表单查询（搜索案件编号、案件名、申请人、被申请人。搜索字符长度不超过20个）
      this.pageNo = 1
      this.getArbitralInfosBySys();
    },
    pageSizeChange(val) {
      this.pageSize = val;
      this.getArbitralInfosBySys();
    },
    pageNoChange(val) {
      this.pageNo = val;
      this.getArbitralInfosBySys();
    },
    getArbitralInfosBySys(){
      if (this.activeName === 'first') {
        let params = Object.assign(this.formInline, {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          //arbStatus: 9
        })
        this.loading = true
        api.getTribunalRecordArbitralInfos(params).then(res => {
          this.loading = false
          if(res.data.code === '1'){
            let tableData = res.data.list
            tableData.forEach( v => {
              v.code = v.arbNumber || v.arbTemporaryNumber
              v.status = util.getStatus(v.arbStatus)

            })
            this.tableData = tableData
            this.totalNum = res.data.total
          }
          else{
            this.tableData = []
            this.totalNum = 0
          }
        })
      } else {
        let params = {...this.formInline2, ...{pageNo: this.pageNo, pageSize: this.pageSize}}
        this.getTribunalMergeRecordArbitralInfos(params)
      }
    },
    getTribunalMergeRecordArbitralInfos (params) {
      this.loading = true
      api.getTribunalMergeRecordArbitralInfos(params).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          let tableData = res.data.list
          tableData.forEach( v => {
            v.code = v.arbNumber || v.arbTemporaryNumber
            v.status = util.getStatus(v.arbStatus)
          })
          this.tableData2 = tableData
          this.totalNum = res.data.total
        } else {
          this.tableData2 = []
          this.totalNum = 0
        }
      }).catch(() => {
        this.loading = false
      })
    },
    openReview(row){
      this.$router.push({
        path: 'courtRecordDetail',
        query: {
          data: row.id
        }
      })
    },
    openReview2(row){
      this.$router.push({
        path: 'courtRecordTotalDetail',
        query: {
          data: row.id
        }
      })
    },
    handelChange () {
      this.getArbitralInfosBySys()
    }
  },
  created(){
    this.getArbitralInfosBySys()
  }
}

</script>
<style lang="scss" scoped>
.revoke {
  color: #409EFF;
  cursor: pointer;
}

</style>
