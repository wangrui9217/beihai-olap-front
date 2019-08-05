<template>
  <div class="arbiinfo" v-loading.fullscreen="loading">
    <div class="header-wrap">
      <div class="arbiinfo-btns">
        <el-button v-if="endName === 'user'" class="back" @click="$router.go(-1)">返回</el-button>
        <el-button v-if="endName === 'user' && arbiInfo.arbStatus==2" class="recall" @click="edit">修改</el-button>
        <el-button v-if="showRecall && arbiInfo.arbStatus>=10" class="recall" @click="recallFn">撤回请求</el-button>
        <el-popover
          v-if="showRecall && arbiInfo.arbStatus>=10"
          placement="bottom-end"
          width="400"
          trigger="hover">
          <el-table :data="gridData" border>
            <el-table-column width="300" prop="name" label="退费情形"></el-table-column>
            <el-table-column prop="number" label="退费比例"></el-table-column>
          </el-table>
          <span class="ask-icon" slot="reference">？</span>
        </el-popover>
      </div>
      <div>
        <h2>编号：{{arbiInfo.arbNumber || arbiInfo.arbTemporaryNumber}}
          <!--<span v-if="arbiInfo.arbNumber">{{arbiInfo.arbTemporaryNumber}}</span>-->
          <el-tooltip class="item" effect="dark" :content="arbiInfo.arbTemporaryNumber" placement="bottom">
            <span class="sbrl">缴</span>
          </el-tooltip>

          <el-button @click="$refs.dialog.openDialog(arbiInfo.arbitralMergeHearDetailResponse)" v-if="arbiInfo.arbitralMergeHearDetailResponse">组庭信息</el-button>
        </h2>
      </div>
      <div class="header">
        <div class="msg">
          <p><span>案由：</span>{{arbiInfo.arbName}}</p>
          <p><span>申请人：</span>{{arbiInfo.arbProsecutorName}}</p>
          <p><span>庭审类型：</span>{{arbitralRecordResponse.tribunalInfo}}</p>
          <p><span>申请日期：</span>{{arbiInfo.createTime}}</p>
          <p><span>被申请人：</span>{{arbiInfo.arbDefendantName}}</p>
          <p><span>庭审日期：</span>{{arbitralRecordResponse.tribunalTime}}</p>
          <p><span>办案秘书：</span>{{arbitralRecordResponse.arbSecretaryName}}</p>
          <p><span>仲裁员：</span>{{arbitralRecordResponse.arbArbitratorName}}</p>
          <p><span>庭审地点：</span>{{arbitralRecordResponse.location}}</p>
        </div>
        <div class="actions">
          <div>
            <p><span>状态</span></p>
            <p><b>{{arbiInfo.status}}</b><span v-if="withdrawn">（已撤回）</span></p>
          </div>
          <div>
            <p><span>标的额</span></p>
            <p><b>{{arbiInfo.arbDisputeMoney}}</b></p>
          </div>
        </div>
      </div>
      <div v-if="remark" style="color: #666">{{remark}}</div>
    </div>
    <el-row class="g-steps">
      <el-col :span="16" :offset="5">
        <ul>
          <li v-for="(item, index) in arbTypes" :key="item.value" :class="{'success': index < step||index==stopStep, 'active': index === step}">
            <div class="step-header">
              <span class="step-success-icon">
                <i class="el-icon-check"></i>
              </span>
              <span class="step-wait-number">{{index+1}}</span>
            </div>
            <div class="step-text">{{item.label}}</div>
            <div class="step-line"></div>
          </li>
        </ul>
      </el-col>
    </el-row>
    <div class="g-tab-wrap">
      <el-tabs v-model="tabName" class="tab-inner" @tab-click="handleClick">
        <el-tab-pane label="案件信息" name="1" class="info">
          <h3>申请人信息</h3>
          <div v-for="item in applyers" style="border-bottom: 1px solid #eee;">
            <ul v-if="item.pType">
              <li>
                <p><span>姓名</span>{{item.pRealname}}</p>
                <p><span>性别</span>{{item.sex}}</p>
              </li>
              <li>
                <p><span>民族</span>{{item.nation}}</p>
                <p><span>出生年月</span>{{item.birthday}}</p>
              </li>
              <li>
                <p><span>身份证</span>{{item.pIdnum}}</p>
                <p><span>邮箱</span>{{item.pMail}}</p>
              </li>
              <li>
                <p><span>手机号码</span>{{item.pPhone}}</p>
                <p><span>邮编</span>{{item.pZipcode}}</p>
              </li>
              <li>
                <span>居住地址</span>
                <div>{{item.pAdress}}</div>
              </li>
              <li>
                <span>户籍地址</span>
                <div>{{item.pIdNumAddress}}</div>
              </li>
            </ul>
            <ul v-else>
              <li><p><span>名称</span>{{item.coName}}</p></li>
              <li>
                <p><span>统一信用代码</span>{{item.coIdnum}}</p>
              </li>
              <li>
                <p><span>企业地址</span>{{item.coAdress}}</p>
                <p><span>送达地址</span>{{item.coArrivedAddress}}</p>
              </li>
               <li>
                <p><span>邮箱</span>{{item.coEmail}}</p>
                <p><span>邮编</span>{{item.coZipcode}}</p>
              </li>
              <li>
                <p><span>法定代表人</span>{{item.coLegalPerson}}</p>
                <p><span>手机号码</span>{{item.coPhone}}</p>
              </li>
              <li>
                <p><span>代表人手机</span>{{item.coPhone}}</p>
                <p><span>代表人身份证</span>{{item.coLegalPersonIdnum}}</p>
              </li>
            </ul>
            <div v-if="item.arbitralAgentInfoResponse">
              <h4>代理人</h4>
              <ul>
                <li>
                  <p><span>姓名</span>{{item.arbitralAgentInfoResponse.agentRealname}}</p>
                  <p><span>职务</span>{{item.arbitralAgentInfoResponse.agentJob}}</p>
                </li>
                <li>
                  <p><span>执业证号</span>{{item.arbitralAgentInfoResponse.agentIdnum}}</p>
                  <p><span>手机号</span>{{item.arbitralAgentInfoResponse.agentPhone}}</p>
                </li>
                <li>
                  <p><span>邮箱</span>{{item.arbitralAgentInfoResponse.agentMail}}</p>
                </li>
              </ul>
            </div>
          </div>
          <h3>被申请人信息</h3>
          <ul v-for="item in applyedArr" :key="item.id">
            <template v-if="item.pType">
              <li>
                <p><span>姓名</span>{{item.pRealname}}</p>
                <p><span>性别</span>{{item.sex}}</p>
              </li>
              <li>
                <p><span>民族</span>{{item.nation}}</p>
                <p><span>出生年月</span>{{item.birthday}}</p>
              </li>
              <li>
                <p><span>身份证</span>{{item.pIdnum}}</p>
                <p><span>邮箱</span>{{item.pMail}}</p>
              </li>
              <li>
                <p><span>手机号码</span>{{item.pPhone}}</p>
                <p><span>邮编</span>{{item.pZipcode}}</p>
              </li>
              <li>
                <span>居住地址</span>
                <div>{{item.pAdress}}</div>
              </li>
              <li>
                <span>户籍地址</span>
                <div>{{item.pIdNumAddress}}</div>
              </li>
            </template>
            <template v-else>
              <li><p><span>名称</span>{{item.coName}}</p></li>
              <li>
                <p><span>统一信用代码</span>{{item.coIdnum}}</p>
              </li>
              <li>
                <p><span>企业地址</span>{{item.coAdress}}</p>
                <p><span>送达地址</span>{{item.coArrivedAddress}}</p>
              </li>
               <li>
                <p><span>邮箱</span>{{item.coEmail}}</p>
                <p><span>邮编</span>{{item.coZipcode}}</p>
              </li>
              <li>
                <p><span>法定代表人</span>{{item.coLegalPerson}}</p>
                <p><span>手机号码</span>{{item.coPhone}}</p>
              </li>
              <li>
                <p><span>代表人手机</span>{{item.coPhone}}</p>
                <p><span>代表人身份证</span>{{item.coLegalPersonIdnum}}</p>
              </li>
            </template>
          </ul>
          <h3>合同信息</h3>
          <ul>
            <li>
              <p><span>产品类型</span>{{arbitralContractAdvancey.arbProductName}}</p>
              <p><span>本金(元)</span>{{arbitralContractAdvancey.capitalMoney}}</p>
            </li>
            <li>
              <p><span>利息</span>{{arbitralContractAdvancey.interest}}</p>
              <p><span>其他费用</span>{{arbitralContractAdvancey.otherMoney}}</p>
            </li>
            <li>
              <p><span>已还本金(元)</span>{{arbitralContractAdvancey.paidMoney}}</p>
              <p><span>已还利息</span>{{arbitralContractAdvancey.paidInterest}}</p>
            </li>
            <li>
              <p><span>借款日</span>{{arbitralContractAdvancey.borrowTime}}</p>
              <p><span>部分还款日</span>{{arbitralContractAdvancey.paidTime}}</p>
            </li>
            <li>
              <p><span>到期日</span>{{arbitralContractAdvancey.expiringDate}}</p>
            </li>
          </ul>
          <h3>仲裁请求</h3>
          <ul>
            <li>
              <p><span>案由</span>{{arbiInfo.arbName}}</p>
              <p><span>标的额</span>{{arbiInfo.arbDisputeMoney}}</p>
            </li>
            <li>
              <p><span>仲裁费用(元)</span>{{arbiInfo.arbArbitrateMoney}}</p>
            </li>
            <li>
              <span>仲裁请求</span>
              <div v-html="arbiInfo.arbApplication"></div>
            </li>
            <li>
              <span>事实和理由</span>
              <div v-html="arbiInfo.arbApplicationDescription"></div>
            </li>
          </ul>
        </el-tab-pane>
        <el-tab-pane label="案件跟踪" name="2">
          <el-table
            :data="histroyTaskInst"
            stripe border
            style="width: 100%">
            <el-table-column
              label="步骤"
              prop="index"
              >
            </el-table-column>
            <el-table-column
              prop="taskName"
              label="处理流程"
              >
            </el-table-column>
            <el-table-column
              prop="remark"
              label="处理信息"
              :show-overflow-tooltip="true"
              >
            </el-table-column>
            <el-table-column
              prop="assignee"
              label="操作人">
            </el-table-column>
            <el-table-column
              prop="endTime"
              label="处理时间">
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="申请人资料" name="3">
          <h3>仲裁申请书</h3>
          <div style="padding: 0 0 10px 10px">
            <div class="g-evidence">
              <div v-for="(evidence, index) in arbitrationApplication" :key="index">
                <div class="attachmentDatas">
                  <div class="attachmentDatas-item" v-for="(file, ind) in evidence.arbAttachmentDatas" :key="ind">
                    <ul>
                      <li>
                        <a class="file-name" :href="file.attachUrlDes" :download="file.attachName">{{file.attachName}}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h3>证据资料</h3>
          <div class="g-evidence">
            <div class="evidence-item" v-for="(evidence, index) in arbitralAttachment" :key="index">
              <div class="evidence-tit">
                <span>{{evidence.evidenceName}}</span>
              </div>
              <div class="attachmentDatas">
                <div class="attachmentDatas-item" v-for="(file, ind) in evidence.arbAttachmentDatas" :key="ind">
                  <ul>
                    <li>
                      <a class="file-name" :href="file.attachUrlDes" :download="file.attachName">{{file.attachName}}</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="evidence-state">
                <p><span>证据标题：</span>{{evidence.evidenceTitle}}</p>
                <p><span>证明内容：</span><b v-html="evidence.evidenceContent"></b></p>
              </div>
              <div class="bottom-text">
                <div>
                  <div>更新流程：</div>
                  <div>{{DICT.getArbStatusName(evidence.updateProcess)}}</div>
                </div>
                <div>
                  <div>更新时间：</div>
                  <div>{{evidence.updateTime}}</div>
                </div>
                <div>
                  <div>更新人：</div>
                  <div>{{evidence.updatePName}}</div>
                </div>
              </div>
            </div>
          </div>
          <h3>其他资料</h3>
          <div style="padding: 0 0 10px 10px">
            <div class="g-idcards">
              <div >
                <div >
                  <ul>
                    <li v-for="(file, ind) in applyOtherLists" :key="ind" v-if="file.downloadUrl">
                      <a class="file-name" :href="file.downloadUrl" :download="file.attachName">
                        <img :src="file.imgSrc" alt="" width="176" height="112">
                      </a>
                      <p>{{file.attachName}}</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="案件文书" name="4">
          <el-table
            :data="documents"
            stripe border
            height="500"
            style="width: 100%">
            <el-table-column
              label="序号"
              type="index"
              width="50"
              >
            </el-table-column>
            <el-table-column
              prop="documentName"
              label="文书名称"
              >
            </el-table-column>
            <el-table-column
              prop="arrivedType"
              label="送达方式"
              width="160"
              >
            </el-table-column>
            <el-table-column
              prop="emailornumber"
              label="电子邮箱/快递单号">
            </el-table-column>
            <el-table-column
              prop="expressTime"
              width="100"
              label="邮递日期">
            </el-table-column>
            <el-table-column
              prop="time"
              label="邮箱/邮递送达时间">
            </el-table-column>
            <el-table-column
              label="操作"
              width="70">
              <template slot-scope="scope"><span class="g-link" @click="download(scope.row)">下载</span></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="被申请人资料" name="5" v-if="endName != 'user'">
          <h3>答辩书</h3>
          <div style="padding: 0 0 10px 10px">
            <div class="g-evidence">
              <div v-for="(evidence, index) in replyBrief" :key="index">
                <div class="attachmentDatas">
                  <div class="attachmentDatas-item" v-for="(file, ind) in evidence.arbAttachmentDatas" :key="ind">
                    <ul>
                      <li>
                        <a class="file-name" :href="file.attachUrlDes" :download="file.attachName">{{file.attachName}}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h3>答辩资料</h3>
          <div class="g-evidence">
            <div class="evidence-item" v-for="(evidence, index) in replyLists" :key="index">
              <div class="evidence-tit">
                <span>{{evidence.evidenceName}}</span>
              </div>
              <div class="attachmentDatas">
                <div class="attachmentDatas-item" v-for="(file, ind) in evidence.arbAttachmentDatas" :key="ind">
                  <ul>
                    <li>
                      <a class="file-name" :href="file.attachUrlDes" :download="file.attachName">{{file.attachName}}</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="evidence-state">
                <p><span>证据标题：</span>{{evidence.evidenceTitle}}</p>
                <p><span>证明内容：</span><b v-html="evidence.evidenceContent"></b></p>
              </div>
            </div>
          </div>
          <h3>被申请人证件</h3>
          <div style="padding: 0 0 10px 10px">
            <div class="g-idcards">
              <div >
                <div >
                  <ul>
                    <li v-for="(file, ind) in applyedOtherLists" :key="ind">
                      <a class="file-name" :href="file.downloadUrl" :download="file.attachName">
                        <img :src="file.imgSrc" alt="" width="176" height="112">
                      </a>
                      <p>{{file.attachName}}</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="调解资料" name="6" >
          <h3>调解证据</h3>
          <div style="padding: 0 0 10px 10px">
            <div class="g-evidence">
              <div class="attachmentDatas">
                <div class="attachmentDatas-item" v-for="(file, ind) in mediationDatas" :key="ind">
                  <ul>
                    <li>
                      <a class="file-name" :href="file.attachUrlDes" :download="file.attachName">{{file.attachName}}</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="撤回资料" name="7" class="info" v-if="arbRecallApplyInfoResponse">
          <ul>
            <li>
              <p><span>申请撤回时间</span>{{arbRecallApplyInfoResponse.applyRecallTime}}</p>
              <p><span>申请撤回流程</span>{{DICT.getArbStatusName(arbRecallApplyInfoResponse.applyRecallProcedure)}}</p>
            </li>
            <li>
              <p><span>撤回申请书</span>
                <span class="file-name" :href="arbRecallApplyInfoResponse.recallPetitionUrl" :download="arbRecallApplyInfoResponse.recallPetitionName" @click="downloadFile(arbRecallApplyInfoResponse.recallPetitionUrl, arbRecallApplyInfoResponse.recallPetitionName)">{{arbRecallApplyInfoResponse.recallPetitionName}}</span>
              </p>
            </li>
            <li>
              <p><span>撤回初审结果</span>{{arbRecallApplyInfoResponse.recallFirstTrialResult}}</p>
              <p><span>初审意见</span>{{arbRecallApplyInfoResponse.firstTrialAdvice}}</p>
            </li>
            <li>
              <p><span>撤回终审结果</span>{{arbRecallApplyInfoResponse.recallFinalTrialResult}}</p>
              <p><span>终审意见</span>{{arbRecallApplyInfoResponse.finalTrialAdvice}}</p>
            </li>
          </ul>
        </el-tab-pane>
        <el-tab-pane label="管辖权异议资料" name="8" v-if="dissentApplication.length>0">
          <h3>基本信息</h3>
          <div class="dissentInfo"  style="border-bottom: 1px solid #eee;">
            <ul >
              <li>
                <p><span>异议申请时间：</span>{{arbiInfo.decisionCreateTime}}</p>
                <p><span>异议申请流程：</span>{{arbiInfo.status}}</p>
              </li>
              <li>
                <p><span>异议申请人：</span>被申请人-{{arbiInfo.decisionProsecutorName}}</p>
              </li>
            </ul>
          </div>
          <h3>异议申请书(案件被申请人)</h3>
          <div style="padding: 0 0 10px 10px">
            <div class="g-evidence">
              <div v-for="(evidence, index) in dissentApplication" :key="index">
                <div class="attachmentDatas">
                  <div class="attachmentDatas-item" v-for="(file, ind) in evidence.arbAttachmentDatas" :key="ind">
                    <ul>
                      <li>
                        <a class="file-name" :href="file.attachUrlDes" :download="file.attachName">{{file.attachName}}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h3>管辖权异议资料(案件被申请人)</h3>
          <div class="g-evidence">
            <div class="evidence-item" v-for="(evidence, index) in dissentAttachment" :key="index">
              <div class="evidence-tit">
                <span>{{evidence.evidenceName}}</span>
              </div>
              <div class="attachmentDatas">
                <div class="attachmentDatas-item" v-for="(file, ind) in evidence.arbAttachmentDatas" :key="ind">
                  <ul>
                    <li>
                      <a class="file-name" :href="file.attachUrlDes" :download="file.attachName">{{file.attachName}}</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="evidence-state">
                <p><span>证据标题：</span>{{evidence.evidenceTitle}}</p>
                <p><span>证明内容：</span><b v-html="evidence.evidenceContent"></b></p>
              </div>
              <div class="bottom-text">
                <div>
                  <div>更新流程：</div>
                  <div>{{evidence.updateProcess}}</div>
                </div>
                <div>
                  <div>更新时间：</div>
                  <div>{{evidence.updateTime}}</div>
                </div>
                <div>
                  <div>更新人：</div>
                  <div>{{evidence.updatePName}}</div>
                </div>
              </div>
            </div>
            <div style="border-bottom: 1px solid #eee;padding-left:10px;padding-bottom:20px;">
              <ul >
                <li>
                  <p><span>事实和理由：</span>{{arbiInfo.remark}}</p>
                </li>
              </ul>
            </div>
          </div>
          <h3 v-if="dissentReplyApplication.length>0">管辖权异议答辩书(案件申请人)</h3>
          <div v-if="dissentReplyApplication.length>0" style="padding: 0 0 10px 10px">
            <div class="g-evidence">
              <div v-for="(evidence, index) in dissentReplyApplication" :key="index">
                <div class="attachmentDatas">
                  <div class="attachmentDatas-item" v-for="(file, ind) in evidence.arbAttachmentDatas" :key="ind">
                    <ul>
                      <li>
                        <a class="file-name" :href="file.attachUrlDes" :download="file.attachName">{{file.attachName}}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h3 v-if="dissentReplyApplication.length>0">管辖权异议答辩资料(案件申请人)</h3>
          <div v-if="dissentReplyApplication.length>0" class="g-evidence">
            <div class="evidence-item" v-for="(evidence, index) in dissentReplyAttachment" :key="index">
              <div class="evidence-tit">
                <span>{{evidence.evidenceName}}</span>
              </div>
              <div class="attachmentDatas">
                <div class="attachmentDatas-item" v-for="(file, ind) in evidence.arbAttachmentDatas" :key="ind">
                  <ul>
                    <li>
                      <a class="file-name" :href="file.attachUrlDes" :download="file.attachName">{{file.attachName}}</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="evidence-state">
                <p><span>证据标题：</span>{{evidence.evidenceTitle}}</p>
                <p><span>证明内容：</span><b v-html="evidence.evidenceContent"></b></p>
              </div>
              <div class="bottom-text">
                <div>
                  <div>更新流程：</div>
                  <div>{{evidence.updateProcess}}</div>
                </div>
                <div>
                  <div>更新时间：</div>
                  <div>{{evidence.updateTime}}</div>
                </div>
                <div>
                  <div>更新人：</div>
                  <div>{{evidence.updatePName}}</div>
                </div>
              </div>
            </div>
            <div style="border-bottom: 1px solid #eee;padding-left:10px;padding-bottom:20px;">
              <ul >
                <li>
                  <p><span>答辩及质证意见：</span>{{arbiInfo.defenceRemark}}</p>
                </li>
              </ul>
            </div>
          </div>

        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog :visible.sync="userInfoDialog" title="撤回请求" width="600px" :close-on-click-modal="false" v-loading.fullscreen="loading">
      <div>
        <el-upload
          v-if="arbiInfo.arbStatus >= 20"
          class="g-uploader" multiple :headers="headers" :action="uploadUrl" :on-error="uploadError"
          :on-success="handleSuccess" :limit="1"
          :before-upload="fileFilter" :file-list="fileList" :on-change="handleChange" :on-remove="handleRemove" :on-exceed="handleExceed">
          <el-button size="small" type="default" icon="el-icon-upload2">上传附件</el-button>
        </el-upload>
        <p v-else>确认要撤回吗？</p>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="userInfoDialog = false">取 消</el-button>
      <el-button type="primary" @click="editCoInfo">提交</el-button>
    </span>
    </el-dialog>
    <allinfo-dialog ref="dialog"></allinfo-dialog>
  </div>
</template>
<script>
import { api } from '@/api'
import util from '@/util/util'
import DICT from '@/const/dict'
import DownloadFile from '@/util/downloadFile'
import allinfoDialog from '@/views/admin/allinfoDialog'
export default {
  components: { allinfoDialog },
  props: ['endName'],
  data() {
    return {
      step: 0,
      loading: false,
      id: '',  // 案件id
      tabName: '1',
      arbiInfo: {},
      histroyTaskInst: [],
      replyBrief: [],  // 答辩书
      replyLists: [],  // 答辩资料
      applyedOtherLists: [],  // 被申请人身份资料
      applyOtherLists: [],  // 申请人身份资料
      arbitrationApplication: [],  // 仲裁申请书
      arbitralAttachment: [],  //  证据资料
      dissentApplication: [],  // 异议申请书
      dissentAttachment: [],  //  异议证据资料
      dissentReplyApplication: [],  // 异议申请书
      dissentReplyAttachment: [],  //  异议证据资料
      arbTypes: DICT.arbTypes.filter((item,i) => {return i!==0}),
      applyedArr: [],
      applyers: [],
      arbitralContractAdvancey: {},
      arbitralAgentInfos: [],
      documents: [],  // 文书
      arbitralRecordResponse: {},
      showRecall: false,
      withdrawn: false,
      gridData: [{
        name: '当事人提出仲裁申请，并已“预缴仲裁费用”，在案件状态在“立案”前提出撤回仲裁申请的。',
        number: '100%'
      },{
        name: '案件“立案”后，案件状态在“组庭”前，申请人撤回仲裁申请的。',
        number: '50%'
      },{
        name: '案件“组庭”后，在组庭开庭通知书送达前，申请人撤回仲裁申请或仲裁庭“资料审核不通过”的。',
        number: '30%'
      },{
        name: '组庭开庭通知书送达后， 裁决书送达前，申请人撤回仲裁申请的。',
        number: '0%'
      }],
      stopStep: -1,
      mediationDatas: [],
      remark: '',
      userInfoDialog: false,
      uploadUrl: api.uploadURL,
      fileList: [],
      mime: [".jpeg", ".jpg", ".png", ".pdf", '.doc', '.docx', '.docm'],
      arbRecallApplyInfoResponse: {},
      DICT
    }
  },
  methods: {
    downloadFile (url, name) {
      let urlPath
      let lastName = name.substring(name.lastIndexOf('.')).toLowerCase()
      if (/\.jpg|\.png|\.jpeg/.test(lastName) === true) {
        urlPath = api.getImgURL(url)
      } else {  // pdf
        urlPath = api.getPdfURL(url)
      }
      DownloadFile(urlPath, name)
    },
    editCoInfo () {
      if (this.arbiInfo.arbStatus < 20) {
        this.handelSubmit()
        return
      }
      if (this.fileList.length === 0) {
        this.$message.error('请上传附件')
        return
      }
      if (this.fileList.length !== 0 && !this.fileList[0].response) {
        this.$message.error('请等待附件上传')
        return
      }
      api.addOrUpdateRecallInfo({},{
        "arbitralInfoId": this.id,
        fileName: this.fileList[0].name,
        filePath: this.fileList[0].response.data.filePath
      }).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          this.$message.success(res.data.msg)
          this.userInfoDialog = false
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    handelSubmit () {
      api.addOrUpdateRecallInfo({},{
        "arbitralInfoId": this.id
      }).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          this.$message.success(res.data.msg)
          this.userInfoDialog = false
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    fileFilter(file) {
      let endName = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      const isMime = this.mime.some((value) => {
        return value == endName
      })
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isMime) {
        this.$message.error('仅支持pdf和word,jpg,png格式文件上传!');
        return false
      }
      if (!isLt2M) {
        this.$message.error('单个文件不可超过10 MB!');
        return false
      }
      this.eviLoading = true;
      return isMime && isLt2M;
    },
    uploadError(res){
      this.eviLoading = false
      this.$store.dispatch('httpError', res)
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleChange(file, fileList) {
      this.fileList = fileList
      console.log(this.fileList)
    },
    recallFn(){
      this.userInfoDialog = true
      this.fileList = []
    },
    handleSuccess (file, fileList) {
      console.log(file, fileList)
    },
    handleExceed () {
      this.$message.info('只能上传一条')
    },





    getArbitralInfoDetail() {
      this.loading = true;
      api.getArbitralInfoDetail({
        arbitralId: this.id
      }).then((res) => {
        this.loading = false;
        if(res.data.code == '1'){
          this.arbiInfo = res.data
          this.arbRecallApplyInfoResponse = res.data.arbRecallApplyInfoResponse
          if(this.arbiInfo.id){
            this.formatData()
            if(this.tabName !== '1'){
              this.handleClick({
                name: this.tabName
              }, {})
            }
            // this.getHistroyTaskInst()
            // this.queryDocuments()
          }
        }
      })
    },
    getArbitralInfoDetailBySys(){
      this.loading = true;
      api.getArbitralInfoDetailBySys({
        arbitralId: this.id
      }).then((res) => {
        this.loading = false;
        if(res.data.code == '1'){
          this.arbiInfo = res.data
          this.arbRecallApplyInfoResponse = res.data.arbRecallApplyInfoResponse
          if(this.arbiInfo.id){
            this.formatData()
            // this.getHistroyTaskInst()
            // 文书信息在受理之后才有
            // this.queryDocuments()
          }
        }
      })
    },
    getTribunalInfo(){
      let arr = []
      if(this.arbitralRecordResponse.tribunalType === 1){
        arr.push('线下开庭')
      }
      else if(this.arbitralRecordResponse.tribunalType === 2){
        arr.push('书面审理')
      }
      if(this.arbitralRecordResponse.arbitratorType === 1){
        arr.push('独任')
      }
      else if(this.arbitralRecordResponse.arbitratorType === 2){
        arr.push('合议')
      }
      return arr.join('-')
    },
    getTribunalTime(){
      if(this.arbitralRecordResponse.bTime){
        let eTime = this.arbitralRecordResponse.eTime.replace(/^.*\s/,'')
        return this.arbitralRecordResponse.bTime.replace(/:00$/,'') + '~' + eTime.replace(/:00$/,'')
      }
      else return ''
    },
    formatData(){
      let applyedArr = []
      let applyers = []
      this.arbitralRecordResponse = this.arbiInfo.arbitralRecordResponse || {}
      this.arbitralRecordResponse.tribunalInfo = this.getTribunalInfo()
      this.arbitralRecordResponse.tribunalTime = this.getTribunalTime()
      let sts = 0
      if(this.arbitralRecordResponse.stopArbStatus){   // 撤回的案件撤回时的状态
        sts = this.arbitralRecordResponse.stopArbStatus
        this.stopStep = this.arbTypes.length-1  // 撤回成功显示流程为结案
      }
      else{
        sts = this.arbiInfo.arbStatus
      }
      this.arbiInfo.status = util.getStatus(sts)
      let n = Number(sts)
      this.arbiInfo.step = this.arbTypes.findIndex(item => {
        let range = item.arbStatus.split(',')
        let max = Number(range[1])
        let min = Number(range[0])
        return n < max && n >= min
      })
      this.step = this.arbiInfo.step
      this.arbitralContractAdvancey = this.arbiInfo.arbitralContractAdvancey || {}
      this.arbiInfo.arbitralAttachment&&this.arbiInfo.arbitralAttachment.forEach(item => {
        if(item.arbitralPtype === 2&&item.evidenceProperty===1){
          this.arbitrationApplication.push(item)  // 仲裁申请书
        }
        else if(item.arbitralPtype === 2&&item.evidenceProperty===2){
          this.arbitralAttachment.push(item)  //  证据资料
        }
        else if(item.arbitralPtype === 1&&item.evidenceProperty===5){
          this.replyLists.push(item)  //  答辩资料
        }
        else if(item.arbitralPtype === 1&&item.evidenceProperty===4){
          this.replyBrief.push(item)  //  答辩书
        }
        else if(item.evidenceProperty===7){
          item.updateProcess='申请'
          this.dissentApplication.push(item)  //  异议申请书
        }
        else if(item.evidenceProperty===8){
          item.updateProcess='申请'
          this.dissentAttachment.push(item)  //  异议证据
        }

        else if(item.evidenceProperty===9){
          item.updateProcess='答辩'
          this.dissentReplyApplication.push(item)  //  异议答辩申请书
        }
        else if(item.evidenceProperty===10){
          item.updateProcess='答辩'
          this.dissentReplyAttachment.push(item)  //  异议答辩证据
        }

        else if(item.evidenceProperty===6){
          if(item.arbAttachmentDatas){
            this.mediationDatas = item.arbAttachmentDatas
          }
        }
      })
      if(this.arbiInfo.arbStopStatus != 2 && this.arbiInfo.arbStopStatus != 3 && this.endName === 'user'){
        this.showRecall = true
      }
      if(this.arbitralRecordResponse.defencesState == 1){  // 状态为2已答辩，才显示答辩数据
        this.replyLists = []
        this.replyBrief = []
      }
      this.arbiInfo.arbitralCoInfo && this.arbiInfo.arbitralCoInfo.forEach(item => {
        if(item.coType===1){
          applyedArr.push(item)
        }
        else{
         applyers.push(item)
        }
      })
      this.arbiInfo.arbitralPInfo && this.arbiInfo.arbitralPInfo.forEach(item => {
        if(item.pType===1){
          applyedArr.push(item)
        }
        else{
         applyers.push(item)
        }
      })
      applyers.forEach(item => {
        if(item.pType){  // 自然人
          if(item.sex == 1){
            item.sex = '男'
          }
          else if(item.sex == 2){
            item.sex = '女'
          }
          else{
            item.sex = ''
          }
        }
        if(item.arbitralAgentInfoResponse){
          let agent = item.arbitralAgentInfoResponse
          // ['agentLawyerAttach', 'agentProxyAttach', 'agentCounselAttach', 'agentIdAttachFornt', 'agentIdAttachRear', 'agentJobAttach', 'agentContractAttach']
          let prefix = '代理人-' + agent.agentRealname
          this.applyOtherLists.push({
            attachUrlDes: agent.agentLawyerAttachDes,
            attachName: prefix + '-律师证照片' + this.getLastName(agent.agentLawyerAttach)
          },{
            attachUrlDes: agent.agentProxyAttachDes,
            attachName: prefix + '-授权委托书' + this.getLastName(agent.agentProxyAttach)
          },{
            attachUrlDes: agent.agentCounselAttachDes,
            attachName: prefix + '-律所所函' + this.getLastName(agent.agentCounselAttach)
          },{
            attachUrlDes: agent.agentIdAttachForntDes,
            attachName: prefix + '-身份证正面' + this.getLastName(agent.agentIdAttachFornt)
          },{
            attachUrlDes: agent.agentIdAttachRearDes,
            attachName: prefix + '-身份证反面' + this.getLastName(agent.agentIdAttachRear)
          },{
            attachUrlDes: agent.agentJobAttachDes,
            attachName: prefix + '-职务证明' + this.getLastName(agent.agentJobAttach)
          },{
            attachUrlDes: agent.agentContractAttachDes,
            attachName: prefix + '-劳动合同' + this.getLastName(agent.agentContractAttach)
          })
        }
        if(item.coLicenceAttachDes){
          this.applyOtherLists.push({
            attachUrlDes: item.coLicenceAttachDes,
            attachName: item.coName + '-营业执照' + this.getLastName(item.coLicenceAttach)
          })
        }
        if(item.coIdPaperAttachDes){
          this.applyOtherLists.push({
            attachUrlDes: item.coIdPaperAttachDes,
            attachName: item.coName + '-身份证明' + this.getLastName(item.coIdPaperAttach)
          })
        }
        if(item.coIdAttachForntDes){
          this.applyOtherLists.push({
            attachUrlDes: item.coIdAttachForntDes,
            attachName: item.coName + '-身份证正面' + this.getLastName(item.coIdAttachFornt)
          })
        }
        if(item.coIdAttachRearDes){
          this.applyOtherLists.push({
            attachUrlDes: item.coIdAttachRearDes,
            attachName: item.coName + '-身份证反面' + this.getLastName(item.coIdAttachRear)
          })
        }
        if(item.pIdAttachForntDes){
          this.applyOtherLists.push({
            attachUrlDes: item.pIdAttachForntDes,
            attachName: item.pRealname + '-身份证正面' + this.getLastName(item.pIdAttachFornt)
          })
        }
        if(item.pIdAttachRearDes){
          this.applyOtherLists.push({
            attachUrlDes: item.pIdAttachRearDes,
            attachName: item.pRealname + '-身份证反面' + this.getLastName(item.pIdAttachRear)
          })
        }
      })
      applyedArr.forEach(item => {
        if(item.pType){  // 自然人
          if(item.sex == 1){
            item.sex = '男'
          }
          else if(item.sex == 2){
            item.sex = '女'
          }
          else{
            item.sex = ''
          }
        }
        else{
        }
        if(item.coLicenceAttachDes){
          this.applyedOtherLists.push({
            attachUrlDes: item.coLicenceAttachDes,
            attachName: item.coName + '-营业执照' + this.getLastName(item.coLicenceAttach)
          })
        }
        if(item.coIdPaperAttachDes){
          this.applyedOtherLists.push({
            attachUrlDes: item.coIdPaperAttachDes,
            attachName: item.coName + '-身份证明' + this.getLastName(item.coIdPaperAttach)
          })
        }
        if(item.coIdAttachForntDes){
          this.applyedOtherLists.push({
            attachUrlDes: item.coIdAttachForntDes,
            attachName: item.coName + '-身份证正面' + this.getLastName(item.coIdAttachFornt)
          })
        }
        if(item.coIdAttachRearDes){
          this.applyedOtherLists.push({
            attachUrlDes: item.coIdAttachRearDes,
            attachName: item.coName + '-身份证反面' + this.getLastName(item.coIdAttachRear)
          })
        }
        if(item.pIdAttachForntDes){
          this.applyedOtherLists.push({
            attachUrlDes: item.pIdAttachForntDes,
            attachName: item.pRealname + '-身份证正面' + this.getLastName(item.pIdAttachFornt)
          })
        }
        if(item.pIdAttachRearDes){
          this.applyedOtherLists.push({
            attachUrlDes: item.pIdAttachRearDes,
            attachName: item.pRealname + '-身份证反面' + this.getLastName(item.pIdAttachRear)
          })
        }
      })
      this.applyedArr = applyedArr
      this.applyers = applyers
      this.setAttachIcons(this.applyedOtherLists)
      this.setAttachUrl(this.arbitrationApplication)
      this.setAttachUrl(this.arbitralAttachment)
      this.setAttachUrl(this.replyBrief)
      this.setAttachUrl(this.replyLists)
      this.setAttachIcons(this.applyOtherLists)
      this.setAttachUrl(this.mediationDatas)
      if(this.endName === 'user'){   // 查询审核不通过的备注
        if(this.arbiInfo.arbStatus ==2){
          this.applyJudgeNoPassRemark()
        }
      }
    },
    getLastName(filaName){
      if(typeof filaName === 'string'){
        return filaName.substring(filaName.lastIndexOf('.')).toLowerCase()
      }
      else{
        return ''
      }
    },
    download(row){
      let url = row.restartUpaloadUrl || row.documentGeneratorUrlDes
      api.downloadOtherFile({
        filePath: url,
        fileName: row.documentName
      }).then(res => {
        if (res.data instanceof Blob) {
          DownloadFile(res.data, row.documentName)
        }
      })
    },
    // 解决下载文件名称错误的问题
    setAttachUrl(arr){
      if(arr instanceof Array){
        arr.forEach((item) => {
          if(item.arbAttachmentDatas instanceof Array){
            item.arbAttachmentDatas.forEach((file) => {
              let lastName = file.attachName.substring(file.attachName.lastIndexOf('.')).toLowerCase()
              if (/\.jpg|\.png|\.jpeg/.test(lastName) === true) {
                file.attachUrlDes = api.getImgURL(file.attachUrlDes)
              }
              else{  // pdf
                file.attachUrlDes = api.getPdfURL(file.attachUrlDes)
              }
            })
          }
          else if(item.attachName){
            let lastName = item.attachName.substring(item.attachName.lastIndexOf('.')).toLowerCase()
              if (/\.jpg|\.png|\.jpeg/.test(lastName) === true) {
                item.attachUrlDes = api.getImgURL(item.attachUrlDes)
              }
              else{  // pdf
                item.attachUrlDes = api.getPdfURL(item.attachUrlDes)
              }
          }
        })
      }
    },
    setAttachIcons(attaches){
      attaches.forEach(attach => {
        if(attach.attachUrlDes){
          let lastName = attach.attachName.substring(attach.attachName.lastIndexOf('.')).toLowerCase()
          if (/\.jpg|\.png|\.jpeg/.test(lastName) === true) {
            attach.downloadUrl = api.getImgURL(attach.attachUrlDes)
            attach['imgSrc'] = attach.downloadUrl
          }
          else{  // pdf
            attach.downloadUrl = api.getPdfURL(attach.attachUrlDes)
            attach['imgSrc'] = util.getIcon(attach.attachName)
          }
        }
        else{

        }
      })
    },
    getHistroyTaskInst(){  // 案件追踪
      api.getHistroyTaskInst({
        arbProcess: this.arbiInfo.arbProcess
      }).then((res) => {
        if(res.data.code == '1'){
          this.histroyTaskInst = res.data.data
          let len = this.histroyTaskInst.length
          this.histroyTaskInst.forEach((v, i) => {
            v.index = '第' + (len-i) + '步'
          })
        }
      })
    },
    queryDocuments(){
      // 文书
      let params = {
        arbitralDocumentDataRequests: [{
          arbitralInfoId: this.arbiInfo.id
        }]
      }
      let func = null
      if(this.endName === 'user'){
        params.documentType = '1,2,4,5,6,7,8,9'
        func = api.queryArbitralDocumentByself
      }else{
        params.documentType = '1,2,3,4,5,6,7,8,9'
        func = api.queryArbitralDocumentBatch
      }
      this.documents = []
      func(params).then((res) => {
        if (res.data.code == '1') {
          let data = []
          res.data.data.forEach(item => {
            if(this.endName !== 'user'|| (this.endName === 'user' && item.documentArrivedType)) {
              item.arrivedType = ''
              item.emailornumber = ''
              item.time = ''
              if(item.documentArrivedState === 1){
                item.arrivedType = '电子送达'
                item.emailornumber = item.userEmail
                item.time = item.documentArrivedTime || ''
              }
              if(item.arbitralExpressRecordId){
                item.arrivedType += (item.arrivedType?' / 线下邮递':'线下邮递')
                item.emailornumber += (item.emailornumber?(' / ' + item.expressNumber):item.expressNumber)
                if(item.arrivedTime){
                  item.time += ' / ' + item.arrivedTime
                }
                else if(item.time){
                  item.time += ' / '
                }
              }
              data.push(item)
            }

          })
          this.documents = data
        }
      })
    },
    handleClick(tab, e){
      if(tab.name === '2'){
        this.getHistroyTaskInst()
      }
      else if(tab.name === '4'){
        this.queryDocuments()
      }
    },
    edit(){
      this.$router.push({
        path: 'editArbitral',
        query: {
          data: this.id
        }
      })
    },
    applyJudgeNoPassRemark(){
      api.applyJudgeNoPassRemark({
        arbitralInfoId: this.id
      }).then(res => {
        if(res.data.code === '1'){
          this.remark = res.data.data
        }
      })
    }
  },
  computed: {
    headers(){
      return {
        Authorization: this.$store.state.user.userAccessToken || this.$store.state.admin.adminAccessToken
      }
    }
  },
  mounted() {
    this.id = this.$route.query.data
    if(this.id){
      if(this.endName == 'user'){
        let type = this.$route.query.type
        if(type){
          this.tabName = type
        }
        this.getArbitralInfoDetail()
      }
      else{
        this.getArbitralInfoDetailBySys()
      }
    }
  }
}

</script>
<style lang="scss" scoped>
  .sbrl{
    display: inline-block;
    border-radius: 100%;
    width: 25px;
    height: 25px;
    line-height: 25px;
    text-align: center;
    border: 1px solid #c1c1c1;
  }
  .file-name{
    /*../assets/attach_icon.png*/
    background: url(./../../assets/attach_icon.png) no-repeat 5px 50%;
    padding-left: 25px;
    display: block;
    cursor: pointer;
    margin-right: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #1890FF;
  }
  .bottom-text{
    display: flex;
    border-top: 1px solid #d9d9d9;
    padding-top: 10px;
    &>div{
      width: 30%;
      display: flex;
      &>div:nth-child(1){
        width: 80px;
      }
    }
    &>div:nth-child(2){
      width: 40%;
    }
  }
h2{
  font-size: 20px;
  color: #333;
  line-height: 28px;
  font-weight: bold;
  span{
    font-weight: normal;
    font-size: 14px;
    margin-left: 20px;
  }
}
.dissentInfo{
ul{
      padding: 15px;
      color: #666;
      &+ul{
        border-top: solid 1px #eee;
      }
      li{
        display: flex;
        padding-bottom: 20px;
        p{
          width: 490px;
          display: inline-block;
          height: 19px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        div{
          width: 900px;
        }
        span{
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          height: 19px;
          vertical-align: top;
          display: inline-block;
          width: 100px;
          margin-right: 10px;
          /*color: #000;*/
        }
      }
    }
}

.arbiinfo{
  .info{
    ul{
      padding: 15px;
      color: #666;
      &+ul{
        border-top: solid 1px #eee;
      }
      li{
        display: flex;
        padding-bottom: 20px;
        p{
          width: 490px;
          display: inline-block;
          height: 19px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        div{
          width: 900px;
        }
        span{
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          height: 19px;
          vertical-align: top;
          display: inline-block;
          width: 85px;
          margin-right: 10px;
          /*color: #000;*/
        }
      }
    }
  }
  .header-wrap{
    padding:0 30px 20px;
    border-bottom: solid 13px #f0f2f5;
    .arbiinfo-btns{
      float: right;
    }
    .ask-icon{
      margin-left: 5px;
      cursor: pointer;
      display: inline-block;
      width: 20px;
      height: 20px;
      background: #ccc;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      color: #fff;
    }
    .recall{
      height: 32px;
      background: #ff5a5a;
      border-color: #ff5a5a;
      color: #fff;
      padding: 5px 16px;
      margin-left: 20px;
    }
    .back{
      padding: 5px 16px;
      height: 32px;
    }
  }
  .header{
    display: flex;
    color: #666;
    font-size: 14px;
    margin-top: 20px;
    .msg{
      width: 870px;
      overflow: hidden;
      p{
        width: 290px;
        float: left;
        height: 36px;
        span{
          display: inline-block;
          width: 72px;
        }
      }
    }
    .actions{
      width: 220px;
      text-align: right;
      div{
        width: 50%;
        float: left;
        p{
          margin:10px 0 15px;
        }
      }
      span{
        color: #999;
        font-size: 14px;
      }
      b{
        font-size: 16px;
        color: #333;
        font-weight: normal;
      }
    }
  }
}

</style>
