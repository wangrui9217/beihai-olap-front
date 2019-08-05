<template>
  <div v-loading.fullscreen="loading" :element-loading-text="loadingText" class="g-listpage__style">
    <div class="mt20" style="margin-top:20px">
      <span>登录名</span>
      <el-input class="formula-form" v-model.trim="searchForm.username" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <span>企业名称</span>
      <el-input class="formula-form" v-model.trim="searchForm.realname" placeholder="请输入" @keyup.enter.native="searchFn"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="searchFn">搜索</el-button>
    </div>
    <div class="mt20" style="margin-top:20px">
      <el-button type="primary" @click="openAddCoUserbox">+ 新增企业</el-button>
      <button class="g-on-btn" @click="on()" :disabled="!onActive">启用</button>
      <button class="g-off-btn" @click="off()" :disabled="!offActive">停用</button>
    </div>
    <el-table :data="tableData" border class="g-table" ref="mytable" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="37">
      </el-table-column>
      <el-table-column prop="username" label="登录名">
      </el-table-column>
      <el-table-column prop="name" label="企业名称">
      </el-table-column>
      <el-table-column prop="userType" label="申请人类型">
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span :class="{'g-unactive':scope.row.status==='停用'}">{{scope.row.status}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template slot-scope="scope">
          <div class="actions">
            <button @click="read(scope.row)" v-if="scope.row.status == '启用'">查看</button>
            <button @click="edit(scope.row)" v-else>修改</button>
            <button @click="resetPassword(scope.row)">重置密码</button>
            <button v-if="scope.row.authStatus != 1" @click="resendEmail(scope.row)">补发验证邮件</button>
            <button v-else-if="scope.row.status == '启用'" @click="relate(scope.row)">关联公司</button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="float:middle" @size-change="pageSizeChange" @current-change="pageNoChange" :current-page="pageNo" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="prev, pager, next, jumper,total, sizes" :total="total">
    </el-pagination>
    <el-dialog :visible.sync="userCoInfoDialog" :title="dialogTitle" width="900px" @close="dialogClose" :close-on-click-modal="false">
      <div class="editbox">
        <el-form :model="userCoInfoForm" ref="userInfoForm" label-width="140px" @validate="validateCallback">
          <div class="el-row">
            <el-col :span="12">
              <el-form-item label="企业名称" prop="coName" :rules="rules.coNameRule">
                <el-input v-model.trim="userCoInfoForm.coName" placeholder="企业名称" :disabled="!boxTypeIsAdd"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="统一信用代码" prop="coIdnum" :rules="rules.coIdnum">
                <el-input v-model.trim="userCoInfoForm.coIdnum" placeholder="统一信用代码" :disabled="!boxTypeIsAdd"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="企业地址" prop="coAdress" :rules="rules.addressRule">
                <el-input v-model.trim="userCoInfoForm.coAdress" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="约定送达地址" prop="coArrivedAddress" :rules="rules.addressRule">
                <el-input v-model.trim="userCoInfoForm.coArrivedAddress" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮编" prop="coZipcode" :rules="rules.zipcodeRule">
                <el-input v-model.trim="userCoInfoForm.coZipcode" placeholder="邮编"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="法定代表人" prop="coLegalPerson" :rules="rules.realnameRule">
                <el-input v-model.trim="userCoInfoForm.coLegalPerson" placeholder="法定代表人"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="代表人手机" prop="coPhone" :rules="rules.phoneRule">
                <el-input v-model.trim="userCoInfoForm.coPhone" placeholder="手机号" @blur="handlePhoneChange"></el-input>
                <p class="tips" v-show="showPhoneTips">*此手机号将作为案件归档信息，请正确填写</p>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="企业邮箱" prop="coEmail" :rules="rules.emailRule">
                <div v-if="userCoInfoForm.userCoId">
                  <span>{{userCoInfoForm.coEmail}}</span>
                </div>
                <div v-else>
                  <el-input v-model.trim="userCoInfoForm.coEmail" placeholder="邮箱"></el-input>
                  <p class="tips" v-show="showEmailTips">*此邮箱需要验证，请正确填写</p>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="代表人身份证号" prop="coLegalPersonIdnum" :rules="rules.coLegalPersonIdnumRule">
                <el-input v-model.trim="userCoInfoForm.coLegalPersonIdnum" placeholder="身份证号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" style="height: 62px;"></el-col>
            <el-col :span="12" >
              <el-form-item label="登录名" prop="username" :rules="rules.username">
                <el-input v-model.trim="userCoInfoForm.username" placeholder="登录名" :maxLength="20" :disabled="!boxTypeIsAdd"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码" prop="password" :rules="rules.passwordRule" v-if="boxTypeIsAdd">
                <el-input v-model.trim="userCoInfoForm.password" placeholder="密码"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="营业执照和身份证明（选填）" class="upload-co-img">
                <ul>
                  <li>
                    <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userCoInfoForm, 'coLicenceAttach')" list-type="picture-card" :before-upload="imgFilter">
                      <img class="g-upload-img" v-if="userCoInfoForm.coLicenceAttachUrl" :src="userCoInfoForm.coLicenceAttachUrl" alt="">
                      <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                      <div class="el-upload__tip px12" slot="tip">营业执照</div>
                    </el-upload>
                  </li>
                  <li>
                    <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userCoInfoForm, 'coIdPaperAttach')" list-type="picture-card" :before-upload="imgFilter">
                      <img class="g-upload-img" v-if="userCoInfoForm.coIdPaperAttachUrl" :src="userCoInfoForm.coIdPaperAttachUrl" alt="">
                      <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                      <div class="el-upload__tip px12" slot="tip">身份证明</div>
                    </el-upload>
                  </li>
                  <li>
                    <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userCoInfoForm, 'coIdAttachFornt')" list-type="picture-card" :before-upload="imgFilter">
                      <img class="g-upload-img" v-if="userCoInfoForm.coIdAttachForntUrl" :src="userCoInfoForm.coIdAttachForntUrl" alt="">
                      <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                      <div class="el-upload__tip px12" slot="tip">身份证正面</div>
                    </el-upload>
                  </li>
                  <li>
                    <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userCoInfoForm, 'coIdAttachRear')" list-type="picture-card" :before-upload="imgFilter">
                      <img class="g-upload-img" v-if="userCoInfoForm.coIdAttachRearUrl" :src="userCoInfoForm.coIdAttachRearUrl" alt="">
                      <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                      <div class="el-upload__tip px12" slot="tip">身份证反面</div>
                    </el-upload>
                  </li>
                </ul>
                <div class="px12">只能上传jpg/png/pdf文件，且不超过10M</div>
              </el-form-item>
            </el-col>
          </div>
        </el-form>
        <div class="openAgent" @click="openAgent" v-if="hideAgent">+ 添加代理人</div>
        <div class="agent-box" v-else>
          <h3>代理人信息 <span @click="deleteAgent" class="delete-agent">删除代理人</span></h3>
          <el-form :model="userAgentInfoRequest" ref="userAgentInfoRequest" label-width="140px">
            <div class="el-row">
              <el-col :span="12">
                <el-form-item label="姓名：" prop="agentRealname" :rules="rules.realnameRule">
                  <el-input v-model.trim="userAgentInfoRequest.agentRealname" placeholder="请输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="职务：" prop="agentJob" :rules="rules.agentJobRule">
                  <el-input v-model.trim="userAgentInfoRequest.agentJob" placeholder="请输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号：" prop="agentPhone" :rules="rules.phoneRule">
                  <el-input v-model.trim="userAgentInfoRequest.agentPhone" placeholder="请输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="执业证号：">
                  <el-input v-model.trim="userAgentInfoRequest.agentIdnum" placeholder="请输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱（选填）：" prop="agentMail" :rules="emailRule">
                  <el-input v-model.trim="userAgentInfoRequest.agentMail" placeholder="请输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="身份证明（选填）" class="upload-co-img">
                  <ul>
                    <li>
                      <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentLawyerAttach')" list-type="picture-card" :before-upload="imgFilter">
                        <img class="g-upload-img" v-if="userAgentInfoRequest.agentLawyerAttachUrl" :src="userAgentInfoRequest.agentLawyerAttachUrl" alt="">
                        <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                        <div class="el-upload__tip px12" slot="tip">律师证照片</div>
                      </el-upload>
                    </li>
                    <li>
                      <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentProxyAttach')" list-type="picture-card" :before-upload="imgFilter">
                        <img class="g-upload-img" v-if="userAgentInfoRequest.agentProxyAttachUrl" :src="userAgentInfoRequest.agentProxyAttachUrl" alt="">
                        <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                        <div class="el-upload__tip px12" slot="tip">授权委托书</div>
                      </el-upload>
                    </li>
                    <li>
                      <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentCounselAttach')" list-type="picture-card" :before-upload="imgFilter">
                        <img class="g-upload-img" v-if="userAgentInfoRequest.agentCounselAttachUrl" :src="userAgentInfoRequest.agentCounselAttachUrl" alt="">
                        <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                        <div class="el-upload__tip px12" slot="tip">律所所函</div>
                      </el-upload>
                    </li>
                    <li>
                      <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentIdAttachFornt')" list-type="picture-card" :before-upload="imgFilter">
                        <img class="g-upload-img" v-if="userAgentInfoRequest.agentIdAttachForntUrl" :src="userAgentInfoRequest.agentIdAttachForntUrl" alt="">
                        <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                        <div class="el-upload__tip px12" slot="tip">身份证正面</div>
                      </el-upload>
                    </li>
                    <li>
                      <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentIdAttachRear')" list-type="picture-card" :before-upload="imgFilter">
                        <img class="g-upload-img" v-if="userAgentInfoRequest.agentIdAttachRearUrl" :src="userAgentInfoRequest.agentIdAttachRearUrl" alt="">
                        <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                        <div class="el-upload__tip px12" slot="tip">身份证反面</div>
                      </el-upload>
                    </li>
                    <li>
                      <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentJobAttach')" list-type="picture-card" :before-upload="imgFilter">
                        <img class="g-upload-img" v-if="userAgentInfoRequest.agentJobAttachUrl" :src="userAgentInfoRequest.agentJobAttachUrl" alt="">
                        <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                        <div class="el-upload__tip px12" slot="tip">职务证明</div>
                      </el-upload>
                    </li>
                    <li>
                      <el-upload :headers="headers" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(userAgentInfoRequest, 'agentContractAttach')" list-type="picture-card" :before-upload="imgFilter">
                        <img class="g-upload-img" v-if="userAgentInfoRequest.agentContractAttachUrl" :src="userAgentInfoRequest.agentContractAttachUrl" alt="">
                        <div class="icon-plus" v-else><i class="el-icon-plus"></i></div>
                        <div class="el-upload__tip px12" slot="tip">劳动合同</div>
                      </el-upload>
                    </li>
                    
                  </ul>
                  <div class="px12">只能上传jpg/png/pdf文件，且不超过10M</div>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="coInfoSubmit">提交</el-button>
      </span>
    </el-dialog>
    <el-dialog title="查看企业用户" :visible.sync="readonly" width="800px" :close-on-click-modal="false">
      <div class="read-box">
        <div class="el-row">
          <el-col :span="12">
            登录名：<span>{{userCoInfoForm.username}}</span>
          </el-col>
          <el-col :span="12">
            企业名称：<span>{{userCoInfoForm.coName}}</span>
          </el-col>
          <el-col :span="12">
            统一信用代码：<span>{{userCoInfoForm.coIdnum}}</span>
          </el-col>
          <el-col :span="12">
            邮编：<span>{{userCoInfoForm.coZipcode}}</span>
          </el-col>
          <el-col :span="12">
            法定代表人：<span>{{userCoInfoForm.coLegalPerson}}</span>
          </el-col>
          <el-col :span="12">
            法定代表人手机：<span>{{userCoInfoForm.coPhone}}</span>
          </el-col>
          <el-col :span="12">
            代表人身份证号：<span>{{userCoInfoForm.coLegalPersonIdnum}}</span>
          </el-col>
          <el-col :span="12">
            法定代表人邮箱：<span>{{userCoInfoForm.coEmail}}</span>
          </el-col>
          <el-col :span="24">
            企业地址：<span>{{userCoInfoForm.coAdress}}</span>
          </el-col>
          <el-col :span="24">送达地址：<span>{{userCoInfoForm.coArrivedAddress}}</span>
          </el-col>
          <el-col :span="24">
            <p style="margin-bottom: 10px">营业执照和身份证明（选填）：</p>
            <ul class="css-readonly">
              <li v-if="userCoInfoForm.coLicenceAttachUrl">
                <img class="g-upload-img" :src="userCoInfoForm.coLicenceAttachUrl" alt="">
                <div class="px12">营业执照</div>
              </li>
              <li v-if="userCoInfoForm.coIdPaperAttachUrl">
                <img class="g-upload-img" :src="userCoInfoForm.coIdPaperAttachUrl" alt="">
                <div class="px12" slot="tip">身份证明</div>
              </li>
              <li v-if="userCoInfoForm.coIdAttachForntUrl">
                <img class="g-upload-img" :src="userCoInfoForm.coIdAttachForntUrl" alt="">
                <div class="px12" slot="tip">身份证正面</div>
              </li>
              <li v-if="userCoInfoForm.coIdAttachRearUrl">
                <img class="g-upload-img" :src="userCoInfoForm.coIdAttachRearUrl" alt="">
                <div class="px12" slot="tip">身份证反面</div>
              </li>
            </ul>
          </el-col>
        </div>
        <div class="agent-box" v-if="!hideAgent">
          <h3>代理人信息</h3>
          <div class="el-row">
            <el-col :span="12">
              姓名：<span>{{userAgentInfoRequest.agentRealname}}</span>
            </el-col>
            <el-col :span="12">
              职务：<span>{{userAgentInfoRequest.agentJob}}</span>
            </el-col>
            <el-col :span="12">
              执业证号：<span>{{userAgentInfoRequest.agentIdnum}}</span>
            </el-col>
            <el-col :span="12">
              手机号：<span>{{userAgentInfoRequest.agentPhone}}</span>
            </el-col>
            <el-col :span="12">
              邮箱（选填）：<span>{{userAgentInfoRequest.agentMail}}</span>
            </el-col>
            <el-col :span="24">
              <p style="margin-bottom: 10px">身份证（选填）：</p>
              <ul class="css-readonly">
                <li v-if="userAgentInfoRequest.agentLawyerAttachUrl">
                  <img class="g-upload-img" :src="userAgentInfoRequest.agentLawyerAttachUrl" alt="">
                  <div class="px12" slot="tip">律师证照片</div>
                </li>
                <li v-if="userAgentInfoRequest.agentProxyAttachUrl">
                  <img class="g-upload-img" :src="userAgentInfoRequest.agentProxyAttachUrl" alt="">
                  <div class="px12" slot="tip">授权委托书</div>
                </li>
                <li v-if="userAgentInfoRequest.agentCounselAttachUrl">
                  <img class="g-upload-img" :src="userAgentInfoRequest.agentCounselAttachUrl" alt="">
                  <div class="px12" slot="tip">律所所函</div>
                </li>
                <li v-if="userAgentInfoRequest.agentIdAttachForntUrl">
                  <img class="g-upload-img" :src="userAgentInfoRequest.agentIdAttachForntUrl" alt="">
                  <div class="px12" slot="tip">身份证正面</div>
                </li>
                <li v-if="userAgentInfoRequest.agentIdAttachRearUrl">
                  <img class="g-upload-img" :src="userAgentInfoRequest.agentIdAttachRearUrl" alt="">
                  <div class="px12" slot="tip">身份证反面</div>
                </li>
                <li v-if="userAgentInfoRequest.agentJobAttachUrl">
                  <img class="g-upload-img" :src="userAgentInfoRequest.agentJobAttachUrl" alt="">
                  <div class="px12" slot="tip">职务证明</div>
                </li>
                <li v-if="userAgentInfoRequest.agentContractAttachUrl">
                  <img class="g-upload-img" :src="userAgentInfoRequest.agentContractAttachUrl" alt="">
                  <div class="px12" slot="tip">劳动合同</div>
                </li>
                
              </ul>
            </el-col>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="关联公司" :visible.sync="relateDialog" width="700px" :close-on-click-modal="false">
      <div class="relate-box">
        <dl>
          <dt>公司名称：</dt>
          <dd><h3>{{relateParams.coName}}</h3>
          </dd>
          <dt>关联：</dt>
          <dd>
            <el-radio-group v-model="relateParams.relateType" @change="handleRelateTypeChange">
              <el-radio label="child" :disabled="childDisabled">关联子公司</el-radio>
              <el-radio label="parent" :disabled="parentDisabled">关联母公司</el-radio>
            </el-radio-group>
            <div class="selected-section">
              <el-tag closable size="medium" v-for="company in selectedCompanies" :key="company.userCoId" @close="handleTagClose(company)">{{company.coName}}</el-tag>
            </div>
            <div class="select-section">
              <el-input v-model="searchCompanyKeyword" placeholder="输入" size="small" @keyup.enter.native="searchCompanys"></el-input>
              <div class="select-list" v-scroll="loadMoreData" v-loading="searchLoading">
                <div v-if="relateParams.relateType=='child'">
                  <el-checkbox-group v-model="checkList" >
                    <div class="select-item" v-for="company in childCompanies" :key="company.userCoId">
                      <el-checkbox :label="company.userCoId" @change="val => handleCheckboxChange(val,company)">{{company.coName}}</el-checkbox>
                    </div>
                  </el-checkbox-group>
                  <el-button type="text" v-if="childCompanyLoading">{{childCompanyLoadText}}</el-button>
                </div>
                <div v-else>
                  <el-radio-group v-model="radioCompany" @change="handleParentCompanyChange" >
                    <div class="select-item" v-for="company in parentCompanies" :key="company.userCoId">
                      <el-radio :label="company.userCoId">{{company.coName}}</el-radio>
                    </div>
                  </el-radio-group>
                  <el-button type="text" v-if="parentCompanyLoading">{{parentCompanyLoadText}}</el-button>
                </div>
              </div>
            </div>
          </dd>
        </dl>
      </div>
      <div slot="footer">
        <el-button @click="relateDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveRelate()" >保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { api } from "@/api";
import util from "@/util/util";
import Rules from "@/util/rules";
import VDistpicker from "v-distpicker";
export default {
  components: { VDistpicker },
  data() {
    return {
      boxTypeIsAdd: true,
      userId: "",
      headers: {
        Authorization: localStorage.getItem("adminAccessToken")
      },
      uploadUrl: api.uploadURL,
      rules: Rules,
      userCoInfoDialog: false, // 修改企业资料dialog
      dialogTitle: "",
      loading: false,
      loadingText: '',
      total: 0,
      pageSize: 10,
      pageNo: 1,
      tableData: [],
      password: "",
      searchForm: {
        realname: "",
        username: ""
      },
      userCoInfoForm: {
        coAdress: "", // 企业地址
        coEmail: "",
        coLegalPerson: "", // 企业法人
        coPassword: "",
        coLicenceAttach: "", // 企业营业执照
        coLicenceAttachUrl: '',
        coName: "",
        coIdnum: "",
        password: "",
        username: '',
        coArrivedAddress: '',
        coPhone: "",
        coLegalPersonIdnum: '',
        coZipcode: "", // 邮编
        coType: 2
      },
      saveUsername: '',
      userAgentInfoRequest: {},
      multipleSelection: [],
      showPhoneTips: true,
      showEmailTips: true,
      hideAgent: true,
      emailRule: { type: 'email', message: '邮箱格式错误，请录入正确的邮箱', trigger: 'blur' },
      readonly: false,
      relateDialog: false,
      relateParams: {
        relateType: 'child',
        coName: '',
        comType: ''
      },
      childCompanies: [],
      parentCompanies: [],
      selectedCompanies: [],
      checkList: [],
      searchCompanyKeyword: '',
      radioCompany: '',
      childPageNo: 1,
      childPageSize: 20,
      parentPageNo: 1,
      parentPageSize: 20,
      searchLoading: false,
      childCompanyLoading: false,
      childCompanyLoadText: '加载中...',
      parentCompanyLoading: false,
      parentCompanyLoadText: '加载中...'
    };
  },
  computed: {
    onActive() {
      return this.multipleSelection.some(item => { return item.status === '停用' })
    },
    offActive() {
      return this.multipleSelection.some(item => { return item.status === '启用' })
    },
    childDisabled(){
      return this.relateParams.comType==='parent'||(this.selectedCompanies.length>0&&this.relateParams.relateType==='parent')
    },
    parentDisabled(){
      return this.relateParams.comType==='child'||(this.selectedCompanies.length>0&&this.relateParams.relateType==='child')
    }
  },
  methods: {
    openAgent() {
      this.hideAgent = !this.hideAgent
    },
    deleteAgent() {
      this.$confirm('确定删除代理人吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.userAgentInfoRequest.id) {
          this.loading = true
          api.adminDelAgent({
            id: this.userAgentInfoRequest.id
          }).then(res => {
            this.loading = false
            if (res.data.code === '1') {
              this.$refs["userAgentInfoRequest"].resetFields();
              this.userAgentInfoRequest = {}
              this.hideAgent = !this.hideAgent
            } else {
              this.$message.error(res.data.msg)
            }
          })
        } else {
          this.$refs["userAgentInfoRequest"].resetFields();
          this.userAgentInfoRequest = {}
          this.hideAgent = !this.hideAgent
        }
      }).catch(() => {})
    },
    validateCallback(prop, valid) {
      if (prop === 'coPhone') {
        this.showPhoneTips = valid
      } else if (prop === 'coEmail') {
        this.showEmailTips = valid
      }
    },
    handlePhoneChange(e){
      var val = e.target.value
      if(/^1\d{10}$/.test(val)){
        if(this.userCoInfoForm.username === '' || this.userCoInfoForm.username === this.saveUsername){
          this.userCoInfoForm.username = val
          this.saveUsername = val
        }
      }
    },
    imgSuccess(object, key) {
      var formObject = object;
      return (res, file) => {
        this.loading = false;
        if (res.code == "1") {
          object[key] = res.data.filePath;
          if (file.raw.type !== 'image/jpeg' && file.raw.type !== 'image/png') {
            object[key + 'Url'] = util.getIcon(file.name)
          } else {
            object[key + "Url"] = URL.createObjectURL(file.raw)
          }
        } else {
          this.$message.error(res.msg);
        }
      };
    },
    imgFilter(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf";
      const isLt3M = file.size / 1024 / 1024 < 10;
      if (!isJPG) {
        this.$message.error("上传图片只能是 jpg,png,pdf 格式!");
        return false;
      }
      if (!isLt3M) {
        this.$message.error("上传图片大小不能超过 10MB!");
        return false;
      }
      this.loading = true;
      return isJPG && isLt3M;
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    pageSizeChange(size) {
      this.pageSize = size;
      this.getUserList();
    },
    pageNoChange(pageNo) {
      this.pageNo = pageNo;
      this.getUserList();
    },
    dialogClose() {
      this.$refs["userInfoForm"].resetFields();
      if (this.hideAgent === false) {
        this.$refs["userAgentInfoRequest"].resetFields();
        this.userAgentInfoRequest = {}
      }
      this.userCoInfoForm = {}
    },

    relate(row) {
      this.relateParams.coName = row.name
      this.relateParams.coId = row.coId
      this.relateDialog = true
      this.selectedCompanies = []
      this.childCompanies = []
      this.parentCompanies = []
      this.childCompanyLoading = false
      this.childCompanyLoadText = '加载中...'
      this.parentCompanyLoading = false
      this.parentCompanyLoadText = '加载中...'
      this.checkList = []
      this.searchCompanyKeyword = ''
      this.radioCompany = ''
      this.childPageNo = 1
      this.parentPageNo = 1
      if (row.comType === '0') { // 当前为母公司
        this.getChildCompanies()
        this.getMyChildCompanies()
        this.relateParams.relateType = 'child'
        this.relateParams.comType = 'child'
      } else if (!row.comType) { // 当前为独立公司
        this.getParentCompanies()
        this.getChildCompanies()
        this.relateParams.comType = ''
        this.relateParams.relateType = 'child'
      } else { // 当前为子公司
        this.getMyParentCompanies()
        this.getParentCompanies()
        this.relateParams.relateType = 'parent'
        this.relateParams.comType = 'parent'
      }
    },
    getParentCompanies() {
      this.parentCompanyLoading = true
      //this.checkList = []
      api.queryAdditableUserCoInfo({
        pageSize: this.parentPageSize,
        pageNo: this.parentPageNo,
        "name": this.searchCompanyKeyword,
        "type": 1,
        "userCoId": this.relateParams.coId
      }).then(res => {
        this.parentCompanyLoading = false
        this.searchLoading === false
        if (res.data.code === '1') {
          if(res.data.data){
            let data = res.data.data
            if(data.length > 0){
              this.parentCompanies = this.parentCompanies.concat(data)
            }
            else{
              this.parentCompanyLoading = true
              this.parentCompanyLoadText = '到底了'
            }
          }
        }
      })
    },
    getChildCompanies() {
      this.childCompanyLoading = true
      //this.checkList = []
      api.queryAdditableUserCoInfo({
        pageSize: this.childPageSize,
        pageNo: this.childPageNo,
        "name": this.searchCompanyKeyword,
        "type": 0,
        "userCoId": this.relateParams.coId
      }).then(res => {
        this.childCompanyLoading = false
        this.searchLoading === false
        if (res.data.code === '1') {
          if(res.data.data){
            let data = res.data.data
            if(data.length > 0){
              this.childCompanies = this.childCompanies.concat(data)
            }
            else{
              this.childCompanyLoading = true
              this.childCompanyLoadText = '到底了'
            }
          }
        }
        else{
          this.childCompanyLoading = true
          this.childCompanyLoadText = '到底了'
        }
      })
    },
    getMyParentCompanies(){
      api.queryAdditableUserCoInfoByCompany({
        "type": 1,
        "userCoId": this.relateParams.coId
      }).then(res => {
        if(res.data.code === '1'){
          let data = res.data.data
          this.selectedCompanies = data
        }
      })
    },
    getMyChildCompanies(){
      api.queryAdditableUserCoInfoByCompany({
        "type": 0,
        "userCoId": this.relateParams.coId
      }).then(res => {
        if(res.data.code === '1'){
          let data = res.data.data
          this.selectedCompanies = data
        }
      })
    },
    handleCheckboxChange(val, obj){
      let index = this.selectedCompanies.findIndex(o => { return o.userCoId == obj.userCoId })
      if(val && index < 0){
        this.selectedCompanies.push(obj)
      }
      else if(val === false){
        this.selectedCompanies.splice(index, 1)
      }
    },
    handleParentCompanyChange(radio) {
      this.selectedCompanies = this.parentCompanies.filter(item => {
        return item.userCoId === radio
      })
    },
    handleTagClose(company) {
      this.selectedCompanies.splice(this.selectedCompanies.indexOf(company), 1);
      if (this.relateParams.relateType === 'child') {
        let thisId = company.userCoId
        if(this.checkList.indexOf(thisId) > -1){
          this.checkList.splice(this.checkList.indexOf(thisId), 1)
        }
      } else {
        this.radioCompany = ''
      }
    },
    handleRelateTypeChange(type) {
      if (type === '1') {
        
      } else {
        
      }
    },
    searchCompanys(val){
      if(this.relateParams.relateType === 'child' && this.searchLoading === false){
        this.childPageNo = 1
        this.searchLoading === true
        this.childCompanies = []
        this.getChildCompanies()
      }
      else if(this.relateParams.relateType === 'parent' && this.searchLoading === false){
        this.parentPageNo  = 1
        this.searchLoading === true
        this.parentCompanies = []
        this.getParentCompanies()
      }
    },
    loadMoreData() {
      if(this.relateParams.relateType === 'child' && this.childCompanyLoading === false){
        this.childPageNo ++
        this.getChildCompanies()
      }
      else if(this.relateParams.relateType === 'parent' && this.parentCompanyLoading === false){
        this.parentPageNo ++
        this.getParentCompanies()
      }
    },
    saveRelate() {
      /*let type = ''
      let parentId = ''*/
      let ids = this.selectedCompanies.map(item => {
        return item.userCoId
      })
      let params = {}
      if(ids.length > 0){
        if(this.relateParams.relateType === 'child'){  // 母公司修改她的子公司
          params.parentId = this.relateParams.coId
          params.type = 0
          params.ids = ids
        }
        else {    // 子公司修改她的母公司
          params.type = 1
          params.parentId = ids[0]
          params.ids = [this.relateParams.coId]
        }
      }
      else{
        if(this.relateParams.relateType === 'child'){  // 母公司清空她的子公司
          params.parentId = this.relateParams.coId
          params.type = 0
        }
        else {    // 子公司解除她的母公司
          params.type = 1
          params.ids = [this.relateParams.coId]
        }
      }
      this.loading = true
      api.additableUserCoInfo(params).then(res => {
        this.loading = false
        if(res.data.code === '1'){
          this.$message.success(res.data.msg)
          this.relateDialog = false
          this.getUserList()
        }
        else{
          this.$message.error(res.data.msg)
        }
      })
    },
    //打开新增企业用户的dialog
    openAddCoUserbox() {
      this.dialogTitle = "新增企业用户";
      this.boxTypeIsAdd = true;
      this.userId = "";
      for(let key in this.userCoInfoForm){
        this.userCoInfoForm[key] = ''
      }
      this.userCoInfoForm.coType = 2
      this.showPhoneTips = this.showEmailTips = true
      this.hideAgent = true
      this.userCoInfoDialog = true;
      this.$nextTick(() => {
        this.$refs['userInfoForm'].clearValidate()
        this.userAgentInfoRequest = {}
      })

    },
    cancel() {
      this.dialogClose()
      this.userCoInfoDialog = false
    },
    coInfoSubmit() {
      let valids = false
      this.$refs["userInfoForm"].validate(valid => {
        if (this.hideAgent === false) {
          this.$refs['userAgentInfoRequest'].validate(valid2 => {
            valids = valid && valid2
          })
        } else {
          valids = valid
        }
      })
      if (valids) {
        if (this.boxTypeIsAdd) {
          this.addUserCoInfo();
        } else {
          this.editCoInfo();
        }
      }
    },
    editCoInfo() {
      let params = Object.assign({}, this.userCoInfoForm)
      
      let paramsTrue = Object.assign({
        usertype: "2",
        userCoInfo: params,
        id: this.userId
      });
      if (this.hideAgent === false) {
        paramsTrue.userAgentInfoRequest = Object.assign({}, this.userAgentInfoRequest)
      }
      this.loading = true;
      api.updateUserAccountInfo(paramsTrue).then(res => {
        this.loading = false;
        if (res.data.code === '1') {
          this.$message.success("保存成功！");
          this.userCoInfoDialog = false;
          this.getUserList();
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    addUserCoInfo() {
      let params = Object.assign({}, this.userCoInfoForm)
      let paramsTrue = Object.assign({
        password: this.userCoInfoForm.password,
        username: this.userCoInfoForm.username,
        usertype: "2",
        userCoInfo: params
      });
      if (this.hideAgent === false) {
        paramsTrue.userAgentInfoRequest = Object.assign({}, this.userAgentInfoRequest)
      }
      this.loading = true;
      api.saveUserAccountInfo(paramsTrue).then(res => {
        if (res.data.code === '1') {
          this.userCoInfoDialog = false;
          this.getUserList();
          this.loadingText = '注册成功，正在发送注册邮件，请稍等...'
          this.sendUserAccountAuthEmail({
            "username": this.userCoInfoForm.username
          }, this.userCoInfoForm.coEmail)
        } else {
          this.loading = false;
          this.$message.error(res.data.msg);
        }
      })
    },
    sendUserAccountAuthEmail(params, email) {
      api.sendUserAccountAuthEmail(params).then(res => {
        this.loadingText = ''
        this.loading = false;
        if (res.data.code === '1') {
          this.$alert('"验证邮件"已发送 ' + email + '<br />请联系申请人完成邮箱验证', '邮件验证', {
            dangerouslyUseHTMLString: true,
            type: 'success'
          })
        } else {
          this.$alert('注册邮件发送失败', '', {
            type: 'error'
          })
        }
      })
    },
    resendEmail(row) {
      this.loading = true
      this.loadingText = '正在发送验证邮件，请稍等...'
      this.sendUserAccountAuthEmail({
        "username": row.username
      }, '')
    },
    resetPassword(row) {
      var publicKey = this.PublicKey;
      this.$JSEncrypt.setPublicKey(publicKey);
      var loginForm_pwd = this.$JSEncrypt.encrypt("888888");

      let params = Object.assign({
        id: row.id,
        password: loginForm_pwd
      });
      let msg = "确认重置密码吗？";
      this.$confirm(msg, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          api.resetPassword(params).then(res => {
            if (res.data.code === '1') {
              this.$message.success("密码已经重置为888888！");
              this.getUserList();
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
    read(row) {
      this.readonly = true
      this.dialogTitle = "查看企业用户";
      this.userCoInfoForm = {}
      this.userAgentInfoRequest = {}
      this.getUserAccountInfo(row)
    },
    edit(row) {
      this.userCoInfoDialog = true;
      this.dialogTitle = "修改企业用户";
      this.getUserAccountInfo(row)
    },
    getUserAccountInfo(row) {
      this.boxTypeIsAdd = false;
      this.userId = row.id;
      let url = "/api/useraccount/allInfo/" + row.id + "/" + row.usertype;
      api.getUserAccountInfo(url).then(res => {
        if (res.data.code === '1') {
          let username = res.data.data.username
          let userInfo = res.data.data.userCoInfo;
          let attaches = ['coLicenceAttach', 'coIdPaperAttach', 'coIdAttachFornt', 'coIdAttachRear']
          userInfo.username = username
          userInfo = this.setAttachIcons(userInfo, attaches)
          userInfo.coType = 2; // 案件关联企业类型：1.被告，2.原告
          this.userCoInfoForm = userInfo;
          if (res.data.data.userAgentInfoEntity && res.data.data.userAgentInfoEntity.id) {
            let userAgentInfo = res.data.data.userAgentInfoEntity
            let attaches = ['agentLawyerAttach', 'agentProxyAttach', 'agentCounselAttach', 'agentIdAttachFornt', 'agentIdAttachRear', 'agentJobAttach', 'agentContractAttach']
            userAgentInfo = this.setAttachIcons(userAgentInfo, attaches)
            this.userAgentInfoRequest = userAgentInfo
            this.hideAgent = false
          } else {
            this.userAgentInfoRequest = {}
            this.hideAgent = true
          }

        } else {
          this.$message.error(res.data.msg)
        }
      });
    },
    setAttachIcons(object, attaches) {
      attaches.forEach(attach => {
        let attachName = object[attach]
        if (attachName) {
          let lastName = attachName.substring(attachName.lastIndexOf('.')).toLowerCase()
          if (/\.jpg|\.png|\.jpeg/.test(lastName) === false) {
            object[attach + 'Url'] = util.getIcon(attachName)
          } else {
            object[attach + 'Url'] = api.getImgURL(object[attach + 'Des'])
          }
        }
        else{
          object[attach + 'Url'] = ''
        }
      })
      return object
    },
    getUserList() {
      let data = {
        "name": this.searchForm.realname,
        "pageNo": this.pageNo,
        "pageSize": this.pageSize,
        "username": this.searchForm.username
      }

      api.getUserList(data).then(res => {
        if (res.data.code === '1') {
          let data = res.data.list;
          data.forEach(v => {
            v.userType = v.usertype == 1 ? "个人" : "企业";
            v.status = v.status == 2 ? '停用' : '启用'
          });
          this.tableData = data;
          this.total = res.data.total;
        } else {
          this.tableData = [];
          this.total = 0;
        }
      });
    },
    searchFn() {
      this.pageNo = 1;
      this.getUserList();
    },
    on() {
      let params = []
      let selected = this.multipleSelection.filter(item => {
        return item.status !== '启用'
      })
      if (selected.length == 0) {
        this.$message.error('您选择的账号是已启用的，不需要再次启用')
        return false
      }
      params = selected.map(item => {
        return {
          id: item.id,
          status: 1
        }
      })

      let msg = '确认启用已选的账号吗？'
      this.updateUserAccountStatus(params, msg)
    },
    off() {
      let params = []
      let selected = this.multipleSelection.filter(item => {
        return item.status !== '停用'
      })
      if (selected.length == 0) {
        this.$message.error('您选择的账号是已停用的，不需要再次停用')
        return false
      }
      params = selected.map(item => {
        return {
          id: item.id,
          status: 2
        }
      })
      let msg = '确认停用已选的账号吗？'
      this.updateUserAccountStatus(params, msg)
    },
    updateUserAccountStatus(params, msg) {
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        api.updateUserAccountStatus({ configStatusList: params }).then(res => {
          this.loading = false
          if (res.data.code === '1') {
            this.$refs.mytable.clearSelection()
            this.getUserList();
            this.$message.success(res.data.msg)
          } else {
            this.$message.error(res.data.msg)
          }
        })
      }).catch(() => {

      });
    }
  },
  created() {
    this.getUserList();
  },
  mounted() {}
};

</script>
<style lang="scss" scoped>
.formula-form {
  width: 200px;
  margin-right: 20px;
}

.actions {
  color: #0000ff;

  button {
    color: #0000ff;
    border: none;
    background: none;
    cursor: pointer;
    outline: none;

    &[disabled] {
      cursor: no-drop;
      color: #999;
    }
  }
}

.upload-co-img {
  ul {
    overflow: hidden;
  }

  li {
    float: left;
    margin-right: 20px;
  }
}

.tips {
  position: absolute;
  font-size: 12px;
  color: #999;
  right: 0;
  bottom: -18px;
  width: 100%;
  height: 15px;
  line-height: 15px;
}

.openAgent {
  cursor: pointer;
  color: #1890FF;
  font-size: 16px;
  margin-left: 30px;
  display: inline-block;
}

.agent-box {
  h3 {
    border-bottom: solid 1px #d3d3d3;
    padding-bottom: 10px;
    margin-bottom: 25px;
  }
}

.delete-agent {
  font-size: 13px;
  cursor: pointer;
  color: #aaa;
  float: right;
  margin-right: 10px;

  &:hover {
    color: #1890FF;
  }
}

.read-box {
  .el-col {
    margin-bottom: 15px;
    position: relative;
    color: #999;

    span {
      position: absolute;
      left: 120px;
      top: 0;
      color: #333;
    }
  }
}

.css-readonly {
  margin-bottom: 30px;

  li {
    width: 106px;
    height: 106px;
    display: inline-block;
    margin-left: 10px;
  }
}

.relate-box {
  dl {
    overflow: hidden;

    dt,
    dd {
      float: left;
      margin-bottom: 15px;
    }

    dt {
      width: 60px;
    }

    dd {
      width: 600px;
    }
  }

  h3 {
    font-size: 16px;
  }

  .selected-section {
    margin-top: 15px;

    .el-tag {
      margin-bottom: 5px;
    }

    .el-tag+.el-tag {
      margin-left: 10px;
    }
  }

  .select-section {
    border: solid 1px #d1d1d1;
    padding: 10px;
    margin-top: 10px;
  }

  .select-list {
    margin-top: 10px;
    height: 300px;
    overflow: auto;
  }

  .select-item {
    height: 24px;
    margin-top: 5px;
  }
  .el-radio-group{
    display: block;
  }
}

</style>
