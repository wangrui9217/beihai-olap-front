<template>
  <div v-loading.fullscreen="loading">
    <div class="header">
      <el-button type="default" @click="$router.go(-1)">返回</el-button>
      <el-button type="primary" @click="submit()">保存并确认</el-button>
    </div>
    <div style="margin-top:-32px"></div>
    <div class="g-listpage__style">
      <el-card class="g-box-card" style="margin-top: 0">
        <div slot="header">
          <span>基本信息</span>
        </div>
        <el-form :inline="true" :model="template" ref="template">
          <el-form-item label="模板名称" prop="templateName" :rules="{required: true, message: '请填写模板名称'}" style="margin-right: 50px">
            <el-input v-model="template.templateName" :maxLength="100"></el-input>
          </el-form-item>
          <el-form-item label="引用计算公式" prop="arbitralAdvanceConfigureId" :rules="{required: true, message: '请选择计算公式'}">
            <el-select v-model="template.arbitralAdvanceConfigureId">
              <el-option v-for="item in formula" :value="item.id" :label="item.contractName" :key="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="模板原型" v-if="!id">
            <el-select v-model="myPrototype" @change="getPrototype">
              <el-option value="1" label="基础原型"></el-option>
              <el-option value="2" label="钱多多原型"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="g-box-card">
        <div slot="header" class="actions">
          <span class="link" @click="preview()">预览裁决书</span>
          <span>模板内容</span>
          <span>（注：<i class="c-black">“黑色”</i>字为可编辑，<i class="c-red">“红色”</i>字为变量，<i class="c-blue">“蓝色”</i>字为不可编辑）</span>
        </div>
        <div>
          <ul class="g-arb_tabs">
            <li v-for="item in arbTypes" :key="item.value" :class="{'active': item.isActive}" @click="tabFilter(item.value)">
              <span>{{item.label}}</span>
            </li>
          </ul>
          <div v-show="arbType === '1'">
            <h3>首部</h3>
            <quill-editor
              v-model="params.head"
              ref="headEditor"
              :options="editorOption"
              @change="onEditorChange($event)">
            </quill-editor>
            <h3>引言</h3>
            <quill-editor
              v-model="params.introduction"
              ref="introductionEditor"
              :options="editorOption"
              @change="onEditorChange($event)">
            </quill-editor>
          </div>
          <div v-show="arbType === '2'">
            <h3>申请人陈述</h3>
            <quill-editor
              v-model="params.coNameCause"
              ref="coNameCauseEditor"
              :options="editorOption"
              @change="onEditorChange($event)">
            </quill-editor>
            <h3>申请人举证</h3>
            <quill-editor
              v-model="params.coNameProof"
              ref="coNameProofEditor"
              :options="editorOption"
              @change="onEditorChange($event)">
            </quill-editor>
            <h3>被申请人（未答辩）</h3>
            <quill-editor
              v-model="params.arbDefendantNodefence"
              ref="arbDefendantNodefenceEditor"
              :options="editorOption"
              @change="onEditorChange($event)">
            </quill-editor>
            <h3>被申请人-答辩</h3>
            <quill-editor
              v-model="params.arbDefendantDefence"
              ref="arbDefendantDefenceEditor"
              :options="editorOption"
              @change="onEditorChange($event)">
            </quill-editor>
            <h3>被申请人-举证</h3>
            <quill-editor
              v-model="params.arbDefendantProof"
              ref="arbDefendantProofEditor"
              :options="editorOption"
              @change="onEditorChange($event)">
            </quill-editor>
            <h3>仲裁庭查明</h3>
            <quill-editor
              v-model="params.tribunalFund"
              ref="tribunalFundEditor"
              :options="editorOption"
              @change="onEditorChange($event)">
            </quill-editor>
          </div>
          <div v-show="arbType === '3'">
            <h3>仲裁庭意见</h3>
              <quill-editor
              v-model="params.tribunalOpinion"
              @change="onEditorChange($event)"
              :options="anotherOption1" >
                <div id="toolbar1" slot="toolbar">
                  <!-- Add a bold button -->
                  <button class="ql-bold">Bold</button>
                  <button class="ql-italic">Italic</button>
                  <button class="ql-underline">underline</button>
                  <button class="ql-strike">strike</button>
                  <select class="ql-size">
                    <option value="erhao"></option>
                    <!-- Note a missing, thus falsy value, is used to reset to default -->
                    <option value="xiaoer"></option>
                    <option value="sanhao"></option>
                    <option value="xiaosan"></option>
                  </select>
                  <select class="ql-font">
                    <option value="SimSun"></option>
                    <option value="FangSong"></option>
                    <option value="SimHei"></option>
                    <option value="Microsoft-YaHei"></option>
                  </select>
                  <select class="ql-align">
                    <option selected></option>
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                  </select>
                  <select class="ql-color">
                    <option value="#fff"></option>
                    <option value="#e60000"></option>
                  </select>
                  <select class="ql-background">
                    <option value="#fff"></option>
                    <option value="#e60000"></option>
                  </select>
                  <!-- You can also add your own -->
                  <button class="custom-button" :class="{'active':buttonValue1=='年'}" @click="customButtonClick1('年')">[年利率]</button>
                  <button class="custom-button" :class="{'active':buttonValue1=='月'}" @click="customButtonClick1('月')">[月利率]</button>
                  <button class="custom-button" :class="{'active':buttonValue1=='日'}" @click="customButtonClick1('日')">[日利率]</button>
                </div>
              </quill-editor>
          </div>
          <div v-show="arbType === '4'">
            <h3>裁决</h3>
            <quill-editor
              v-model="params.arbitralAwards"
              @change="onEditorChange($event)"
              :options="anotherOption2" >
              <div id="toolbar2" slot="toolbar">
                <!-- Add a bold button -->
                <button class="ql-bold">Bold</button>
                <button class="ql-italic">Italic</button>
                <button class="ql-underline">underline</button>
                <button class="ql-strike">strike</button>
                <select class="ql-size">
                  <option value="erhao"></option>
                  <!-- Note a missing, thus falsy value, is used to reset to default -->
                  <option value="xiaoer"></option>
                  <option value="sanhao"></option>
                  <option value="xiaosan"></option>
                </select>
                <select class="ql-font">
                  <option value="SimSun"></option>
                  <option value="FangSong"></option>
                  <option value="SimHei"></option>
                  <option value="Microsoft-YaHei"></option>
                </select>
                <select class="ql-align">
                  <option selected></option>
                  <option value="center"></option>
                  <option value="right"></option>
                  <option value="justify"></option>
                </select>
                <select class="ql-color">
                  <option value="#e60000"></option>
                  <option value="#fff"></option>
                </select>
                <select class="ql-background">
                  <option value="#e60000"></option>
                  <option value="#fff"></option>
                </select>
                <!-- You can also add your own -->
                <button class="custom-button" :class="{'active':buttonValue2=='年'}" @click="customButtonClick2('年')">[年利率]</button>
                <button class="custom-button" :class="{'active':buttonValue2=='月'}" @click="customButtonClick2('月')">[月利率]</button>
                <button class="custom-button" :class="{'active':buttonValue2=='日'}" @click="customButtonClick2('日')">[日利率]</button>
              </div>
            </quill-editor>
            <h3>尾部</h3>
            <quill-editor
              v-model="params.end"
              ref="endEditor"
              :options="editorOption"
              @change="onEditorChange($event)">
            </quill-editor>
          </div>
        </div>
      </el-card>
    </div>

    <!--预览-->
    <preview :previewDialogVisible="previewDialogVisible" @CB-dialog="CB_dialog" :previewData="previewData"></preview>
  </div>
</template>
<script>
import preview from './preview'
import { api } from '@/api'
import util from '@/util/util'
export default {
  components: {preview},
  data() {
    return {
      members: ['年','月','日'],
      loading: false,
      previewDialogVisible: false,
      previewData: {},
      template: {
        templateName: '',
        arbitralAdvanceConfigureId: ''
      },
      id: '',
      buttonValue1: '年',
      buttonValue2: '年',
      formula: [],
      editorOption:{
        placeholder: "输入内容",
        modules:{
          toolbar:[
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'size': this.GLOBAL.fontsizes }],
            [{ 'font': this.GLOBAL.fonts }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
          ]
        }
      },
      anotherOption1: {
        placeholder: "输入内容",
        modules: {
          toolbar: '#toolbar1'
        }
      },
      anotherOption2: {
        placeholder: "输入内容",
        modules: {
          toolbar: '#toolbar2'
        }
      },
      arbTypes: [
        {
          isActive: true,
          value: '1',
          label: '首部及引言'
        },{
          isActive: false,
          value: '2',
          label: '案情'
        },{
          isActive: false,
          value: '3',
          label: '仲裁庭意见'
        },{
          isActive: false,
          value: '4',
          label: '裁决及尾部'
        }
      ],
      arbType: '1',
      myPrototype: '2',
      originPrototype: {
        // 模板首部
        head: '<p class="ql-align-center"><span class="ql-font-SimSun ql-size-erhao ql-ssss">北海国际仲裁院</span></p><p class="ql-align-center"><span class="ql-font-SimSun ql-size-erhao">裁决书</span></p><p class="ql-align-right"><span>&nbsp;</span><span class="ql-font-FangSong ql-size-xiaosan" style="color: rgb(230, 0, 0);">*案件编号*</span></p><p class="ql-align-center"><br></p>',
        // 模板引言
        introduction: '<p><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(24, 144, 230);">&nbsp;&nbsp;&nbsp;&nbsp;申请人：</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*公司名称*，*公司地址*，*法定代表人*，*职务*</span><span class="ql-size-xiaosan ql-font-FangSong">。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(24, 144, 230);">&nbsp;&nbsp;&nbsp;&nbsp;被申请人：</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*姓名*，*性别*，*出生年月*，*身份证号码*，*住址*</span></p><p><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(24, 144, 230);">&nbsp;&nbsp;&nbsp;&nbsp;北海国际仲裁院</span><span class="ql-size-xiaosan ql-font-FangSong">（以下简称本院）根据申请人提交的《仲裁申请书》，以及申请人与被申请人签订的《</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*签订合同名称*</span><span class="ql-size-xiaosan ql-font-FangSong">》的仲裁条款，于</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*申请日期*</span><span class="ql-size-xiaosan ql-font-FangSong">受理当事人双方之间的“</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*案由*</span><span class="ql-size-xiaosan ql-font-FangSong">”案。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;根据《</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*签订合同名称*</span><span class="ql-size-xiaosan ql-font-FangSong">》的约定，本案适用简易程序书面审理。根据本院院长指定,本案依法组成</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*案件仲裁员*</span><span class="ql-size-xiaosan ql-font-FangSong">为仲裁员的独任仲裁庭，并指定</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*办案秘书*</span><span class="ql-size-xiaosan ql-font-FangSong">担任秘书。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;仲裁庭依法对本案进行书面审理。本案现已审理终结。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;现就本案案情和仲裁庭意见及裁决分述如下：</span></p>',
        // 申请人陈述
        coNameCause: '<p class="ql-align-center"><br></p><p class="ql-align-center"><span class="ql-size-sanhao ql-font-SimSun">一、案情</span></p><p><span class="ql-font-FangSong ql-size-xiaosan" style="color: rgb(230, 0, 0);">&nbsp;&nbsp;&nbsp;&nbsp;*事实与理由*</span></p><p><span class="ql-font-FangSong ql-size-xiaosan">&nbsp;&nbsp;&nbsp;&nbsp;申请人仲裁请求:</span></p><p><span class="ql-font-FangSong ql-size-xiaosan" style="color: rgb(230, 0, 0);">&nbsp;&nbsp;&nbsp;&nbsp;*仲裁请求（仲裁申请书）*</span></p>',
        // 申请人举证
        coNameProof: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;申请人举证如下：</span></p><p><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;*申请人证据说明*</span></p>',
        // 被申请人（未答辩）
        arbDefendantNodefence: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;被申请人未在答辩期内提交书面答辩状及证据,也未对申请人的证据提出异议,仲裁庭经审查对上述证据予以确认。</span></p>',
        // 被申请人-答辩
        arbDefendantDefence: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;被申请人称：</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*答辩内容*</span></p>',
        // 被申请人-举证
        arbDefendantProof: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;被申请人举证如下：</span></p><p><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;*被申请人证据*</span></p>',
        // 仲裁庭查明
        tribunalFund: '<p><span class="ql-font-FangSong ql-size-xiaosan">&nbsp;&nbsp;&nbsp;&nbsp;仲裁庭查明的事实与申请人的仲裁请求所述基本一致。</span></p>',
        // 仲裁庭意见
        tribunalOpinion: '<p class="ql-align-center"><br></p><p class="ql-align-center"><span class="ql-size-sanhao ql-font-SimSun">二、仲裁庭意见</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;仲裁庭认为:申请人与被申请人一签订的</span><span style="color: rgb(0, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">《</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*借款合同*</span><span style="color: rgb(0, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">》</span><span class="ql-size-xiaosan ql-font-FangSong">是双方当事人的真实意思表示，内容没有违反法律、行政法规的禁止性规定，应认定合法有效，对双方当事人均具有约束力。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;根据申请人提供的</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*申请人证据*</span><span class="ql-size-xiaosan ql-font-FangSong">等证据，认定被申请人一现仍拖欠申请人</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*剩余本金*</span><span class="ql-size-xiaosan ql-font-FangSong">元。由于被申请人逾期未还款，已构成违约，根据合同法有关规定应承担违约责任，参照《最高人民法院关于审理民间借贷案件适用法律若干问题的规定》第二十九条规定：“借贷双方对逾期利率有约定的，从其约定，但以不超过年利率24%为限”，申请人主张以年利率24%计算罚息符合法律规定，故仲裁庭认为被申请人一应以未偿还借款本金为基数，按年利率24%的标准，从逾期还款之日起至借款本金清偿之日止向申请人支付罚息。其中，计至</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*还款到期日*</span><span class="ql-size-xiaosan ql-font-FangSong">的利息金额为</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*利息*</span><span class="ql-size-xiaosan ql-font-FangSong">元。罚息，以</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*剩余本金*</span><span class="ql-size-xiaosan ql-font-FangSong">元为基数，按<span style="color: rgb(230, 230, 230); background-color: rgb(230, 0, 0);" >*日*</span>利率</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*逾期利率*</span><span class="ql-size-xiaosan ql-font-FangSong">的标准，自</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*还款到期日+1*</span><span class="ql-size-xiaosan ql-font-FangSong">起计算至借款本金清偿之日止。</span></p>',
        // 裁决
        arbitralAwards: '<h2 class="ql-align-center"><br></h2><h2 class="ql-align-center"><span class="ql-font-SimSun ql-size-sanhao">三、裁决</span></h2><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;依照《中华人民共和国合同法》第一百零七条、第二百零五条、第二百零六条、第二百零七条和《中华人民共和国仲裁法》第三十九条之规定，仲裁庭裁决如下:</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;一、被申请人应在本裁决书送达后10日内向申请人偿还借款本息</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*剩余本金+利息*</span><span class="ql-size-xiaosan ql-font-FangSong">元、罚息(罚息:从</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*还款到期日+1*</span><span class="ql-size-xiaosan ql-font-FangSong">起的罚息，以本金</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*剩余本金*</span><span class="ql-size-xiaosan ql-font-FangSong">元为基数按照<span style="color: rgb(230, 230, 230); background-color: rgb(230, 0, 0);">*日*</span>利率</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*逾期利率*</span><span class="ql-size-xiaosan ql-font-FangSong">标准计算至借款本金清偿之日止)</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*罚息*</span><span class="ql-size-xiaosan ql-font-FangSong">元。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;二、本案仲裁费用</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*仲裁费用*</span><span class="ql-size-xiaosan ql-font-FangSong">元由被申请人承担，申请人已垫付，被申请人在履行上述义务时一并支付给申请人。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;如义务人未能按本裁决指定的期间履行给付金钱的义务，应当依照《中华人民共和国民事诉讼法》第二百五十三条之规定加倍支付迟延履行期间的债务利息。权利人可在本裁决规定的履行期限最后一日起两年内，向有管辖权的人民法院申请强制执行。</span></p>',
        // 尾部
        end: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;本裁决为终局裁决，自作出之日起即发生法律效力。</span></p><p><br></p><p><br></p><p class="ql-align-center ql-indent-6"><span class="ql-size-xiaosan ql-font-FangSong">独任仲裁员:</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*案件仲裁员*</span></p><p><br /></p><p class="ql-align-center ql-indent-6"><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*时间*</span></p><p><br /></p><p class="ql-align-center ql-indent-6"><span class="ql-font-FangSong ql-size-xiaosan">办案秘书:</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">&nbsp;*办案秘书*</span></p><p class="ql-indent-1"><br></p>'
      },
      qianduoduo: {
        // 模板首部
        head: '<p class="ql-align-center"><span class="ql-font-SimSun ql-size-erhao">北海国际仲裁院<br/>裁决书</span></p><p class="ql-align-right"><span>&nbsp;</span><span class="ql-font-FangSong ql-size-xiaosan" style="color: rgb(230, 0, 0);">*案件编号*</span></p><p class="ql-align-center"><br></p>',
        // 模板引言
        introduction: '<p><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(24, 144, 230);">&nbsp;&nbsp;&nbsp;&nbsp;申请人：</span><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(230, 0, 0);">*公司名称*</span><span class="ql-size-xiaosan ql-font-FangSong">，统一社会信用代码：</span><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(230, 0, 0);">*社会信用代码*</span><span class="ql-size-xiaosan ql-font-FangSong">，公司地址：</span><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(230, 0, 0);">*公司地址*</span><span class="ql-size-xiaosan ql-font-FangSong">，送达地址：</span><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(230, 0, 0);">*送达地址*</span><span class="ql-size-xiaosan ql-font-FangSong">。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(24, 144, 230);">&nbsp;&nbsp;&nbsp;&nbsp;被申请人：</span><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(230, 0, 0);">*姓名*，*性别*，*民族*，*出生日期*</span><span class="ql-size-xiaosan ql-font-FangSong">，身份证号码：</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*身份证号码*</span><span class="ql-size-xiaosan ql-font-FangSong">，联系电话：</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*手机号*</span><span class="ql-size-xiaosan ql-font-FangSong">。户籍地址：</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*户籍地址*</span><span class="ql-size-xiaosan ql-font-FangSong">。约定送达地址：</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*约定送达地址*</span><span class="ql-size-xiaosan ql-font-FangSong">。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong" style="color: rgb(24, 144, 230);">&nbsp;&nbsp;&nbsp;&nbsp;北海国际仲裁院</span><span class="ql-size-xiaosan ql-font-FangSong">（以下简称本院）根据申请人提交的《仲裁申请书》，出借人</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*具体借款人姓名*</span><span class="ql-size-xiaosan ql-font-FangSong">与被申请人签订的《</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*签订合同名称*</span><span class="ql-size-xiaosan ql-font-FangSong">》约定的仲裁条款，案外人</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*具体借款人姓名*</span><span class="ql-size-xiaosan ql-font-FangSong">和案外人全浩商业保理（上海）有限公司签订的《债权转让协议》，以及案外人全浩商业保理（上海）有限公司和申请人签订的《债权转让协议》，于</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*缴费日期*</span><span class="ql-size-xiaosan ql-font-FangSong">受理当事人双方之间的民间借贷纠纷案。同日，本院向申请人送达缴费通知书、仲裁案件受理通知书、举证通知书、仲裁风险提示书、仲裁权利和义务告知书、仲裁规则、仲裁员名册，向被申请人送达仲裁案件通知书、仲裁申请书副本及证据、举证通知书、仲裁权利义务告知书、仲裁规则、仲裁员名册。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;根据《借款协议》的约定，本案委托本院院长指定仲裁员，适用简易程序书面审理。根据本院院长指定本案依法组成以</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*仲裁员*</span><span class="ql-size-xiaosan ql-font-FangSong">为仲裁员的独任仲裁庭，由</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*办案秘书*</span><span class="ql-size-xiaosan ql-font-FangSong">担任办案秘书。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;仲裁庭依法对本案进行书面审理。本案现已审理终结。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;现就本案案情和仲裁庭意见及裁决分述如下：</span></p>',
        // 申请人陈述
        coNameCause: '<p class="ql-align-center"><br></p><p class="ql-align-center"><span class="ql-size-sanhao ql-font-SimSun">一、案情</span></p><p><span class="ql-font-FangSong ql-size-xiaosan" style="color: rgb(230, 0, 0);">&nbsp;&nbsp;&nbsp;&nbsp;*事实与理由*</span></p><p><span class="ql-font-FangSong ql-size-xiaosan">&nbsp;&nbsp;&nbsp;&nbsp;申请人仲裁请求:</span></p><p><span class="ql-font-FangSong ql-size-xiaosan" style="color: rgb(230, 0, 0);">&nbsp;&nbsp;&nbsp;&nbsp;*仲裁请求（仲裁申请书）*</span></p>',
        // 申请人举证
        coNameProof: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;申请人举证如下：</span></p><p><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;*申请人证据说明*</span></p>',
        // 被申请人（未答辩）
        arbDefendantNodefence: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;被申请人未在约定及规定期限内提交书面答辩状及证据，亦未对申请人的证据提出书面质证意见，视为放弃相关权利。仲裁庭经审查对上述证据予以认定。</span></p>',
        // 被申请人-答辩
        arbDefendantDefence: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;被申请人称：</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*答辩内容*</span></p>',
        // 被申请人-举证
        arbDefendantProof: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;被申请人举证如下：</span></p><p><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;*被申请人证据*</span></p>',
        // 仲裁庭查明
        tribunalFund: '<p><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">&nbsp;&nbsp;&nbsp;&nbsp;*借款日期*</span><span class="ql-font-FangSong ql-size-xiaosan">，被申请人通过 “钱多多”平台，与出借人</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*申请人*</span><span class="ql-font-FangSong ql-size-xiaosan">签署</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*具体份数*</span><span class="ql-font-FangSong ql-size-xiaosan">份《借款协议》，对应编号为：</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*具体编号*（格式详见例中证据1）</span><span class="ql-font-FangSong ql-size-xiaosan">，合计借款本金</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*本金*</span><span class="ql-font-FangSong ql-size-xiaosan">元，约定</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*年*</span><span class="ql-font-FangSong ql-size-xiaosan">化利率为</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*逾期利率* </span><span class="ql-font-FangSong ql-size-xiaosan">，借款期限自</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*部分还款日+1*</span><span style="color: rgb(0, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">至</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*XXXX年XX月XX日（未还利息具体期限）*</span><span class="ql-font-FangSong ql-size-xiaosan">，还款方式为按月付息，到期一次性还本并支付剩余利息。同时，出借人和借款人约定逾期还款违约金为</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*逾期日利息*</span><span class="ql-font-FangSong ql-size-xiaosan">。</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*XXXX年XX月XX日（转账日期）*</span><span class="ql-font-FangSong ql-size-xiaosan">，上述出借人通过</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*转账银行*</span><span class="ql-font-FangSong ql-size-xiaosan">向被申请人</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*被申请人银行账户号*</span><span class="ql-font-FangSong ql-size-xiaosan">的银行账户分别支付</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*每位借款人具体转账金额*</span><span class="ql-font-FangSong ql-size-xiaosan">，合计</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*本金*</span><span class="ql-font-FangSong ql-size-xiaosan">元。</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*XXXX年XX月XX日（违约日期）*</span><span class="ql-font-FangSong ql-size-xiaosan">，被申请人未在协议约定的期限内支付借款利息。</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*XXXX年XX月XX日（催收日期）*</span><span class="ql-font-FangSong ql-size-xiaosan">，“钱多多”平台受出借人委托向被申请人发送催收函，要求被申请人根据借款协议，提前归还本金、偿付利息及支付违约金。截止申请人提起仲裁之日，被申请人尚欠本金</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*本金*</span><span class="ql-font-FangSong ql-size-xiaosan">元，利息</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*利息*</span><span class="ql-font-FangSong ql-size-xiaosan">元，本金逾期违约金</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*逾期金额*</span><span class="ql-font-FangSong ql-size-xiaosan">元，利息逾期违约金</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*逾期利息*</span><span class="ql-font-FangSong ql-size-xiaosan">元。</span></p><p><span class="ql-font-FangSong ql-size-xiaosan">&nbsp;&nbsp;&nbsp;&nbsp;另查明，</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*XXXX年XX月XX日（第一次债权转让日期）*</span><span class="ql-font-FangSong ql-size-xiaosan">，出借人</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*具体借款人姓名*</span><span class="ql-font-FangSong ql-size-xiaosan">分别于全浩商业保理（上海）有限公司签订《债权转让协议》，编号为：</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*具体编号*（格式详见例中证据4）</span><span class="ql-font-FangSong ql-size-xiaosan">。后全浩公司将上述债权转让给申请人，并于</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*XXXX年XX月XX日（债权转让通知书日期）*</span><span class="ql-font-FangSong ql-size-xiaosan">通知被申请人债权转让事项。</span></p>',
        // 仲裁庭意见
        tribunalOpinion: '<p class="ql-align-center"><br></p><p class="ql-align-center"><span class="ql-size-sanhao ql-font-SimSun">二、仲裁庭意见</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;仲裁庭认为：</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*具体出借人人数*</span><span class="ql-size-xiaosan ql-font-FangSong">位出借人与被申请人签订的</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*具体出借协议份数*</span><span class="ql-size-xiaosan ql-font-FangSong">份《借款协议》系当事人真实意思表示，未违反法律、行政法规的禁止性规定，应认定合法有效。同时，</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*具体出借人人数*</span><span class="ql-size-xiaosan ql-font-FangSong">位出借人与全浩公司签订的《债权转让协议》，以及全浩公司与申请人签订的《债权转让协议》亦应认定有效。本案债权两次转让事项已由全浩公司向被申请人的法定地址发送书面通知，应认定对被申请人发生法律效力。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">根据仲裁庭认定的证据，被申请人自</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*XXXX年XX月XX日（违约日期）*</span><span class="ql-size-xiaosan ql-font-FangSong">起未再按《借款协议》的约定支付借款利息，已构成违约。根据《借款协议》第6.2条，全部借款于</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*还款到期日*</span><span class="ql-size-xiaosan ql-font-FangSong">视为到期。申请人要求被申请人提前偿付全部本金，并支付利息，于法有据，仲裁庭予以支持。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">根据《借款协议》第6.1条及第9.3条，被申请人逾期还款应当支付以本息为基数计算的逾期违约金，标准为日千分之一，按年化率约36%。该逾期违约金系双方真实意思表示。申请人请求调整为年化利率24%，符合法律的相关规定，仲裁庭予以支持。</span></p>',
        // 裁决
        arbitralAwards: '<p class="ql-align-center"><br></p><p class="ql-align-center"><span class="ql-size-sanhao ql-font-SimSun">三、裁决</span></p><p>﻿&nbsp;&nbsp;&nbsp;&nbsp;<span class="ql-size-xiaosan ql-font-FangSong">依照《中华人民共和国合同法》第一百零七条、第二百零五条、第二百零六条、第二百零七条和《中华人民共和国仲裁法》第三十九条，《最高人民法院关于审理民间借贷案件适用法律若干问题的规定》第二十八条、第二十九条之规定，仲裁庭裁决如下：</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;一、被申请人</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*被申请人*</span><span class="ql-size-xiaosan ql-font-FangSong">应在本裁决书送达后7日内向申请人上海赞佑资产管理有限公司支付借款本金</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*本金*</span><span class="ql-size-xiaosan ql-font-FangSong">元及利息</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*利息*</span><span class="ql-size-xiaosan ql-font-FangSong">元（利息根据《借款协议》约定，从</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*部分还款日+1*</span><span style="color: rgb(0, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">至</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*XXXX年XX月XX日（未还利息具体期限）*</span><span class="ql-size-xiaosan ql-font-FangSong">）。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;二、被申请人</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*被申请人*</span><span class="ql-size-xiaosan ql-font-FangSong">向申请人上海赞佑资产管理有限公司支付逾期利息</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*利息违约金金额*</span><span class="ql-size-xiaosan ql-font-FangSong">元，自</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*部分还款日+1*</span><span class="ql-size-xiaosan ql-font-FangSong">起暂计至</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*案件申请日期*</span><span class="ql-size-xiaosan ql-font-FangSong">。（并继续支付以拖欠的借款利息</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*利息-已还利息*</span><span class="ql-size-xiaosan ql-font-FangSong">元为基数，按年化利率24%计算，至实际履行之日止）</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;三、被申请人</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*被申请人*</span><span class="ql-size-xiaosan ql-font-FangSong">向申请人上海赞佑资产管理有限公司支付逾期利息</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*利息违约金金额*</span><span class="ql-size-xiaosan ql-font-FangSong">元，自</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*部分还款日+1*</span><span class="ql-size-xiaosan ql-font-FangSong">起暂计至</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*案件申请日期*</span><span class="ql-size-xiaosan ql-font-FangSong">。（并继续支付以拖欠的借款利息</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*利息-已还利息*</span><span class="ql-size-xiaosan ql-font-FangSong">元为基数，按年化利率24%计算，至实际履行之日止）</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;四、本案仲裁费用</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*仲裁费*</span><span class="ql-size-xiaosan ql-font-FangSong">元，由被申请人</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*被申请人*</span><span class="ql-size-xiaosan ql-font-FangSong">承担。该费用申请人上海赞佑资产管理有限公司已支付，本院不作退还，由被申请人</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*被申请人*</span><span class="ql-size-xiaosan ql-font-FangSong">在履行上述义务时一并支付给申请人上海赞佑资产管理有限公司。</span></p><p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;如义务人未能按本裁决指定的期间履行给付金钱的义务，应当依照《中华人民共和国民事诉讼法》第二百五十三条之规定加倍支付迟延履行期间的债务利息。权利人可在本裁决规定的履行期限最后一日起两年内，向有管辖权的人民法院申请强制执行。</span></p>',
        // 尾部
        end: '<p><span class="ql-size-xiaosan ql-font-FangSong">&nbsp;&nbsp;&nbsp;&nbsp;本裁决为终局裁决，自作出之日起即发生法律效力。</span></p><p><br></p><p><br></p><p class="ql-align-center ql-indent-6"><span class="ql-size-xiaosan ql-font-FangSong">独任仲裁员:</span><span style="color: rgb(230, 0, 0);" class="ql-size-xiaosan ql-font-FangSong">*案件仲裁员*</span></p><p><br /></p><p class="ql-align-center ql-indent-6"><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">*时间*</span></p><p><br /></p><p class="ql-align-center ql-indent-6"><span class="ql-font-FangSong ql-size-xiaosan">办案秘书:</span><span style="color: rgb(230, 0, 0);" class="ql-font-FangSong ql-size-xiaosan">&nbsp;*办案秘书*</span></p><p class="ql-indent-1"><br></p>',
      },
      params: {
        // 模板首部
        head: '',
        // 模板引言
        introduction: '',
        // 申请人陈述
        coNameCause: '',
        // 申请人举证
        coNameProof: '',
        // 被申请人（未答辩）
        arbDefendantNodefence: '',
        // 被申请人-答辩
        arbDefendantDefence: '',
        // 被申请人-举证
        arbDefendantProof: '',
        // 仲裁庭查明
        tribunalFund: '',
        // 仲裁庭意见
        tribunalOpinion: '',
        // 裁决
        arbitralAwards: '',
        // 尾部
        end: '',
        arbitralAdvanceConfigureId: "",  // 计算公式id
        templateName: ""  // 模板名称
      }
    }
  },
  methods: {
    getPrototype(val){
      if(val === '1'){
        Object.assign(this.params, this.originPrototype)
      }
      else if(val === '2'){
        Object.assign(this.params, this.qianduoduo)
      }
      this.customButtonClick1()
      this.customButtonClick2()
    },
    customButtonClick1(key){
      if(key) this.buttonValue1 = key
      let pattern = /\*(年|月|日)\*/
      this.params.tribunalOpinion = this.params.tribunalOpinion.replace(pattern,`*${this.buttonValue1}*`)
    },
    customButtonClick2(key){
      if(key) this.buttonValue2 = key
      let pattern = /\*(年|月|日)\*/
      this.params.arbitralAwards = this.params.arbitralAwards.replace(pattern,`*${this.buttonValue2}*`)
    },
    onEditorChange(event){  // 内容改变事件
      // console.log(event.html)
    },
    tabFilter(val){
      this.arbType = val
      this.arbTypes.forEach((item, i) => {
        if(item.value === val){
          item.isActive = true
        }
        else if(item.isActive === true){
          item.isActive = false
        }
      })
    },
    submit() {
      this.$refs['template'].validate((valid) =>{
        if(valid){
          let params = Object.assign({}, this.params, this.template)
          let errors = []
          for(let key in params){
            if(params[key] === ''){
              errors.push(key)
            }
            else{
              // 替换不规则的符号和无法被freemarker识别的符号
              params[key] = params[key].replace(/(?=[^>]*(?=<))\s/g,'\u00a0')  // 转换空字符串
              params[key] = params[key].replace(/<br>/g, '<br \/>').replace(/&nbsp;/g, '\u00a0')
            }
          }
          if(errors.length > 0){
            this.$message.error('缺少数据，请检查是否有模板未输入数据')
            return false
          }
          this.loading = true
          if(this.id === ''){
            api.addArbitralAwardTemplate(params).then(res => {
              this.loading = false
              if (res.data.code === '1') {
                this.$message.success(res.data.msg)
                this.$router.push({
                  path: 'ArbitralAwardManage'
                })
              } else {
                this.$message.error(res.data.msg)
              }
            })
          }
          else{
            params.ftlTemplateId = this.id
            api.updateArbitralAwardTemplate(params).then(res => {
              this.loading = false
              if (res.data.code === '1') {
                this.$message.success(res.data.msg)
                this.$router.push({
                  path: 'ArbitralAwardManage'
                })
              } else {
                this.$message.error(res.data.msg)
              }
            })
          }
        }
      })
    },
    getAdvanceConfigureDataTable(){
      api.getAdvanceConfigureDataTable({
        pageSize: 100,
        pageNo: 1
      }).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let data = res.data.list
          this.formula =  data
          if(this.formula.length === 0){
            this.formula = []
          }
        }
      })
    },
    preview(){
      this.previewData = this.params
      this.previewDialogVisible = true
    },
    CB_dialog(){
      this.previewDialogVisible = false
    },
    reviewData(){
      let string = localStorage.getItem('arbitralAwardInfo')
      if(string){
        try{
          let arbitralAwardInfo = JSON.parse(string)
          if(arbitralAwardInfo.id === this.id && arbitralAwardInfo.initStatus===2 && arbitralAwardInfo.status=='停用'){  // 校验数据的一致性以及合理性
            // this.template.templateName: arbitralAwardInfo.templateName
            this.getAdvanceConfigureDataTable()
            this.getDetail()
          }
          else{
            this.$router.replace({
              path: 'arbitralAwardManage'
            })
          }
        }
        catch(err){
          console.log(err)
        }
      }
    },
    getDetail(){
      this.loading = true
      api.queryArbitralAwardTemplateById({
        id: this.id
      }).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          let data = res.data.data
          this.params = Object.assign(this.params, data)
          this.template.templateName = data.templateName
          this.template.arbitralAdvanceConfigureId = data.arbitralAdvanceConfigureId
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    }
  },
  created() {
    let id = this.$route.query.data
    if(id){
      this.id = id
      this.reviewData()
    }
    else{
      this.getAdvanceConfigureDataTable()
      this.getPrototype(this.myPrototype)
    }
  }
}

</script>
<style lang="scss" scoped>
.header{
  text-align: right;
  padding-right: 30px;
  .el-button{
    position: relative;
    top: -49px;
    padding: 8px 20px;
  }
}
h3{
  padding: 15px 0;
  font-size: 16px;
  padding-left: 10px;
}
.actions {
  .link {
    font-size: 14px;
    float: right;
    margin-left: 20px;
    color: #1890ff;
    cursor: pointer;
    text-decoration: underline;
  }
}
i{
  font-style: normal;
}
.c-black{
  color: #000;
}
.c-red{
  color: #e60000;
}
.c-blue{
  color: #1890FF;
}
.ql-snow.ql-toolbar .custom-button{
  white-space: nowrap;
  width: 60px;
  outline: none;
  &.active{
    color: #06c;
  }
}
</style>
