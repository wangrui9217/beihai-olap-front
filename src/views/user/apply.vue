<template>
  <div class="apply" v-loading.fullscreen="loading">
    <!-- <span class="open-user-form" @click="openUserInfo()">完善申请人信息</span> -->
    <h2 v-if="!arbitralInfo" class="g-title">新增仲裁请求</h2>
    <h2 v-else class="g-title">编辑仲裁请求</h2>
    <el-card class="g-box-card">
      <div slot="header">
        <span>仲裁申请书</span>
      </div>
      <el-upload class="g-uploader" :headers="headers" :action="uploadUrl" :on-error="uploadError" :on-success="fileSuccess" :before-upload="fileFilter" :show-file-list="false">
        <ul class="g-upload-list">
          <li v-for="(file, index) in arbitrationApplication" :key="index" v-if="file.attachmentEvidenceStatus!=2">
            <div class="img-container"><img :src="file.url" alt="">
            </div>
            <p>{{file.attachmentDatas[0].attachName}}</p>
          </li>
        </ul>
        <i class="el-icon-plus g-uploader-icon" v-if="showIconPlus"></i>
        <div slot="tip" class="el-upload__tip">只能上传pdf和jpg,png格式文件，且不超过10M</div>
      </el-upload>
    </el-card>
    <el-card class="g-box-card">
      <div slot="header">
        <span>证据资料</span>
      </div>
      <upload-evidence
        ref="evidenceForm"
        :headers="headers"
        :my-evidences="evidences"
        :uploadUrl="uploadUrl"
      ></upload-evidence>
      <span @click="addEvidence" class="add-button"> + 新增证据资料</span>
      <div class="el-upload__tip">只能上传pdf和word,jpg,png格式文件，且不超过10M</div>
    </el-card>
    <el-card class="g-box-card" v-for="(item,index) in applyers" :key="item.formName" v-if="item.status != 2">
      <div slot="header">
        <el-button style="float: right; padding: 5px 10px;margin-top: -2px" type="default" @click="deleteApplyers(index)">删除</el-button>
        <span>{{item.title}}</span>
      </div>
      <el-radio-group label="申请人类型" :disabled="!!item.id" v-model="item.applyerType" @change="exchangeApplyer(item)" class="css_applyed_type">
        <el-radio label="1">自然人</el-radio>
        <el-radio label="2">法人</el-radio>
      </el-radio-group>
      <el-form :model="item.pFormData" :ref="item.pFormName" label-width="140px" v-if="item.applyerType==='1'">
        <el-row >
          <el-col :span="12">
            <el-form-item label="姓名" prop="pRealname" :rules="rules.realnameRule">
              <el-input v-model.trim="item.pFormData.pRealname" placeholder="姓名" :maxLength="50"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="pIdnum" :rules="rules.idnumRule">
              <el-input v-model.trim="item.pFormData.pIdnum" placeholder="身份证号" @change="(idnum) => {getInfoByIdCard(idnum,item.pFormData)}"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="pPhone" :rules="rules.phoneRule">
              <el-input v-model.trim="item.pFormData.pPhone" placeholder="手机号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="pMail" :rules="rules.emailRuleNotRequired">
              <el-input v-model.trim="item.pFormData.pMail" placeholder="邮箱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="item.pFormData.sex" style="width: 100%" disabled>
                <el-option v-for="item in [{label:'男',value:'1'},{label:'女',value:'2'}]" :key="item.value" :label="item.label" :value="item.value" ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-input v-model.trim="item.pFormData.birthDay" placeholder="出生日期" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="民族">
              <el-input v-model.trim="item.pFormData.nation" placeholder="民族" :maxLength="10"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮编" prop="pZipcode" :rules="rules.zipcodeRule">
              <el-input v-model.trim="item.pFormData.pZipcode" placeholder="邮编" :maxLength="6"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="户籍地址" prop="pIdNumAddress" :rules="rules.addressRule">
              <el-input v-model.trim="item.pFormData.pIdNumAddress" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="约定送达地址" prop="pAdress" :rules="rules.addressRule">
              <el-input v-model.trim="item.pFormData.pAdress" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="身份证" prop="hasIdImg" :rules="rules.hasIdImgRule">
              <el-input style="display: none" type="hidden" v-model="item.pFormData.hasIdImg"></el-input>
              <ul class="upload-p-img">
                <li>
                  <el-upload :headers="headers" :on-error="uploadError" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(item.pFormData, 'pIdAttachForntBase64', 'p')" list-type="picture-card" :before-upload="imgFilter">
                    <img class="g-upload-img" :src="item.pFormData.pIdAttachForntBase64Url" alt="">
                    <div class="icon-plus" v-if="!item.pFormData.pIdAttachForntBase64"><i class="el-icon-plus"></i></div>
                    <div class="el-upload__tip px12" slot="tip">正面</div>
                  </el-upload>
                </li>
                <li>
                  <el-upload :headers="headers" :on-error="uploadError" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(item.pFormData, 'pIdAttachRearBase64', 'p')" list-type="picture-card" :before-upload="imgFilter">
                    <img class="g-upload-img" :src="item.pFormData.pIdAttachRearBase64Url" alt="">
                    <div class="icon-plus" v-if="!item.pFormData.pIdAttachRearBase64"><i class="el-icon-plus"></i></div>
                    <div class="el-upload__tip px12" slot="tip">反面</div>
                  </el-upload>
                </li>
              </ul>
            </el-form-item>
            <div class="el-upload__tip">只能上传jpg/png文件，且不超过10M</div>
          </el-col>
        </el-row>
      </el-form>
      <div v-else>
        <div class="css_coinfo">
          <dl>
            <dt>名称：</dt>
            <dd>
              <el-select v-model="item.coFormData.coName" size="small" @change="changeChildCompany(item)">
               <el-option v-for="comp in item.viewCompanies" :key="comp.userCoId" :label="comp.coName" :value="comp.coName" ></el-option>
            </el-select>
            </dd>
          </dl>
          <dl>
            <dt>统一信用代码：</dt>
            <dd>
              <p>{{item.coFormData.coIdnum}}</p>
            </dd>
          </dl>
          <dl>
            <dt>企业地址：</dt>
            <dd>
              <p>{{item.coFormData.coAdress}}</p>
            </dd>
          </dl>
          <dl>
            <dt>约定送达地址：</dt>
            <dd>
              <p>{{item.coFormData.coArrivedAddress}}</p>
            </dd>
          </dl>
          <dl>
            <dt>邮编：</dt>
            <dd>
              <p>{{item.coFormData.coZipcode}}</p>
            </dd>
          </dl>
          <dl>
            <dt>法定代表人：</dt>
            <dd>
              <p>{{item.coFormData.coLegalPerson}}</p>
            </dd>
          </dl>
          <dl>
            <dt>代表人手机号：</dt>
            <dd>
              <p>{{item.coFormData.coPhone}}</p>
            </dd>
          </dl>
         <dl>
            <dt>代表人身份证号：</dt>
            <dd>
              <p>{{item.coFormData.coLegalPersonIdnum}}</p>
            </dd>
          </dl>
          <dl>
            <dt>法定代表人邮箱：</dt>
            <dd>
              <p>{{item.coFormData.coEmail}}</p>
            </dd>
          </dl>
        </div>
        <div class="css_co_attach">
          <dl>
            <dt>营业执照和身份证明：</dt>
            <dd>
              <div v-if="item.coFormData.coLicenceAttachBase64Url">
                <img :src="item.coFormData.coLicenceAttachBase64Url">
                <p>营业执照</p>
              </div>
              <div v-if="item.coFormData.coIdPaperAttachBase64Url">
                <img :src="item.coFormData.coIdPaperAttachBase64Url">
                <p>身份证明</p>
              </div>
              <div v-if="item.coFormData.coIdAttachForntBase64Url">
                <img :src="item.coFormData.coIdAttachForntBase64Url">
                <p>身份证正面</p>
              </div>
              <div v-if="item.coFormData.coIdAttachRearBase64Url">
                <img :src="item.coFormData.coIdAttachRearBase64Url">
                <p>身份证反面</p>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </el-card>
    <span @click="addApplyers" class="add-button"> + 添加申请人</span>
    <el-card class="g-box-card" v-for="(item,index) in applyed" :key="item.formName" v-if="item.status != 2">
      <div slot="header">
        <el-button style="float: right; padding: 5px 10px;margin-top: -2px" type="default" @click="deleteApplyed(index)">删除</el-button>
        <span>{{item.title}}</span>
      </div>
      <el-radio-group :disabled="!!item.id" label="被申请人类型" v-model="item.applyedType" @change="exchangeApplyed(item)" class="css_applyed_type">
        <el-radio label="1" >自然人</el-radio>
        <el-radio label="2" >法人</el-radio>
      </el-radio-group>
      <el-form :model="item.pFormData" :ref="item.pFormName" label-width="140px" v-if="item.applyedType==='1'">
        <el-row >
          <el-col :span="12">
            <el-form-item label="姓名" prop="pRealname" :rules="rules.realnameRule">
              <el-input v-model.trim="item.pFormData.pRealname" placeholder="姓名" :maxLength="50"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="pIdnum" :rules="rules.idnumRule">
              <el-input v-model.trim="item.pFormData.pIdnum" placeholder="身份证号" @change="(idnum) => {getInfoByIdCard(idnum,item.pFormData)}"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="pPhone" :rules="rules.phoneRule">
              <el-input v-model.trim="item.pFormData.pPhone" placeholder="手机号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="pMail" :rules="rules.emailRuleNotRequired">
              <el-input v-model.trim="item.pFormData.pMail" placeholder="邮箱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="item.pFormData.sex" style="width: 100%" disabled>
                <el-option v-for="item in [{label:'男',value:'1'},{label:'女',value:'2'}]" :key="item.value" :label="item.label" :value="item.value" ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDay">
              <el-input v-model.trim="item.pFormData.birthDay" placeholder="出生日期" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="民族" prop="nation">
              <el-input v-model.trim="item.pFormData.nation" placeholder="民族" :maxLength="10"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮编" prop="pZipcode" :rules="rules.zipcodeRule">
              <el-input v-model.trim="item.pFormData.pZipcode" placeholder="邮编" :maxLength="6"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="户籍地址" prop="pIdNumAddress" :rules="rules.addressRule">
              <el-input v-model.trim="item.pFormData.pIdNumAddress" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="约定送达地址" prop="pAdress" :rules="rules.addressRule">
              <el-input v-model.trim="item.pFormData.pAdress" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="身份证" prop="hasIdImg" :rules="rules.hasIdImgRule">
              <el-input style="display: none" type="hidden" v-model="item.pFormData.hasIdImg"></el-input>
              <ul class="upload-p-img">
                <li>
                  <el-upload :headers="headers" :on-error="uploadError" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(item.pFormData, 'pIdAttachForntBase64', 'p')" list-type="picture-card" :before-upload="imgFilter">
                    <img class="g-upload-img" :src="item.pFormData.pIdAttachForntBase64Url" alt="">
                    <div class="icon-plus" v-if="!item.pFormData.pIdAttachForntBase64"><i class="el-icon-plus"></i></div>
                    <div class="el-upload__tip px12" slot="tip">正面</div>
                  </el-upload>
                </li>
                <li>
                  <el-upload :headers="headers" :on-error="uploadError" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(item.pFormData, 'pIdAttachRearBase64', 'p')" list-type="picture-card" :before-upload="imgFilter">
                    <img class="g-upload-img" :src="item.pFormData.pIdAttachRearBase64Url" alt="">
                    <div class="icon-plus" v-if="!item.pFormData.pIdAttachRearBase64"><i class="el-icon-plus"></i></div>
                    <div class="el-upload__tip px12" slot="tip">反面</div>
                  </el-upload>
                </li>
              </ul>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-form :model="item.coFormData" :ref="item.coFormName" label-width="140px" v-if="item.applyedType === '2'">
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="coName" :rules="rules.coNameRule">
              <el-input v-model.trim="item.coFormData.coName" placeholder="名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一信用代码" prop="coIdnum" :rules="rules.coIdnum">
              <el-input v-model.trim="item.coFormData.coIdnum" placeholder="统一信用代码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业地址" prop="coAdress" :rules="rules.addressRule">
              <el-input v-model.trim="item.coFormData.coAdress" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="约定送达地址" prop="coArrivedAddress" :rules="rules.addressRule">
              <el-input v-model.trim="item.coFormData.coArrivedAddress" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮编" prop="coZipcode" :rules="rules.zipcodeRule">
              <el-input v-model.trim="item.coFormData.coZipcode" placeholder="邮编" :maxLength="6"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法定代表人" prop="coLegalPerson" :rules="rules.realnameRule">
              <el-input v-model.trim="item.coFormData.coLegalPerson" placeholder="法定代表人"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代表人手机号" prop="coPhone" :rules="rules.phoneRule">
              <el-input v-model.trim="item.coFormData.coPhone" placeholder="手机号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代表人身份证号" prop="coLegalPersonIdnum" :rules="rules.coLegalPersonIdnumRule">
              <el-input v-model.trim="item.coFormData.coLegalPersonIdnum" placeholder="身份证号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代表人邮箱" prop="coEmail" :rules="rules.emailRuleNotRequired">
              <el-input v-model.trim="item.coFormData.coEmail" placeholder="邮箱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="营业执照和身份证明" class="upload-p-img" prop="coAttaches">
              <ul>
                <li>
                  <el-upload :headers="headers" :on-error="uploadError" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(item.coFormData, 'coLicenceAttachBase64')" list-type="picture-card" :before-upload="imgFilter">
                    <img class="g-upload-img" :src="item.coFormData.coLicenceAttachBase64Url" alt="">
                    <div class="icon-plus" v-if="!item.coFormData.coLicenceAttachBase64"><i class="el-icon-plus"></i></div>
                    <div class="el-upload__tip px12" slot="tip">营业执照</div>
                  </el-upload>
                </li>
                <li>
                  <el-upload :headers="headers" :on-error="uploadError" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(item.coFormData, 'coIdPaperAttachBase64')" list-type="picture-card" :before-upload="imgFilter">
                    <img class="g-upload-img" :src="item.coFormData.coIdPaperAttachBase64Url" alt="">
                    <div class="icon-plus" v-if="!item.coFormData.coIdPaperAttachBase64"><i class="el-icon-plus"></i></div>
                    <div class="el-upload__tip px12" slot="tip">身份证明</div>
                  </el-upload>
                </li>
                <li>
                  <el-upload :headers="headers" :on-error="uploadError" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(item.coFormData, 'coIdAttachForntBase64')" list-type="picture-card" :before-upload="imgFilter">
                    <img class="g-upload-img" :src="item.coFormData.coIdAttachForntBase64Url" alt="">
                    <div class="icon-plus" v-if="!item.coFormData.coIdAttachForntBase64"><i class="el-icon-plus"></i></div>
                    <div class="el-upload__tip px12" slot="tip">身份证正面</div>
                  </el-upload>
                </li>
                <li>
                  <el-upload :headers="headers" :on-error="uploadError" :action="uploadUrl" name="file" :show-file-list="false" :on-success="imgSuccess(item.coFormData, 'coIdAttachRearBase64')" list-type="picture-card" :before-upload="imgFilter">
                    <img class="g-upload-img" :src="item.coFormData.coIdAttachRearBase64Url" alt="">
                    <div class="icon-plus" v-if="!item.coFormData.coIdAttachRearBase64"><i class="el-icon-plus"></i></div>
                    <div class="el-upload__tip px12" slot="tip">身份证反面</div>
                  </el-upload>
                </li>
              </ul>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="el-upload__tip">只能上传jpg/png文件，且不超过10M</div>
      </el-form>
    </el-card>
    <span @click="addApplyed" class="add-button"> + 添加被申请人</span>
    <el-card class="g-box-card">
      <div slot="header">
        <span>合同信息</span>
      </div>
      <el-form :model="contractData" ref="contractData" label-width="130px" :rules="contractRules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品类型" prop="arbProductId">
              <el-select v-model="contractData.arbProductId" style="width: 100%" @change="calc">
                <el-option v-for="item in productList" :key="item.id" :label="item.productName" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="本金（元）" prop="capitalMoney">
              <el-input v-model.number="contractData.capitalMoney" @blur="calc" :maxLength="13"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已还本金（元）" prop="paidMoney">
              <el-input v-model.number="contractData.paidMoney" @blur="calc" :maxLength="13"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="利息（元）" prop="interest">
              <el-input v-model.number="contractData.interest" @blur="calc" :maxLength="13"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已还利息（元）" prop="paidInterest">
              <el-input v-model.number="contractData.paidInterest" @blur="calc" :maxLength="13"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="其他费用（元）" prop="otherMoney">
              <el-input v-model.number="contractData.otherMoney" @blur="calc" :maxLength="13"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="借款日" prop="borrowTime">
              <el-date-picker v-model="contractData.borrowTime" type="date" :editable="false" value-format="yyyy-MM-dd" style="width: 100%" placeholder="选择日期" :picker-options="borrowTimeOptions" >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部分还款日期">
              <el-date-picker v-model="contractData.paidTime" type="date" :editable="false" value-format="yyyy-MM-dd" style="width: 100%" placeholder="选择日期" :picker-options="paidTimeOptions">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期日" prop="expiringDate">
              <el-date-picker v-model="contractData.expiringDate" type="date" :editable="false" value-format="yyyy-MM-dd" style="width: 100%" placeholder="选择日期" :picker-options="expiringDateOptions">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card class="g-box-card">
      <div slot="header">
        <span>仲裁请求</span>
      </div>
      <el-form :model="mainForm" ref="mainForm" label-width="130px" :rules="mainRules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="案由" prop="arbiType">
              <el-input v-model="mainForm.arbiType" type="hidden" style="display: none"></el-input>
              <el-cascader class="apply-cascader" v-model="selectedOptions" placeholder="搜索" @change="getArbiTypeAndTypeName" :options="arbiTypes" filterable :show-all-levels="false" style="width: 100%;"></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标的额">
              <p class="money">￥{{mainForm.arbDisputeMoney}}</p>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <div class="text"><span>仲裁费用</span>受理费<b>{{acceptfee}}</b>元，处理费<b>{{handlingCharges}}</b>元，合计<b>{{allsum}}</b>元</div>
          </el-col>
          <el-col :span="24" class="mt20">
            <el-form-item label="仲裁请求" prop="arbApplication" :rules="rules.arbApplication">
              <el-input type="textarea" :autosize="{minRows: 6}" v-model.trim="mainForm.arbApplication" :maxLength="2000"></el-input>
            </el-form-item>
            <el-form-item label="事实和理由" prop="arbApplicationDescription" :rules="rules.arbApplicationDescription">
              <el-input type="textarea" :autosize="{minRows: 6}" v-model.trim="mainForm.arbApplicationDescription" :maxLength="8000"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <div class="mt20 g-text-right">
      <el-button type="default" @click="back">返回</el-button>
      <el-button type="primary" @click="save" :loading="autoSaving">保存草稿</el-button>
      <el-button type="primary" @click="submit" :loading="autoSaving">提交</el-button>
    </div>
    <!-- <userInfoForm ref="userInfoForm"></userInfoForm> -->
  </div>
</template>
<script>
import { api } from '@/api'
import VDistpicker from 'v-distpicker'
import uploadEvidence from '@/views/common/uploadEvidence'
import IMG from '@/const/img'
import Rules from '@/util/rules'
import util from '@/util/util'
// import userInfoForm from '@user/common/userInfoForm'
export default {
  components: { VDistpicker, uploadEvidence},
  data() {
    return {
      loading: false,
      applyed: [],
      applyers: [],
      rules: Rules,
      mime: [".jpeg", ".jpg", ".png", ".pdf"],
      coInfo: {
        coStatus: 1,
        coLicenceAttachBase64Url: IMG.Licence,
        coIdAttachForntBase64Url: IMG.Front,
        coIdAttachRearBase64Url: IMG.Rear,
        coIdPaperAttachBase64Url: IMG.Cosign
      },
      pInfo: {
        pStatus: 1,
        pIdAttachForntBase64Url: IMG.Front,
        pIdAttachRearBase64Url: IMG.Rear
      },
      contractData: {
        "borrowTime": "",
        "arbProductId": "",
        "capitalMoney": 0,
        otherMoney: 0,
        interest: 0,
        "paidInterest": 0,
        "paidMoney": 0,
        "paidTime": "",
        "expiringDate": ""
      },
      contractRules: {
        arbProductId: { required: true, message: '请选择产品类型'},
        expiringDate: { required: true, message: '请选择到期日', trigger: 'blur' },
        paidMoney: [
          { required: true, message: '请输入已还本金', trigger: 'blur' },
          { pattern: /^\d+(\.\d+)?$/, message: '已还本金格式为非负数字', trigger: 'blur' }
        ],
        capitalMoney: [
          { required: true, message: '请输入本金', trigger: 'blur' },
          { pattern: /^[1-9]\d*(\.\d+)?$/, message: '本金格式为正数数字', trigger: 'blur' }
        ],
        otherMoney: [
          { required: true, message: '请输入其他费用', trigger: 'blur' },
          { pattern: /^\d+(\.\d+)?$/, message: '其他费用格式为非负数字', trigger: 'blur' }
        ],
        interest: [
          { required: true, message: '请输入利息', trigger: 'blur' },
          { pattern: /^\d+(\.\d+)?$/, message: '利息格式为非负数字', trigger: 'blur' }
        ],
        paidInterest: [
          { required: true, message: '请输入已还利息', trigger: 'blur' },
          { pattern: /^\d+(\.\d+)?$/, message: '已还利息格式为非负数字', trigger: 'blur' }
        ],
        borrowTime: { required: true, message: '请输入借款日', trigger: 'blur' },
      },
      mainForm: {
        arbiType: '',
        arbDisputeMoney: '',
        arbApplication: '',
        arbApplicationDescription: ''
      },
      acceptfee: 0,
      handlingCharges: 0,
      allsum: 0,
      arbiTypes: [],
      mainRules: {
        arbiType: { required: true, message: '请选择案由'}
      },
      uploadUrl: api.uploadURL,
      arbName: '',
      arbitrationApplication: [],  // 仲裁申请书
      evidences: [],  //  证据资料
      productList: [],  // 产品类型
      selectedOptions: [],
      arbiTypeSource: [],
      borrowTimeOptions: {
        disabledDate:(time) => {
          let now = new Date().getTime()
          let paidTime = new Date(this.contractData.paidTime).getTime()
          let expiringDate = new Date(this.contractData.expiringDate).getTime()
          let max = paidTime?paidTime:expiringDate?expiringDate:now
          return time.getTime() > max
        }
      },
      paidTimeOptions: {
        disabledDate:(time) => {
          let now = new Date().getTime()
          let borrowTime = new Date(this.contractData.borrowTime).getTime()
          let expiringDate = new Date(this.contractData.expiringDate).getTime()
          let max = expiringDate?expiringDate:now
          let min = borrowTime?borrowTime:0
          return time.getTime() > max || time.getTime() < min
        }
      },
      expiringDateOptions: {
        disabledDate:(time) => {
          let now = new Date().getTime()
          let borrowTime = new Date(this.contractData.borrowTime).getTime()
          let paidTime = new Date(this.contractData.paidTime).getTime()
          let max = now
          let min = paidTime?paidTime:borrowTime?borrowTime:0
          return time.getTime() > max || time.getTime() < min
        }
      },
      timeout: null,
      savedData: '',
      arbitralInfoId: '',
      arbitralInfo: null,
      autoSaving: false,
      childCompanies: []
    }
  },
  watch: {
    // 修改案件时，格式化案件详情到表单中
    arbitralInfo: function () {
      if(this.arbitralInfo.arbitralAttachment){  // 仲裁申请书和证据资料
        let arbitralAttachments = this.arbitralInfo.arbitralAttachment
        this.evidences = []
        arbitralAttachments.forEach(item => {
          if(item.evidenceProperty === 1){
            item.arbAttachmentDatas.forEach(file => {
              let lastName = file.attachName.substring(file.attachName.lastIndexOf('.')).toLowerCase()
              if (/\.jpg|\.png|\.jpeg/.test(lastName) === false) {
                file.url = util.getIcon(file.attachName)
              }
              else{
                file.url = api.getImgURL(file.attachUrlDes)
              }
              this.arbitrationApplication = []
              this.arbitrationApplication.push({
                attachmentEvidenceId: item.attachmentEvidenceId,
                arbitralPtype: 2,     // 1-被申请人 2-申请人
                attachmentDatas: [{
                  attachUrlBase64: file.attachUrl,
                  attachName: file.attachName,
                  attachStatus: 1,
                  attachProperty: 1,
                  attachType: 1,
                  attachId: file.attachId
                }],
                url: file.url,
                evidenceName: '仲裁申请书',
                attachmentEvidenceStatus: 1,
                evidenceProperty: 1
              })
            })
          }
          else{
            let attachmentDatas = []
            item.arbAttachmentDatas&&item.arbAttachmentDatas.forEach(file => {
              attachmentDatas.push({
                attachUrlBase64: file.attachUrl,
                attachName: file.attachName,
                attachProperty: 2,
                attachStatus: 1,
                attachType: 1,
                attachId: file.attachId
              })
            })
            this.evidences.push({
              arbitralPtype: 2,     // 1-被申请人 2-申请人
              attachmentEvidenceId: item.attachmentEvidenceId,
              attachmentDatas: attachmentDatas,
              attachmentEvidenceStatus: 1,
              evidenceTitle: item.evidenceTitle,
              evidenceContent: util.decodeTEXT(item.evidenceContent),
              fileFormName: util.uuidfn(),
              evidenceName: item.evidenceName,
              evidenceProperty: 2
            })
          }
        })
      }
      if(this.arbitralInfo.applyedArr){   // 格式化被申请人
        this.applyed = []
        let applyedArr = this.arbitralInfo.applyedArr
        applyedArr.forEach(item => {
          let obj = null
          let len = this.applyed.length + 1;
          if(item.pType){
            if(item.sex){
              item.sex = String(item.sex)
            }
            else{
              item.sex = ''
            }
            if(item.birthday){
              item.birthDay = String(item.birthday)
            }
            item.pIdAttachForntBase64Url = IMG.Front
            item.pIdAttachForntBase64 = item.pIdAttachFornt
            item.pIdAttachRearBase64Url = IMG.Rear
            item.pIdAttachRearBase64 = item.pIdAttachRear
            item.hasIdImg = (item.pIdAttachFornt && item.pIdAttachRear)?'true':''
            this.setAttachIcons(item, ['pIdAttachFornt','pIdAttachRear'])
            obj = {
              applyedType: '1',
              pFormName: util.uuidfn(),
              pFormData: Object.assign({}, item),
              coFormName: util.uuidfn(),
              coFormData: Object.assign({}, this.coInfo),
              title: '被申请人' + util.exchangeIndex(len),
              id: item.id
            }
          }
          else{
            item.coLicenceAttachBase64Url = IMG.Licence
            item.coIdAttachForntBase64Url = IMG.Front
            item.coIdAttachRearBase64Url = IMG.Rear
            item.coIdPaperAttachBase64Url = IMG.Cosign
            item.coLicenceAttachBase64 = item.coLicenceAttach
            item.coIdPaperAttachBase64 = item.coIdPaperAttach
            item.coIdAttachForntBase64 = item.coIdAttachFornt
            item.coIdAttachRearBase64 = item.coIdAttachRear
            this.setAttachIcons(item, ['coLicenceAttach','coIdPaperAttach','coIdAttachFornt','coIdAttachRear'])
            obj = {
              applyedType: '2',
              coFormName: util.uuidfn(),
              coFormData: Object.assign({}, item),
              title: '被申请人' + util.exchangeIndex(len),
              id: item.id,
              pFormName: util.uuidfn(),
              pFormData: Object.assign({}, this.pInfo),
            }
          }
          this.applyed.push(obj)
        })
      }
      if(this.arbitralInfo.applyersArr){ // 格式化申请人
        this.applyers = []
        var applyersArr = this.arbitralInfo.applyersArr
        applyersArr.forEach(item => {
          let obj = null
          let len = this.applyers.length + 1;
          if(item.pType){
            if(item.sex){
              item.sex = String(item.sex)
            }
            else{
              item.sex = ''
            }
            if(item.birthday){
              item.birthDay = String(item.birthday)
            }
            item.pIdAttachForntBase64Url = IMG.Front
            item.pIdAttachForntBase64 = item.pIdAttachFornt
            item.pIdAttachRearBase64Url = IMG.Rear
            item.pIdAttachRearBase64 = item.pIdAttachRear
            item.hasIdImg = (item.pIdAttachFornt && item.pIdAttachRear)?'true':''
            this.setAttachIcons(item, ['pIdAttachFornt','pIdAttachRear'])
            obj = {
              applyerType: '1',
              title: '申请人' + util.exchangeIndex(len),
              pFormName: util.uuidfn(),
              pFormData: Object.assign({}, item),
              coFormName: util.uuidfn(),
              coFormData: Object.assign({}, this.coInfo),
              id: item.id,
              viewCompanies: []
            }
          }
          else{
            item.coLicenceAttachBase64Url = IMG.Licence
            item.coIdAttachForntBase64Url = IMG.Front
            item.coIdAttachRearBase64Url = IMG.Rear
            item.coIdPaperAttachBase64Url = IMG.Cosign
            item.coLicenceAttachBase64 = item.coLicenceAttach
            item.coIdPaperAttachBase64 = item.coIdPaperAttach
            item.coIdAttachForntBase64 = item.coIdAttachFornt
            item.coIdAttachRearBase64 = item.coIdAttachRear
            this.setAttachIcons(item, ['coLicenceAttach','coIdPaperAttach','coIdAttachFornt','coIdAttachRear'])
            obj = {
              applyerType: '2',
              title: '申请人' + util.exchangeIndex(len),
              pFormName: util.uuidfn(),
              pFormData: Object.assign({}, this.pInfo),
              coFormData: Object.assign({}, item),
              id: item.id,
              viewCompanies: []
            }
          }
          this.applyers.push(obj)
        })
      }
      // console.log(this.applyed)
      // console.log(this.applyers)
      if(this.arbitralInfo.arbitralContractAdvancey){  // 合同信息
        let arbitralContractAdvanceData = this.arbitralInfo.arbitralContractAdvancey
        this.contractData = Object.assign({}, arbitralContractAdvanceData)
        this.contractData.borrowTime = this.contractData.borrowTime==='0001-01-01'?'':this.contractData.borrowTime
        this.contractData.expiringDate = this.contractData.expiringDate==='0001-01-01'?'':this.contractData.expiringDate
      }
      if(this.arbitralInfo.otherData){
        let otherData = this.arbitralInfo.otherData
        this.mainForm.arbApplication = util.decodeTEXT(otherData.arbApplication)  // 仲裁请求
        this.mainForm.arbApplicationDescription = util.decodeTEXT(otherData.arbApplicationDescription)  // 事实与理由
        // 案由
        var dictId = otherData.dictId
        this.mainForm.arbiType = dictId  // 案由id
        this.arbName = otherData.arbName  // 案由name
        if(dictId && this.arbiTypeSource.length !== 0){
          this.getDictId()
        }
      }
      if(this.arbitralInfo.aboutMoney){  // 仲裁费信息
        let aboutMoney = this.arbitralInfo.aboutMoney
        this.mainForm.arbDisputeMoney = aboutMoney.arbDisputeMoney
        this.allsum = aboutMoney.totalCost
        this.acceptfee = aboutMoney.acceptCost
        this.handlingCharges = aboutMoney.handleCost
      }
    }
  },
  computed: {
    // 仲裁申请书只能有一个，所以上传一个之后隐藏加号按钮，只可以替换无法新增
    showIconPlus(){
      return this.arbitrationApplication.length === 0
    },
    headers(){
      return {
        Authorization: this.$store.state.user.userAccessToken
      }
    }
  },
  methods: {
    addEvidence(){
      this.$refs.evidenceForm.add()
    },
    addApplyed() {
      let l = this.applyed.filter(item => {return item.status != 2}).length + 1;
      let obj = {
        applyedType: '1',
        title: '被申请人' + util.exchangeIndex(l),
        status: 1,
        pFormName: util.uuidfn(),
        pFormData: Object.assign({}, this.pInfo),
        coFormName: util.uuidfn(),
        coFormData: Object.assign({}, this.coInfo),
      }
      this.applyed.push(obj)
    },
    deleteApplyed(i) {
      this.$confirm('确定删除该被申请人吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if(this.applyed[i].id){
          let item = this.applyed[i]
          item.status = 2
          if(item.applyedType == '1'){
            item.pFormData.pStatus = 2
          }
          else{
            item.coFormData.coStatus = 2
          }
          this.applyed.splice(i, 1)
          this.applyed.push(item)
        }
        else{
          this.applyed.splice(i, 1)
        }
        let applyed = this.applyed.filter(item => {
          return item.status != 2
        })
        applyed.forEach((item,i) => {
          item.title = '被申请人' + util.exchangeIndex(i+1)
        })

      }).catch(() => {});
    },
    addApplyers(){
      let applyers = this.applyers.filter(item => {return item.status != 2})
      let len = applyers.length + 1;
      let obj = {
        applyerType: '1',
        status: 1,
        title: '申请人' + util.exchangeIndex(len),
        pFormName: util.uuidfn(),
        pFormData: Object.assign({}, this.pInfo),
        coFormData: {},
        viewCompanies: this.getUsefulCompany()
      }
      this.applyers.push(obj)
    },
    changeChildCompany(obj){
      let o = obj.viewCompanies.find(item => {
        return item.coName === obj.coFormData.coName
      })
      obj.coFormData = Object.assign(obj.coFormData, o)
      this.initChildCompany()
    },
    initChildCompany(){
      let usefulCompany = this.getUsefulCompany()
      this.applyers.forEach(item => {
        if(item.status != 2){
          if(!item.coFormData.coName){
            item.viewCompanies = usefulCompany
          }
          else{
            let mySelected = this.childCompanies.filter(comp => {
              return comp.coName === item.coFormData.coName
            })
            mySelected = mySelected.concat(usefulCompany)
            item.viewCompanies = mySelected
          }
        }
      })
    },
    getUsefulCompany(){
      let coNames = []
      this.applyers.forEach(item => {
        if(item.applyerType === '2' && item.status != 2){
          coNames.push(item.coFormData.coName)
        }
      })
      return this.childCompanies.filter(item => {
        return coNames.indexOf(item.coName) < 0
      })
    },
    deleteApplyers(i) {
      this.$confirm('确定删除该申请人吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if(this.applyers[i].id){
          let item = this.applyers[i]
          item.status = 2
          if(item.applyerType == '1'){
            item.pFormData.pStatus = 2
          }
          else{
            item.coFormData.coStatus = 2
          }
          this.applyers.splice(i, 1)
          this.applyers.push(item)
        }
        else{
          this.applyers.splice(i, 1)
        }
        let applyer = this.applyers.filter(item => {
          return item.status != 2
        })
        applyer.forEach((item,i) => {
          item.title = '申请人' + util.exchangeIndex(i+1)
        })
        this.initChildCompany()
      }).catch(() => {});
    },
    imgSuccess(object, key, tag) {
      var formObject = object
      return (res, file) => {
        this.loading = false;
        if (res.code == '1') {
          object[key] = res.data.filePath;
          object[key + 'Url'] = URL.createObjectURL(file.raw);
          if (tag == 'p') {
            object['hasIdImg'] = (object['pIdAttachForntBase64'] && object['pIdAttachRearBase64']) ? 'true' : ''
          }
        } else {
          this.$alert(res.msg, '', {
            type: 'error'
          })
        }
      }
    },
    imgFilter(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf";
      const isLt3M = file.size / 1024 / 1024 < 10;
      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG,PNG 格式!');
        return false
      }
      if (!isLt3M) {
        this.$message.error('上传图片大小不能超过 10MB!');
        return false
      }
      this.loading = true;
      return isJPG && isLt3M;
    },
    fileFilter(file) {
      let endName = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      const isMime = this.mime.some((value) => {
        return value == endName
      })
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isMime) {
        this.$message.error('仅支持pdf和jpg,png格式文件上传!');
        return false
      }
      if (!isLt2M) {
        this.$message.error('单个文件不可超过10 MB!');
        return false
      }
      this.loading = true;
      return isMime && isLt2M;
    },
    uploadError(res){
      this.loading = false
      this.$store.dispatch('httpError', res)
      // this.$message.error('操作失败，代码：' + res.status)
    },
    fileSuccess(res, file) {
      this.loading = false;
      if (res.code === '1') {
        if (file.raw.type !== 'image/jpeg' && file.raw.type !== 'image/png') {
          file.url = util.getIcon(file.name)
        }
        if(this.arbitrationApplication.length > 0){
          if(this.arbitrationApplication[this.arbitrationApplication.length-1].attachmentEvidenceId){
            this.arbitrationApplication[this.arbitrationApplication.length-1].attachmentEvidenceStatus = 2
          }
          else{
            this.arbitrationApplication.pop()
          }
        }
        this.arbitrationApplication.push({
          arbitralPtype: 2,     // 1-被申请人 2-申请人
          attachmentDatas: [{
            attachUrlBase64: res.data.filePath,
            attachName: file.name,
            attachProperty: 1,
            attachStatus: 1,
            attachType: 1
          }],
          url: file.url,
          evidenceName: '仲裁申请书',
          attachmentEvidenceStatus: 1,
          evidenceProperty: 1
        })
      }
      else {
        this.$message.error(res.msg)
      }
    },
    getArbiTypes() {
      let arbiTypes = []
      api.getDictSys({}).then((res) => {
        if (res.data.code == '1') {
          arbiTypes = res.data.data
          this.arbiTypeSource = arbiTypes
          let rootType = arbiTypes.find(v => {
            return v.code === 'TEMPLATETEL'
          })
          this.arbiTypes = createNode(rootType.id)
          if(this.mainForm.arbiType !== ''){
            this.getDictId()
          }
        }
      })
      function createNode(pId) {
        let node = []
        arbiTypes.forEach(v => {
          if (v.parentid === pId) {
            let item = {
              value: v.id,
              label: v.name
            }
            let children = createNode(v.id)
            if(children.length > 0){
              item.children = children
            }
            node.push(item)
          }
        })
        return node
      }
    },
    getArbiTypeAndTypeName(value = '') {
      let arbiTypeObject = null
      if (value !== '') {
        value.forEach((v1, index) => {
          if (index === 0) {
            arbiTypeObject = this.arbiTypes.find(v2 => { return v2.value === v1 })
          } else {
            arbiTypeObject = arbiTypeObject.children.find(v2 => { return v2.value === v1 })
          }
        })
        this.mainForm.arbiType = arbiTypeObject.value
        this.arbName = arbiTypeObject.label
      }
    },
    // openUserInfo(){
    //   this.$refs.userInfoForm.openUserInfo()
    // },
    setAttachIcons(object,attaches){
      attaches.forEach(attach => {
        let attachName = object[attach]
        if(attachName){
          let lastName = attachName.substring(attachName.lastIndexOf('.')).toLowerCase()
          object[attach + 'Base64'] = object[attach]
          if (/\.jpg|\.png|\.jpeg/.test(lastName) === false) {
            object[attach + 'Base64Url'] = util.getIcon(attachName)
          }
          else{
            object[attach + 'Base64Url'] = api.getImgURL(object[attach + 'Des'])
          }
        }
        else{
          object[attach + 'Base64Url'] = ''
        }
      })
      return object
    },
    getUserArbitralProduct() {
      api.getUserArbitralProduct().then(res => {
        if (res.data.code === '1') {
          let data = res.data.data
          this.productList = data.filter(item => {return item.status != 2})
        }
        else{
          this.productList = []
        }
        if(this.productList.length === 0){
          this.$confirm('未查询到产品类型数据，您将无法完成申请。', "提示", {
            confirmButtonText: "返回",
            cancelButtonText: "关闭",
            closeOnClickModal: false,
            type: "warning"
          }).then(() => {
            this.$router.go(-1)
          })
          .catch(() => {});
        }
      })
    },
    calc(){
      let capitalMoney = Number(this.contractData.capitalMoney)
      let paidMoney = Number(this.contractData.paidMoney)
      let otherMoney = Number(this.contractData.otherMoney)
      let interest = Number(this.contractData.interest)
      let paidInterest = Number(this.contractData.paidInterest)
      if(capitalMoney - paidMoney <0){
        this.$message.error('已还本金不能大于本金')
        this.contractData.paidMoney = ''
        return false
      }
      else if(interest - paidInterest <0){
        this.$message.error('已还利息不能大于利息')
        this.contractData.paidInterest = ''
        return false
      }
      else if(capitalMoney>0 && paidMoney>=0 && otherMoney>=0 && interest>=0 && paidInterest>=0){
        let money = util.subtr(capitalMoney  + interest +  otherMoney, paidInterest + paidMoney)
        money = Number(money).toFixed(2)
        this.$refs['contractData'].validateField('arbProductId', (errorMessage) => {
          if(errorMessage === ''){
            api.getFundConfigureByDispute({
              dispute: money,
              productId: this.contractData.arbProductId
            }).then(res => {
              if(res.data.code === '1'){
                this.mainForm.arbDisputeMoney = money
                this.allsum = res.data.data.sum
                this.acceptfee = res.data.data.accept
                this.handlingCharges = res.data.data.handlingCharges
              }
              else{
                this.mainForm.arbDisputeMoney = ''
                this.allsum = 0
                this.acceptfee = 0
                this.handlingCharges = 0
                this.$message.error(res.data.msg)
              }
            })
          }
        })
      }
      else{
        this.mainForm.arbDisputeMoney = ''
        this.allsum = 0
        this.acceptfee = 0
        this.handlingCharges = 0
      }
    },
    save(type) {
      if(this.arbitralInfo){
        if(this.arbitralInfo.id && this.arbitralInfo.otherData.arbStatus>= 10){
          this.$message.error('当前案件已成功申请，不可以再次保存')
          return false
        }
      }
      // 自动保存or手动保存
      if(type === 'autosave'){
        this.httpAdd('autosave')
      }
      else {
        this.resetAutoSave()
        this.httpAdd('save')
      }
    },
    submit() {
      if(this.arbitralInfo){
        if(this.arbitralInfo.id && this.arbitralInfo.otherData.arbStatus >= 10){
          this.$message.error('当前案件已成功申请，不可以再次提交')
          return false
        }
      }
      let errorText = []
      let formArray = ['contractData', 'mainForm']
      if(this.arbitrationApplication.filter(item => {return item.attachmentEvidenceStatus!=2}).length === 0){
        errorText.push('未上传仲裁申请书')
      }
      let evidenceArr = this.$refs['evidenceForm'].validate()
      errorText = errorText.concat(evidenceArr)
      let applyerValidate = this.applyers.filter(item => {return item.status!=2})
      let applyedValidate = this.applyed.filter(item => {return item.status!=2})
      if(applyerValidate.length === 0){
        errorText.push('未填写申请人')
      }
      if(applyedValidate.length === 0){
        errorText.push('未填写被申请人')
      }
      let allInfos = applyerValidate.concat(applyedValidate)
      allInfos.forEach((v, index) => {
        var formName = ''
        if(v.applyerType === '1' || v.applyedType === '1'){
          formName = v.pFormName
        }
        else if(v.applyedType === '2'){
          formName = v.coFormName
        }
        if(formName){
          this.$refs[formName][0].validate((valid) => {
            if (valid) {} else {
              errorText.push(`${v.title}信息错误`)
            }
          })
        }
      })
      formArray.forEach(v => {
        this.$refs[v].validate((valid) => {
          if (valid) {} else {
            if (v === 'contractData') {
              errorText.push('合同信息错误')
            } else if (v === 'mainForm') {
              errorText.push('仲裁请求信息错误')
            }
          }
        })
      })
      if(this.allsum < 0){
        errorText.push('仲裁费用信息错误')
      }
      if (errorText.length > 0) {
        this.$message.error(errorText.join('，'))
      } else {
        this.resetAutoSave()
        this.httpAdd()
      }
    },
    httpAdd(type){
      let arbitralAttachmentRequests = this.evidences.concat(this.arbitrationApplication).map(v => {
        return {
          attachmentEvidenceId: v.attachmentEvidenceId,
          arbitralPtype: v.arbitralPtype,
          attachmentDatas: v.attachmentDatas,
          attachmentEvidenceStatus: v.attachmentEvidenceStatus,
          evidenceName: v.evidenceName,
          evidenceProperty: v.evidenceProperty,
          evidenceTitle: v.evidenceTitle,
          evidenceContent: util.encodeHTML(v.evidenceContent)
        }
      })
      arbitralAttachmentRequests.forEach(item => {
        if(item.attachmentEvidenceId){
          item.attachmentDatas.forEach(file => {
            file.arbitralAttachmentEvidenceId = item.attachmentEvidenceId
          })
        }
      })
      let arbitralCoInfoRequests = []
      let arbitralPInfoRequests = []
      var allInfos = this.applyers.concat(this.applyed)
      allInfos.forEach(item => {
        if(item.status!=2){
          let o = {}
          let arbType = ''
          let infoType = ''  // 1：个人。2：公司
          if(item.applyerType){   // 申请人
            arbType = 2
            infoType = item.applyerType
          }
          else{
            arbType = 1
            infoType = item.applyedType
          }
          if(infoType === '1'){  // 个人
            o = {
              "pType": arbType,
              "birthDay": item.pFormData.birthDay,
              "nation": item.pFormData.nation,
              "pAdress": item.pFormData.pAdress,
              "pIdAttachForntBase64": item.pFormData.pIdAttachForntBase64,
              "pIdAttachRearBase64": item.pFormData.pIdAttachRearBase64,
              "pIdNumAddress": item.pFormData.pIdNumAddress,
              "pIdnum": item.pFormData.pIdnum,
              "pMail": item.pFormData.pMail,
              "pPhone": item.pFormData.pPhone,
              "pRealname": item.pFormData.pRealname,
              "pZipcode": item.pFormData.pZipcode,
              "sex": item.pFormData.sex,
              "id": item.pFormData.id,
              "pStatus": item.pFormData.pStatus
            }
            arbitralPInfoRequests.push(o)
          }
          else{     // 公司
            o = {
              "coType": arbType,
              "coAdress": item.coFormData.coAdress,
              "coArrivedAddress": item.coFormData.coArrivedAddress,
              "coEmail": item.coFormData.coEmail,
              "coIdAttachForntBase64": item.coFormData.coIdAttachForntBase64,
              "coIdAttachRearBase64": item.coFormData.coIdAttachRearBase64,
              "coIdPaperAttachBase64": item.coFormData.coIdPaperAttachBase64,
              "coIdnum": item.coFormData.coIdnum,
              "coJob": item.coFormData.coJob,
              "coLegalPerson": item.coFormData.coLegalPerson,
              "coLegalPersonIdnum": item.coFormData.coLegalPersonIdnum,
              "coLicenceAttachBase64": item.coFormData.coLicenceAttachBase64,
              "coName": item.coFormData.coName,
              "coPhone": item.coFormData.coPhone,
              "coZipcode": item.coFormData.coZipcode,
              "id": item.coFormData.id,
              "userCoInfoId": item.coFormData.userCoId,
              "arbitralAgentInfo": item.coFormData.arbitralAgentInfo,
              "coStatus": item.coFormData.coStatus
            }
            arbitralCoInfoRequests.push(o)
          }
        }
      })

      let params = JSON.parse(JSON.stringify({
        "arbApplication": util.encodeHTML(this.mainForm.arbApplication),   // 仲裁请求
        "arbApplicationDescription": util.encodeHTML(this.mainForm.arbApplicationDescription),  // 事实与理由
        "arbArbitrateMoney": this.allsum,  // 总计仲裁费
        "arbDisputeMoney": Number(this.mainForm.arbDisputeMoney), // 标的额=本金 - 已还本金
        "arbName": this.arbName,  // 案由名称
        dictId: this.mainForm.arbiType, // 案由id
        "arbitralAttachmentRequests": arbitralAttachmentRequests,  // 附件资料
        "arbitralCoInfoRequests": arbitralCoInfoRequests,  // 企业信息数据集合
        "arbitralContractAdvanceData": this.contractData,  // 合同信息
        "arbitralPInfoRequests": arbitralPInfoRequests, // 个人信息数据集合
        "isSave": 0, // 1，保存; 2,保存并提交
        id: ''
      }))
      if(this.arbitralInfo){
        params.id = this.arbitralInfo.id
      }

      /*console.log(JSON.stringify(params))
      return false*/
      if(type !== undefined){
        if(JSON.stringify(params) === '{"arbApplication":"","arbApplicationDescription":"","arbArbitrateMoney":0,"arbDisputeMoney":0,"arbName":"","dictId":"","arbitralAttachmentRequests":[{"arbitralPtype":2,"attachmentDatas":[],"attachmentEvidenceStatus":1,"evidenceName":"证据一","evidenceProperty":2,"evidenceTitle":"","evidenceContent":""}],"arbitralCoInfoRequests":[],"arbitralContractAdvanceData":{"borrowTime":"","arbProductId":"","capitalMoney":0,"otherMoney":0,"interest":0,"paidInterest":0,"paidMoney":0,"paidTime":"","expiringDate":""},"arbitralPInfoRequests":[{"pType":2,"pStatus":1},{"pType":1,"pStatus":1}],"isSave":0,"id":""}'){
          if(type === 'save'){
            this.$message.error('您尚未输入任何数据')
          }
          return false
        }
        params.isSave = 1
        if(type === 'save'){
          this.loading = true
          api.saveArbitralInfo(params).then(res => {
            this.loading = false
            if (res.data.code === '1') {
              this.$message.success(res.data.msg)
              this.$router.push({
                path: 'arbitralList'
              })
            } else {
              this.$message.error(res.data.msg)
            }
          })
        }
        else if(type === 'autosave'){
          this.autoSave(params)
        }
      }
      else{
        params.isSave = 2
        if(this.arbitralInfo && this.arbitralInfo.id && this.arbitralInfo.otherData.arbStatus == 2){
          params.isSave = 3
        }
        this.loading = true
        api.addArbitralInfo(params).then(res => {
          this.loading = false
          if (res.data.code === '1') {
            this.$message.success(res.data.msg)
            this.$router.push({
              path: 'arbitralList'
            })
          } else {
            this.$message.error(res.data.msg)
          }
        })
      }
      // 删除申请人和被申请人
      if(allInfos.filter(item => {return item.status != 2}).length !== allInfos.length){
        this.updateArbitralInfoOfDefents(allInfos)
      }
    },
    updateArbitralInfoOfDefents(allInfos){
      let data = []
      allInfos.forEach(item => {
        if(item.status === 2){
          data.push({
            "arbitralInfoId": this.arbitralInfo.id,
            "id": item.id,
            "type": item.applyedType || item.applyerType
          })
        }
      })
      api.updateArbitralInfoOfDefents({list: data})
    },
    getDictId(){
      let arbiTypeSource = this.arbiTypeSource
      let dictId = this.mainForm.arbiType
      let selectedOptions = getArbiType(dictId)
      selectedOptions.pop()
      this.selectedOptions = selectedOptions.reverse()

      // 从子节点查询到根节点
      function getArbiType(dictId){
        let options = [dictId]
        let o = arbiTypeSource.find(v => {
          return v.id === dictId
        })
        if(o && o.parentid != 0){
          options = options.concat(getArbiType(o.parentid))
        }
        return options
      }
    },
    getInfoByIdCard(idnum, obj){
      if(/^[1-9]\d{5}(((19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}[xX\d])|(\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}))$/.test(idnum)){
        api.getInfoByIdCard({
          idcard: idnum
        }).then(res => {
          if(res.data.code === '1'){
            obj.sex = res.data.sex
            obj.birthDay = res.data.birthday
          }
          else{
            obj.sex = ''
            obj.birthDay = ''
          }
        })
      }
      else{
        obj.sex = ''
        obj.birthDay = ''
      }
    },
    beginAutoSave(){
      this.timeout = setTimeout(() => {
        // loading的时候保存会丢失数据, 因此只有当非loading时才可保存
        if(!this.loading){
          this.save('autosave')
        }
        this.beginAutoSave()
      }, 1000*60)
    },
    autoSave(params){
      if(this.savedData !== JSON.stringify(params)){
        this.autoSaving = true
        api.saveArbitralInfo(params).then(res => {
          this.autoSaving = false
          if (res.data.code === '1') {
            this.$notify({
              title: '自动保存',
              position: 'bottom-right',
              type: 'success',
              offset: 100
            });
            this.arbitralInfoId = res.data.arbitralInfoId
            this.savedData = JSON.stringify(params)
            this.getArbitralInfoDetail(this.arbitralInfoId)
          } else {
            this.$notify({
              title: '自动保存失败：'+ res.data.msg,
              position: 'bottom-right',
              type: 'error',
              offset: 100
            });
          }
        })
      }
    },
    resetAutoSave(){
      if(this.timeout){
        clearTimeout(this.timeout)
      }
    },
    getArbitralInfoDetail(id) {
      api.getArbitralInfoDetail({
        arbitralId: id
      }).then((res) => {
        if(res.data.code == '1'){
          this.formatData(res.data)
          this.getSubcompanyByUserCoInfo()
        }
      })
    },
    formatData(data){
      let arbitralAttachment = []
      let applyedArr = []
      let applyersArr = []
      let otherData = {}

      data.arbitralAttachment&&data.arbitralAttachment.forEach(item => {
        if(item.arbitralPtype===2){
          arbitralAttachment.push(item)  //  证据资料
        }
      })
      data.arbitralCoInfo&&data.arbitralCoInfo.forEach(item => {
        if(item.coType===1){
          applyedArr.push(item)
        }
        else{
          applyersArr.push(item)
        }
      })
      data.arbitralPInfo&&data.arbitralPInfo.forEach(item => {
        if(item.pType===1){
          applyedArr.push(item)
        }
        else{
          applyersArr.push(item)
        }
      })
      otherData = Object.assign({}, data)
      this.arbitralInfo = {
        arbitralContractAdvancey: data.arbitralContractAdvancey,
        arbitralAttachment: arbitralAttachment,
        applyedArr: applyedArr,
        applyersArr: applyersArr,
        otherData: otherData,
        aboutMoney: data.arbitralFundRecordResponse,
        id: data.id
      }
    },
    back(){
      this.$router.replace({path: 'arbitralList'})
    },
    exchangeApplyed(item) {
      // this.$nextTick(() => {
      //   if(this.$refs[item.pFormName][0]){
      //     this.$refs[item.pFormName][0].resetFields()
      //   }
      //   if(this.$refs[item.coFormName][0]){
      //     this.$refs[item.coFormName][0].resetFields()
      //   }
      // })
    },
    exchangeApplyer(item){
      if(item.applyerType === '2'){
        if(item.viewCompanies.length > 0){
          item.coFormData = Object.assign({}, item.viewCompanies[0])
          this.initChildCompany()
        }
      }
    },
    getSubcompanyByUserCoInfo(){
      api.getSubcompanyByUserCoInfo({}).then(res => {
        if(res.data.code === '1'){
           var data = res.data.userCoAgentInfoDatas
           data&&data.forEach(item => {
             if(item.userAgentInfoData){
              item.userCoInfoDetail.arbitralAgentInfo = item.userAgentInfoData
              delete item.userCoInfoDetail.arbitralAgentInfo.id
             }
             this.setAttachIcons(item.userCoInfoDetail, ['coLicenceAttach','coIdPaperAttach','coIdAttachFornt','coIdAttachRear'])
             this.childCompanies.push(item.userCoInfoDetail)
           })
          if(this.childCompanies.length > 0){
            this.initChildCompany()
          }
        }
      })
    }
  },
  created() {
    this.addApplyers()
    this.addApplyed()
    this.getArbiTypes()
    this.getUserArbitralProduct()

  },
  mounted(){
    this.addEvidence()
    this.beginAutoSave()

    let id = this.$route.query.data
    if(id){
      this.getArbitralInfoDetail(id)
    }
    else{
      this.getSubcompanyByUserCoInfo()
    }
  },
  destroyed(){
    this.resetAutoSave()
  }
}

</script>
<style lang="scss" scoped>
.apply{
  padding: 30px;
}
.open-user-form {
  float: right;
  cursor: pointer;
  color: #00F;
  font-size: 14px;
  line-height: 42px;
  text-decoration: underline;
}


.upload-co-img,
.upload-p-img {
  ul {
    overflow: hidden;
  }
  li {
    float: left;
    margin-right: 20px;
  }
}
.icon-plus{
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  line-height: inherit;
  background: rgba(0,0,0,0.1);
  .el-icon-plus{
    color: #fff;
  }
}
.add-button {
  line-height: 36px;
  color: #169BD5;
  text-decoration: underline;
  margin-top: 10px;
  display: inline-block;
  cursor: pointer;
}

.text {
  font-size: 14px;
  line-height: 40px;
  span {
    display: inline-block;
    width: 118px;
    text-align: right;
    padding-right: 12px;
  }
  b {
    color: #F56C6C;
  }
}
.money{
  height:30px;
  display: inline-block;
  min-width: 60px;
}
.css_applyed_type{
  margin: 30px 0;
  padding-left: 100px;
}
.css_coinfo{
  overflow: hidden;
  dl{
    width: 50%;
    float: left;
    margin-bottom: 10px;
    dt,dd{
      float: left;
    }
    dt{
      width: 140px;
      text-align: right;
      color: #999;
      margin-right: 10px;
      line-height: 32px;
    }
    dd{
      width: 370px;
      p{
        line-height: 32px;
        overflow-y: hidden;
      }
    }
  }
}
.css_co_attach{
  dl{
    overflow: hidden;
  }
  dt,dd{
    float: left;
  }
  dt{
    width: 140px;
    text-align: right;
    color: #999;
    margin-right: 10px;
  }
  dd{
    float: left;
    div{
      float: left;
      margin-right: 20px;
      p{
        font-size: 12px;
      }
      img{
        width: 176px;
        height: 112px;
      }
    }
  }
}
</style>
