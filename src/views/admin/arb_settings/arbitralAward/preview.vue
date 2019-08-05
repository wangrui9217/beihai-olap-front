<template>
  <el-dialog title="裁决书预览" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false"  @close="closeDialog">
    <ul class="g-arb_tabs">
      <li v-for="item in types" :key="item.value" :class="{'active': item.isActive}" @click="tabFilter(item.value)">
        <span>{{item.label}}</span>
      </li>
    </ul>
    <div class="ql-snow" style="min-height: 600px;">
      <div class="ql-editor" v-html="previewDataString"></div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
  	previewDialogVisible:Boolean,
  	previewData: Object
  },
  data() {
    return {
    	dialogVisible: false,
      previewDataString: '',
      activeType: '1',
      types: [{
        value: '1',
        label: '裁决书',
        isActive: true
      },{
        value: '2',
        label: '裁决书（包含答辩）'
      }]
    }
  },
  methods: {
  	closeDialog(){
  	  this.$emit('CB-dialog')
  	},
    tabFilter(val){
      this.activeType = val
      this.types.forEach((item, i) => {
        if(item.value === val){
          item.isActive = true
        }
        else if(item.isActive === true){
          item.isActive = false
        }
      })
      if(this.previewData.head === undefined){
        this.previewDataString = ''
      }
      else{
        if(this.activeType === '1'){
          this.previewDataString = `${this.previewData.head}${this.previewData.introduction}${this.previewData.coNameCause}${this.previewData.coNameProof}${this.previewData.arbDefendantNodefence}${this.previewData.tribunalFund}${this.previewData.tribunalOpinion}${this.previewData.arbitralAwards}${this.previewData.end}`
        }
        else{
          this.previewDataString = `${this.previewData.head}${this.previewData.introduction}${this.previewData.coNameCause}${this.previewData.coNameProof}${this.previewData.arbDefendantDefence}${this.previewData.arbDefendantProof}${this.previewData.tribunalFund}${this.previewData.tribunalOpinion}${this.previewData.arbitralAwards}${this.previewData.end}`
        }
      }
    },
  },
  watch: {
    previewDialogVisible(newVal) {
      this.dialogVisible = newVal
    },
    previewData(newVal) {
      this.tabFilter('1')
    },
  }
}

</script>
