import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import { baseURL } from '@/config'
import router from './router'
import store from './store'
var myAxios = axios.create({
  baseURL: baseURL,
  timeout: 60000
})
// http请求拦截器
myAxios.interceptors.request.use(config => {
  let current = router.history.current
  // 判断为用户端
  if (current.meta.hasOwnProperty('user') && current.meta.hasOwnProperty('user') === true) {
    const userAccessToken = store.state.user.userAccessToken
    if(userAccessToken){
      if(userAccessToken === localStorage.getItem('userAccessToken')){
        config.headers.Authorization = userAccessToken
      }
      else if(localStorage.getItem('userAccessToken')){
        MessageBox.alert('权限错误','', {
          type: 'error'
        })
        return false
      }
    }
  }
  else {
    // 管理端
    const adminAccessToken = store.state.admin.adminAccessToken
    if(adminAccessToken){
      if(localStorage.getItem('adminAccessToken') === adminAccessToken){
        config.headers.Authorization = adminAccessToken
      }
      else if(localStorage.getItem('adminAccessToken')){
        MessageBox.alert('权限错误','', {
          type: 'error'
        })
        return false
      }
    }
  }
  return config
}, error => {
  Message.error('加载超时')
  return Promise.reject(error)
})
// http响应拦截器
myAxios.interceptors.response.use(res => {
  return res
}, error => {
  if (error && error.response) {
    store.dispatch('httpError',error.response)
  }
  return Promise.reject(error)
})

const api = {
  uploadURLNew: baseURL + '/api/document/uploadReplaceDocument',  // 上传url
  uploadURL: baseURL + '/api/file/upload',  // 上传url
  multipleUploadURL: baseURL + '/api/file/uploads',  // 上传url
  uploadReplaceDocument(params) {  // 根据当前登录账号获取所有子公司数据
    return myAxios({
      method: 'post',
      url: '/api/document/uploadReplaceDocument',
      data: params
    })
  },
  uploadMergeHearRecord: baseURL + '/api/document/uploadMergeHearRecord',
  uploadHearRecord: baseURL + '/api/document/uploadHearRecord',
  getImgURL(url) {
    if(typeof url==='string' && url !== ''){
      return baseURL + '/oauth/file/downloadImgFile?filePath=' + url    // 预览图片
    }
    else
      return ''
  },
  getPdfURL(url) {
    if(typeof url==='string' && url !== ''){
      return baseURL + '/oauth/file/downloadPdfFile?pdfUrl=' + url   // 预览pdf附件
    }
    else
      return ''
  },
  getCodeUrl(uuid) {  // 验证码url
    return baseURL + '/login/verifycode/' + uuid
  },
  downloadPdfFile(params) {  // 下载文书
    return myAxios({
      method: 'get',
      url: '/oauth/file/downloadPdfFile',
      params: params,
      responseType: 'blob',
      onUploadProgress: function (progressEvent) {
        // console.log(progressEvent.loaded)
      }
    })
  },
  downloadOtherFile(params) {  // 下载其他文件
    return myAxios({
      method: 'get',
      url: '/api/file/downloadOtherFile',
      params: params,
      responseType: 'blob',
      onDownloadProgress: function (progressEvent) {
        // console.log(progressEvent.loaded)
      },
    })
  },
  sendEmailUpdatePassword(params) {  // 找回密码发送邮件
    return myAxios({
      method: 'post',
      url: '/api/user/sendEmailUpdatePassword',
      data: params
    })
  },
  verifyEmailCode(params) {  // 验证邮件
    return myAxios({
      method: 'post',
      url: '/api/user/verifyEmailCode',
      params: params
    })
  },
  updatePassword(params) {  // 修改密码
    return myAxios({
      method: 'post',
      url: '/api/user/updatePassword',
      data: params
    })
  },
  /*
    用户端接口-------------------
  */
  applyJudgeNoPassRemark(params) {  // 查询审核不通过备注
    return myAxios({
      method: 'post',
      url: '/api/applyJudgeNoPassRemark',
      params: params
    })
  },
  getSubcompanyByUserCoInfo(params) {  // 根据当前登录账号获取所有子公司数据
    return myAxios({
      method: 'post',
      url: '/api/getSubcompanyByUserCoInfo',
      data: params
    })
  },
  userLogin(params) {  // 登录
    return myAxios({
      method: 'post',
      url: '/login/userLogin',
      data: params
    })
  },
  logout(token) {  // 退出
    return myAxios({
      method: 'get',
      url: '/api/userLogout'
    })
  },
  addArbitralInfo(params) {  // 保存并提交案件
    return myAxios({
      method: 'post',
      url: '/api/addArbitralInfo',
      data: params
    })
  },
  saveArbitralInfo(params) {  // 保存案件
    return myAxios({
      method: 'post',
      url: '/api/saveArbitralInfo',
      data: params
    })
  },
  getInfoByIdCard(params) {  // 入参身份证号，出参出生日期和性别
    return myAxios({
      method: 'post',
      url: '/api/getInfoByIdCard',
      data: params
    })
  },
  getArbitralInfos(params) {  // 新增案件
    return myAxios({
      method: 'post',
      url: '/api/getArbitralInfos',
      data: params
    })
  },
  updateArbitralInfoOfDefents(params) {  // 删除被申请人
    return myAxios({
      method: 'post',
      url: '/api/updateArbitralInfoOfDefents',
      data: params
    })
  },
  getFundConfigureByDispute(params) {  // 计算仲裁费
    return myAxios({
      method: 'post',
      url: '/api/getFundConfigureByDispute',
      data: params
    })
  },
  getArbitralInfoDetail(params) {  // 获取案件详情
    return myAxios({
      method: 'post',
      url: '/api/getArbitralInfoDetail',
      data: params
    })
  },
  queryMessageListByType(params) {  // 查询消息列表
    return myAxios({
      method: 'post',
      url: '/api/queryMessageListByType',
      data: params
    })
  },
  messageDetail(params) {  // 消息详情
    return myAxios({
      method: 'get',
      url: '/api/messageDetail/' + params.id
    })
  },
  queryArbitralDocumentByself(params) {  // 查询当前登录人的文书
    return myAxios({
      method: 'post',
      url: '/api/document/queryArbitralDocumentByself',
      data: params
    })
  },
  /*
    管理端接口-------------------
  */
  sysUserLogin(params) {  // 登录
    return myAxios({
      method: 'post',
      url: '/login/sysUserLogin',
      data: params
    })
  },
  sysLogout(token) {  // 退出
    return myAxios({
      method: 'get',
      url: '/api/sysUserLogout'
    })
  },
  saveArbitralNumber(params) {  // 新增案件编号号段
    return myAxios({
      method: 'post',
      url: '/api/saveArbitralNumber',
      data: params
    })
  },
  updateArbitralNumber(params) {  // 修改案件编号号段
    return myAxios({
      method: 'post',
      url: '/api/updateArbitralNumber',
      data: params
    })
  },
  updateNumberStatus(params) {  // 修改案件编号号段
    return myAxios({
      method: 'post',
      url: '/api/updateArbitralNumberStatus',
      data: params
    })
  },
  checkArbitralNumber(params) {  // 校验 案件 可用 号段
    return myAxios({
      method: 'post',
      url: '/api/checkArbitralNumber',
      data: params
    })
  },
  getArbitralNumber(params) {  // 获取编号号段list
    return myAxios({
      method: 'post',
      url: '/api/getArbitralNumber',
      data: params
    })
  },

  updateSysUser(params) {  // 修改仲裁员
    return myAxios({
      method: 'post',
      url: '/api/updateSysUser',
      data: params
    })
  },

  updateSysUserStatus(params) {  // 更新仲裁员状态
    return myAxios({
      method: 'post',
      url: '/api/updateSysUserStatus',
      data: params
    })
  },

  saveArbSysUser(params) {  // 新增仲裁员
    return myAxios({
      method: 'post',
      url: '/api/saveSysUser',
      data: params
    })
  },

  getSysUserList(params) {  // 获取仲裁员列表
    return myAxios({
      method: 'post',
      url: '/api/getSysUserList',
      data: params
    })
  },

  // ------------------->>>初始化案件参数

  getArbitralInitParameterList(params) {  // 获取案件列表
    return myAxios({
      method: 'post',
      url: '/api/getArbitralInitParameterList',
      data: params
    })
  },

  getArbitralInitsecretaryList(params) {  // 查询办案秘书
    return myAxios({
      method: 'get',
      url: '/api/getArbitralInitsecretaryList ',
      data: params
    })
  },

  getArbitralFtlTemplateList(params) {  // 办案模板列表
    return myAxios({
      method: 'get',
      url: '/api/arbitralFtlTemplate/getArbitralFtlTemplateList ',
      data: params
    })
  },

  updateArbitralInitParameter(params) {  // 保存
    return myAxios({
      method: 'post',
      url: '/api/updateArbitralInitParameter ',
      data: params
    })
  },

  //--------初始化案件参数---------<<<<<<<<<<

  getSysDictList(type) {  // 查询专业列表和职业列表的 type: 1-专业，2-职业
    return myAxios({
      method: 'get',
      url: '/api/getSysDictList/' + type
    })
  },
  getAdvanceConfigureDataTable(params) {  // 获取合同计算公式list
    return myAxios({
      method: 'post',
      url: '/api/getAdvanceConfigureDataTable',
      data: params
    })
  },
  getAdvanceConfigure(params) {  // 根据id查询合同逾期计算公式对象
    return myAxios({
      method: 'get',
      url: '/api/getAdvanceConfigure/' + params.id
    })
  },
  getContractAdvanceMoney(params) {  // 计算违约金
    return myAxios({
      method: 'post',
      url: '/api/getContractAdvanceMoney',
      data: params
    })
  },
  getPayment(params) {  // 查询缴费 记录列表
    return myAxios({
      method: 'post',
      url: '/api/arbitralFund/getPayment',
      data: params
    })
  },
  recharge(params) {  // 充值 提现
    return myAxios({
      method: 'post',
      url: '/api/arbitralFund/recharge',
      data: params
    })
  },
  rechargeAddAttach(params) {  // 充值 提现
    return myAxios({
      method: 'post',
      url: '/api/arbitralFund/rechargeAddAttach',
      data: params
    })
  },
  getPrefunRecord(params) {  // 查询充值记录
    return myAxios({
      method: 'post',
      url: '/api/arbitralFund/getPrefunRecord',
      data: params
    })
  },
  getReconciliation(params) {  // 查询对账单
    return myAxios({
      method: 'post',
      url: '/api/arbitralFund/getReconciliation',
      data: params
    })
  },
  queryPrefunRecordDetailById(params) {  // 根据id查看预充值, 缴费 等 记录详情
    return myAxios({
      method: 'get',
      url: '/api/arbitralFund/queryPrefunRecordDetailById/' + params.id
    })
  },
  queryPrefunRecordAttachmentById(params) {  // 根据id查看预充值附件
    return myAxios({
      method: 'get',
      url: '/api/arbitralFund/queryPrefunRecordAttachmentById/' + params.id
    })
  },
  addUserPInfo(params) {  // 新增用户个人信息
    return myAxios({
      method: 'post',
      url: '/api/addUserPInfo',
      data: params
    })
  },
  updateUserPInfo(params) {  // 更新用户个人信息
    return myAxios({
      method: 'post',
      url: '/api/updateUserPInfo',
      data: params
    })
  },
  getUserPInfo(params) {  // 查询用户个人信息
    return myAxios({
      method: 'post',
      url: '/api/getUserPInfo',
      data: params
    })
  },
  addUserCoInfo(params) {  // 新增企业用户个人信息
    return myAxios({
      method: 'post',
      url: '/api/addUserCoInfo',
      data: params
    })
  },
  updateUserCoInfo(params) {  // 更新企业用户个人信息
    return myAxios({
      method: 'post',
      url: '/api/updateUserCoInfo',
      data: params
    })
  },
  getUserCoInfo(params) {  // 查询企业用户个人信息
    return myAxios({
      method: 'post',
      url: '/api/getUserCoInfo',
      data: params
    })
  },
  getLoginUserAgentInfo(params) {  // 查询代理人数据
    return myAxios({
      method: 'post',
      url: '/api/getLoginUserAgentInfo',
      data: params
    })
  },
  adminDelAgent(params) {  // 仲裁端删除代理人
    return myAxios({
      method: 'get',
      url: '/api/useraccount/delUserAgentInfo/' + params.id,
      data: params
    })
  },
  delAgent(params) {  // 删除代理人
    return myAxios({
      method: 'get',
      url: '/api/delUserAgentInfo/' + params.id,
      data: params
    })
  },
  getDict(params) {  // 查询字典（案由...）
    return myAxios({
      method: 'post',
      url: '/api/dictIndex',
      data: params
    })
  },
  getDictSys(params) {  // 查询字典（案由...）
    return myAxios({
      method: 'post',
      url: '/api/dictSysIndex',
      data: params
    })
  },
  getMsgDetail(params) {  // 查询消息详细
    return myAxios({
      method: 'get',
      url: '/api/messageDetail/' + params.id,
    })
  },
  queryMessageListByType(params) {  // 查询消息列表
    return myAxios({
      method: 'post',
      url: '/api/queryMessageListByType',
      data: params
    })
  },
  getArbitralProductList(params) {  // 查询产品类型列表
    return myAxios({
      method: 'post',
      url: '/api/getArbitralProductList',
      data: params
    })
  },
  getUserArbitralProduct(params) {  // 用户端查询产品类型列表
    return myAxios({
      method: 'get',
      url: '/api/getUserArbitralProduct'
    })
  },
  getProductNumberById(params) {  // 根据申请人生成产品编号
    return myAxios({
      method: 'get',
      url: `/api/getProductNumberById/${params.id}`
    })
  },
  saveArbitralProduct(params) {  // 新增产品类型
    return myAxios({
      method: 'post',
      url: '/api/saveArbitralProduct',
      data: params
    })
  },
  updateArbitralProduct(params) {  // 修改产品类型
    return myAxios({
      method: 'post',
      url: '/api/updateArbitralProduct',
      data: params
    })
  },
  updateArbitralProductStatus(params) {  // 修改产品类型启用或停用
    return myAxios({
      method: 'post',
      url: '/api/updateArbitralProductStatus',
      data: params
    })
  },
  getCalcRuleList(params) {  // 查询费用规则
    return myAxios({
      method: 'post',
      url: '/api/getFundRegularList',
      data: params
    })
  },
  getFundRegularNumber(params) {  // 生成费用规则编号
    return myAxios({
      method: 'get',
      url: '/api/getFundRegularNumber'
    })
  },
  saveCalcRule(params) {  // 新增费用计算规则
    return myAxios({
      method: 'post',
      url: '/api/saveFundRegular',
      data: params
    })
  },
  updateCalcRuleStatus(params) {  // 修改费用计算规则的状态
    return myAxios({
      method: 'post',
      url: '/api/updateArbitralRegularStatus',
      data: params
    })
  },
  updateCalcRule(params) {  // 修改费用计算规则
    return myAxios({
      method: 'post',
      url: '/api/updateFundRegular',
      data: params
    })
  },
  // 流程相关
  applyJurisdictionNoPass(params) {  // 审核管辖权不通过
    return myAxios({
      method: 'post',
      url: '/api/process/applyJurisdictionNoPass',
      data: params
    })
  },
  applyJurisdictionReject(params) {  // 审核管辖权拒绝
    return myAxios({
      method: 'post',
      url: '/api/process/applyJurisdictionReject',
      data: params
    })
  },
  applyJurisdictionPass(params) {  // 审核管辖权通过
    return myAxios({
      method: 'post',
      url: '/api/process/applyJurisdictionPass',
      data: params
    })
  },
  applyPass(params) {  // 案件申请
    return myAxios({
      method: 'post',
      url: '/api/process/applyPass',
      data: params
    })
  },
  arbitralAwardArrivedSuccess(params) {  // 裁决书送达成功
    return myAxios({
      method: 'post',
      url: '/api/process/arbitralAwardArrivedSuccess',
      data: params
    })
  },
  saveOrUpdateDefencesAttachInfos(params) {  // 批量保存答辩资料
    return myAxios({
      method: 'post',
      url: '/api/process/saveOrUpdateDefencesAttachInfos',
      data: params
    })
  },
  getDefencesAttachInfos(params) {  // 查询答辩资料
    return myAxios({
      method: 'post',
      url: '/api/process/getDefencesAttachInfos',
      data: params
    })
  },
  defencesSuccess(params) {  // 答辩成功
    return myAxios({
      method: 'post',
      url: '/api/process/defencesSuccess',
      data: params
    })
  },
  noDefences(params) {  // 答辩成功
    return myAxios({
      method: 'post',
      url: '/api/process/noDefences',
      data: params
    })
  },
  hearDocumentPass(params) {  // 审核案件材料通过
    return myAxios({
      method: 'post',
      url: '/api/process/hearDocumentPass',
      data: params
    })
  },
  hearDocumentNoPass(params) {  // 审核案件材料不通过
    return myAxios({
      method: 'post',
      url: '/api/process/hearDocumentNoPass',
      data: params
    })
  },
  addOrUpdateRecallInfo(data, params) {  // 撤回案件申请
    return myAxios({
      method: 'post',
      url: '/api/addOrUpdateRecallInfo',
      data,
      params
    })
  },
  getBranchRecallInfos(params) {  // 查询申请了撤回的案件
    return myAxios({
      method: 'post',
      url: '/api/getBranchRecallInfos',
      data: params
    })
  },
  getPassFirstReviewInfos(params) {  // 查询初审过后，待终审的案件
    return myAxios({
      method: 'post',
      url: '/api/getPassFirstReviewInfos',
      data: params
    })
  },
  getPassFirstReviewRecallInfos(params) {  // 查询初审过后，待终审的案件
    return myAxios({
      method: 'post',
      url: '/api/getPassFirstReviewRecallInfos',
      data: params
    })
  },

  getBranchRecallInfo(params) {  // 查询某案件是否已撤回
    return myAxios({
      method: 'post',
      url: '/api/getBranchRecallInfo',
      data: params
    })
  },
  addRecallInfoFirstReview(params) {  // 撤回案件初审
    return myAxios({
      method: 'post',
      url: '/api/addRecallInfoFirstReview',
      data: params
    })
  },
  addRecallInfoSecondReview(params) {  // 撤回案件终审
    return myAxios({
      method: 'post',
      url: '/api/addRecallInfoSecondReview',
      data: params
    })
  },
  reviewArbitralAwardPass(params) {  // 校对裁决书-保存并提交
    return myAxios({
      method: 'post',
      url: '/api/process/reviewArbitralAwardPass',
      data: params
    })
  },
  saveArbitralAwardContext(params) {  // 校对裁决书-保存
    return myAxios({
      method: 'post',
      url: '/api/process/saveArbitralAwardContext',
      data: params
    })
  },
  secondReviewArbitralAwardNoPass(params) {  // 审核裁决书不通过
    return myAxios({
      method: 'post',
      url: '/api/process/secondReviewArbitralAwardNoPass',
      data: params
    })
  },
  secondReviewArbitralAwardPass(params) {  // 审核裁决书通过
    return myAxios({
      method: 'post',
      url: '/api/process/secondReviewArbitralAwardPass',
      data: params
    })
  },
  registerDocumentArrivedSuccess(params) {  // 立案文书送达成功
    return myAxios({
      method: 'post',
      url: '/api/process/registerDocumentArrivedSuccess',
      data: params
    })
  },
  getHistroyTaskInst(params) {  // 根据流程实例id查询历史活动任务
    return myAxios({
      method: 'get',
      url: '/api/arbitralInfoPorcess/getHistroyTaskInst',
      params: params
    })
  },
  getArbitralInfosBySys(params) {  // 仲裁端案件查看列表
    return myAxios({
      method: 'post',
      url: '/api/getArbitralInfosBySys',
      data: params
    })
  },
  getArbitralInfoDetailBySys(params) {  // 获取案件详情
    return myAxios({
      method: 'post',
      url: '/api/getArbitralInfoDetailBySys',
      data: params
    })
  },
  queryUserCoInfo(params) {  // 获取用户信息
    return myAxios({
      method: 'post',
      url: '/api/queryUserCoInfo',
      data: params
    })
  },
  addArbitralAwardTemplate(params) {  // 新增裁决书模板
    return myAxios({
      method: 'post',
      url: '/api/ArbitralAwardTemplate/addArbitralAwardTemplate',
      data: params
    })
  },
  updateArbitralAwardTemplate(params) {  // 修改裁决书模板
    return myAxios({
      method: 'post',
      url: '/api/ArbitralAwardTemplate/updateArbitralAwardTemplate',
      data: params
    })
  },
  queryArbitralAwardTemplateById(params) {  // 查询裁决书模板详情
    return myAxios({
      method: 'get',
      url: '/api/ArbitralAwardTemplate/queryArbitralAwardTemplateById/' + params.id
    })
  },
  getArbitralAwardTemplate(params) {  // 维护裁决书模板列表
    return myAxios({
      method: 'post',
      url: '/api/ArbitralAwardTemplate/getArbitralAwardTemplate',
      data: params
    })
  },
  updateStatusBatch(params) {  // 维护裁决书模板列表 批量修改 状态
    return myAxios({
      method: 'post',
      url: '/api/ArbitralAwardTemplate/updateStatusBatch',
      data: params
    })
  },
  queryArbitralDocumentBatch(params) {  // 批量查询案件文书
    return myAxios({
      method: 'post',
      url: '/api/document/queryArbitralDocumentBatch',
      data: params
    })
  },
  queryProcessArbitralDocument(params) {  // 线上邮递文书查询（已送达的文书不返回）
    return myAxios({
      method: 'post',
      url: '/api/document/queryProcessArbitralDocument',
      data: params
    })
  },
  querySmsProcessArbitralDocument(params) {  // 短信发送文书查询新增19-5-16
    return myAxios({
      method: 'post',
      url: '/api/document/querySmsProcessArbitralDocument',
      data: params
    })
  },
  arrivedSmsArbitralDocumentBatch(params) {  //  短信(发送接口)
    return myAxios({
      method: 'post',
      url: '/api/document/arrivedSmsArbitralDocumentBatch',
      data: params
    })
  },
  getH5ArbitralList(params) {  //  短信(列表接口)
    return myAxios({
      method: 'post',
      url: '/smsDocument/getH5ArbitralList',
      data: params
    })
  },
  queryArbitralDocumentExpressRecord(params) {  // 线下邮递文书记录查询（包含补发）
    return myAxios({
      method: 'post',
      url: '/api/document/queryArbitralDocumentExpressRecord',
      data: params
    })
  },
  arrivedArbitralDocumentBatch(params) {  // 批量送达案件文书
    return myAxios({
      method: 'post',
      url: '/api/document/arrivedArbitralDocumentBatch',
      data: params
    })
  },
  arrivedArbitralDocument(params) {  // 单个送达案件文书
    return myAxios({
      method: 'post',
      url: '/api/document/arrivedArbitralDocument',
      params: params
    })
  },
  uploadArbitralDocuments(params) {  // 批量上传文书签章
    return myAxios({
      method: 'post',
      url: '/api/document/uploadArbitralDocuments',
      data: params,
      onUploadProgress: function (progressEvent) {
        // console.log(progressEvent)
      }
    })
  },
  getArbitralTimeLimit(params) {  // 查询案件时限设置
    return myAxios({
      method: 'post',
      url: '/api/getArbitralTimeLimit',
      params: params
    })
  },
  saveArbitralTimeLimit(params) {  // 新增/修改案件时限设置
    return myAxios({
      method: 'post',
      url: '/api/saveArbitralTimeLimit',
      data: params
    })
  },
  getAllArbitralInfos(params) {  //  查询所有的案件
    return myAxios({
      method: 'post',
      url: '/api/getAllArbitralInfos',
      data: params
    })
  },
  getEvidenceSuppleList(params) {  //  仲裁端-案件管理-证据补充列表
    return myAxios({
      method: 'post',
      url: '/api/getEvidenceSuppleList',
      data: params
    })
  },
  getEvidenceSuppleInfoByArbId(data, params) {  //   仲裁端-案件管理-证据信息(点开一个显示)
    return myAxios({
      method: 'post',
      url: '/api/getEvidenceSuppleInfoByArbId',
      data,
      params
    })
  },
  suppleEvidence(params) {  //    仲裁端-案件管理-证据补充
    return myAxios({
      method: 'post',
      url: '/api/suppleEvidence',
      data: params
    })
  },
  getArbitralInfoDetailBySysAboutJudge(params) {  //  查询案件详细和裁决书html字串
    return myAxios({
      method: 'post',
      url: '/api/getArbitralInfoDetailBySysAboutJudge',
      data: params
    })
  },
  arrivedArbitralAwardBatch(params) {  //  批量送达案件裁决书
    return myAxios({
      method: 'post',
      url: '/api/document/arrivedArbitralAwardBatch',
      data: params
    })
  },
  postMail(params) {  //  线下邮递
    return myAxios({
      method: 'post',
      url: '/api/document/saveOrUpdateArbitralExpressRecordBatch',
      data: params
    })
  },
  deleteExpressRecord(params){
    return myAxios({
      method: 'post',
      url: '/api/document/deleteArbitralDocumentExpressRecord',
      data: params
    })
  },
  getRecordForTribunalMsg(params) {  //  查询组庭时间和仲裁员
    return myAxios({
      method: 'post',
      url: '/api/getRecordForTribunalMsg',
      data: params
    })
  },
  hearJudge(params) {  //  管理端组庭
    return myAxios({
      method: 'post',
      url: '/api/process/hearJudge',
      data: params
    })
  },
  getAllArbitralInfosAboutReviewJudge(params) {  //  审核裁决书-列表
    return myAxios({
      method: 'post',
      url: '/api/getAllArbitralInfosAboutReviewJudge',
      data: params
    })
  },
  getAuditJurisdictionArbitralInfos(params) {  //  审核管辖权-列表
    return myAxios({
      method: 'post',
      url: '/api/getAuditJurisdictionArbitralInfos',
      data: params
    })
  },
  getJudgeArbitralInfos(params) {  //  校对裁决书-列表
    return myAxios({
      method: 'post',
      url: '/api/getJudgeArbitralInfos',
      data: params
    })
  },
  getOfflineTribunalArriveArbitralInfos(params) {  //  线下组庭送达-列表
    return myAxios({
      method: 'post',
      url: '/api/getOfflineTribunalArriveArbitralInfos',
      data: params
    })
  },
  getAdjudicationByRecordArriveArbitralInfos(params) {  //  书面审理送达-列表
    return myAxios({
      method: 'post',
      url: '/api/getAdjudicationByRecordArriveArbitralInfos',
      data: params
    })
  },
  getRegisterArbitralInfos(params) {  //  立案-列表
    return myAxios({
      method: 'post',
      url: '/api/getRegisterArbitralInfos',
      data: params
    })
  },
  getReplyArbitralInfos(params) {  //  答辩-列表
    return myAxios({
      method: 'post',
      url: '/api/getReplyArbitralInfos',
      data: params
    })
  },
  getReviewArbitralInfos(params) {  //  审核案件材料-列表
    return myAxios({
      method: 'post',
      url: '/api/getReviewArbitralInfos',
      data: params
    })
  },
  getTribunalArbitralInfos(params) {  //  组庭-列表
    return myAxios({
      method: 'post',
      url: '/api/getTribunalArbitralInfos',
      data: params
    })
  },
  getTribunalRecordArbitralInfos(params) {  //  开庭笔录-列表
    return myAxios({
      method: 'post',
      url: '/api/getTribunalRecordArbitralInfos',
      data: params
    })
  },
  getJudgeArrivedArbitralInfos(params) {  //  送达裁决书-列表
    return myAxios({
      method: 'post',
      url: '/api/getJudgeArrivedArbitralInfos',
      data: params
    })
  },
  queryArbitralCourtRecord(params) {  //  查询开庭笔录模板
    return myAxios({
      method: 'post',
      url: '/api/document/queryArbitralCourtRecord',
      data: params
    })
  },
  hearJudgePaperReach(params) {  //  线下审理通知书送达
    return myAxios({
      method: 'post',
      url: '/api/process/hearJudgePaperReach',
      data: params
    })
  },
  hearJudgeUploadPaperReach(params) {  //  书面审理通知书送达
    return myAxios({
      method: 'post',
      url: '/api/process/hearJudgeUploadPaperReach',
      data: params
    })
  },
  hearJudgeOUploadRecord(params) {  //  保存并提交开庭笔录
    return myAxios({
      method: 'post',
      url: '/api/process/hearJudgeOUploadRecord',
      data: params
    })
  },
  saveHearRecordContext(params) {  //  保存开庭笔录
    return myAxios({
      method: 'post',
      url: '/api/process/saveHearRecordContext',
      data: params
    })
  },
  queryHearRecordContext(params) {  //  查询已保存的开庭笔录详情
    return myAxios({
      method: 'post',
      url: '/api/document/queryHearRecordContext',
      data: params
    })
  },
  getMediateArbitralInfos(params) {  //  案件调解查看列表
    return myAxios({
      method: 'post',
      url: '/api/getMediateArbitralInfos',
      data: params
    })
  },
  getMediationDocument(params) {  //  下载调解书
    return myAxios({
      method: 'post',
      url: '/api/document/getMediationDocument',
      params: params
    })
  },
  saveMediationAttach(params) {  //  保存调解附件
    return myAxios({
      method: 'post',
      url: '/api/process/saveMediationAttach',
      data: params
    })
  },
  arbitralMediateSuccess(params) {  //  提交调解
    return myAxios({
      method: 'post',
      url: '/api/process/arbitralMediateSuccess',
      data: params
    })
  },
  getMediationAttachInfos(params) {  //  查询调解资料
    return myAxios({
      method: 'post',
      url: '/api/process/getMediationAttachInfos',
      data: params
    })
  },
  //------------------系统设置------>>>>>>>>>

  getUserList(data) {   //获取用户端账号
    return myAxios({
      url: '/api/useraccount/list',
      method: 'post',
      data: data
    })
  },
  getAdministratorList(url){  // 获取管理端账号
    return myAxios({
      url,
      method: 'post'
    })
  },
  getUserAccountInfo(url) {   //获取用户详细信息
    return myAxios({
      url,
      method: 'get'
    })
  },

  saveUserAccountInfo(params) {  // 保存前端用户信息
    return myAxios({
      method: 'post',
      url: '/api/useraccount/save',
      data: params
    })
  },

  updateUserAccountInfo(params) {  // 更新前端用户信息
    return myAxios({
      method: 'post',
      url: '/api/useraccount/update',
      data: params
    })
  },
  updateUserAccountStatus(params) {  // 更新前端用户信息
    return myAxios({
      method: 'post',
      url: '/api/useraccount/updateUserAccountStatus',
      data: params
    })
  },
  deleteUser(params) {  // 删除前端用户
    return myAxios({
      method: 'post',
      url: '/api/useraccount/delete',
      data: params
    })
  },
  additableUserCoInfo(params) {  // 添加子公司
    return myAxios({
      method: 'post',
      url: '/api/additableUserCoInfo',
      data: params
    })
  },
  queryAdditableUserCoInfo(params) {  // 查询所有可设置的子公司/母公司列表
    return myAxios({
      method: 'post',
      url: '/api/queryAdditableUserCoInfo',
      data: params
    })
  },
  queryAdditableUserCoInfoByCompany(params) {  // 查询所选公司下的子公司/母公司列表
    return myAxios({
      method: 'post',
      url: '/api/queryAdditableUserCoInfoByCompany',
      data: params
    })
  },
  resetPassword(params) {  // 重置密码
    return myAxios({
      method: 'post',
      url: '/api/useraccount/updatePassword',
      params: params
    })
  },
  sendUserAccountAuthEmail(params) {  // 发送授权邮件
    return myAxios({
      method: 'post',
      url: '/api/user/sendUserAccountAuthEmail',
      data: params
    })
  },
  getSysUserInfo(url) {   //获取系统用户详细信息
    return myAxios({
      url,
      method: 'post'
    })
  },

  saveSysUser(url) {   //保存系统用户信息
    return myAxios({
      url,
      method: 'post'
    })
  },

  saveAdminSysUser(params) {  // 保存系统用户信息
    return myAxios({
      method: 'post',
      url: '/api/sys/user/save',
      data: params
    })
  },

  updateAdminSysUser(params) {  // 更新系统用户信息
    return myAxios({
      method: 'post',
      url: '/api/sys/user/update',
      data: params
    })
  },
  deleteAdminSysUser(params) {  // 删除系统用户
    return myAxios({
      method: 'post',
      url: '/api/sys/user/delete',
      params: params
    })
  },

  getRoleList(url) {   //获取系统角色列表
    return myAxios({
      url,
      method: 'post'
    })
  },

  deleteRole(params) {  // 删除系统用户
    return myAxios({
      method: 'post',
      url: '/api/sys/role/delete',
      data: params
    })
  },

  getRoleInfo(url) {   //获取系统用户详细信息
    return myAxios({
      url,
      method: 'post'
    })
  },

  saveRoleInfo(params) {  // 保存角色信息
    return myAxios({
      method: 'post',
      url: '/api/sys/role/save',
      data: params
    })
  },
  updateRoleInfo(params) {  // 更新角色信息
    return myAxios({
      method: 'post',
      url: '/api/sys/role/update',
      data: params
    })
  },
  getMenuList(url) {   //获取系统菜单列表
    return myAxios({
      url,
      method: 'post'
    })
  },
  menulists() {  // 查询菜单权限
    return myAxios({
      method: 'get',
      url: '/api/menulists'
    })
  },
  // -------------系统设置--------<<<<<<<<<<<

  getUserPayment(params) {  //  用户中心账单列表
    return myAxios({
      method: 'post',
      url: '/api/arbitralFund/getUserPayment',
      data: params
    })
  },
  getUserReconciliation(params) {  //  查询用户中心 余额
    return myAxios({
      method: 'post',
      url: '/api/arbitralFund/getUserReconciliation',
      data: params
    })
  },
  addOrUpdateProcedure(params) {  //  新增、修改仲裁程序
    return myAxios({
      method: 'post',
      url: '/api/procedure/addOrUpdateArbitralProcedure',
      data: params
    })
  },
  queryProcedures(params) {  //  查询仲裁程序列表
    return myAxios({
      method: 'post',
      url: '/api/procedure/queryArbitralProcedures',
      data: params
    })
  },
  getProcedures(params) {  //  查询所有仲裁程序
    return myAxios({
      method: 'post',
      url: '/api/procedure/getArbitralProcedures',
      data: params
    })
  },
  updateProcedureStatus(params) {  //  批量修改仲裁程序状态
    return myAxios({
      method: 'post',
      url: '/api/procedure/updateArbitralProcedureStatus',
      data: params
    })
  },
  getRechargeAuditList(params) {  //  获取充值审核列表
    return myAxios({
      method: 'post',
      url: '/api/arbitralFund/getRechargeAuditList',
      data: params
    })
  },
  rechargeAudit(params) {  //  获取充值审核列表
    return myAxios({
      method: 'post',
      url: '/api/arbitralFund/rechargeAudit',
      data: params
    })
  },
  getDecisionList(params) {  //  获取管辖权异议待申请列表
    return myAxios({
      method: 'post',
      url: '/api/decision/getDecisionList',
      data: params
    })
  },
  getDecisionGiveList(params) {  //  获取管辖权异议送达列表
    return myAxios({
      method: 'post',
      url: '/api/decision/getDecisionGiveList',
      data: params
    })
  },
  getApplicantList(params) {  //  获取管辖权异议申请人集合
    return myAxios({
      method: 'post',
      url: '/api/decision/getApplicantList',
      data: params
    })
  },
  applyDecision(params) {  //  管辖权异议申请
    return myAxios({
      method: 'post',
      url: '/api/decision/applyDecision',
      data: params
    })
  },
  descisionDocumentBatch(params) {  // 异议批量送达案件文书
    return myAxios({
      method: 'post',
      url: '/api/decision/descisionDocumentBatch',
      data: params
    })
  },
  updateArbitralDecisionBatch(params) {  // 异议批量送达案件文书
    return myAxios({
      method: 'post',
      url: '/api/decision/updateArbitralDecisionBatch',
      data: params
    })
  },
  decisionDocumentArrivedSuccess(params) {  // 异议送达成功
    return myAxios({
      method: 'post',
      url: '/api/decision/decisionDocumentArrivedSuccess',
      data: params
    })
  },
  saveDecisionDefencesAttachInfos(params) {  // 异议答辩
    return myAxios({
      method: 'post',
      url: '/api/decision/saveDecisionDefencesAttachInfos',
      data: params
    })
  },
  getDesisionToExamineList(params) {  // 异议审核列表
    return myAxios({
      method: 'post',
      url: '/api/decision/getDesisionToExamineList',
      data: params
    })
  },
  getArbitralDecisionDetail(params) {  // 异议审核详情
    return myAxios({
      method: 'post',
      url: '/api/decision/getArbitralDecisionDetail',
      data: params
    })
  },
  desisionToExamine(params) {  // 异议审核
    return myAxios({
      method: 'post',
      url: '/api/decision/desisionToExamine',
      data: params
    })
  },
  updateTemporaryNum(params) {  //  获取充值审核列表
    return myAxios({
      method: 'post',
      url: '/api/updateTemporaryNum',
      params
    })
  },
  getArbitralDecisionReviewInfos(params) {  //  管辖权异议【校对裁决书】查看列表
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/getArbitralDecisionReviewInfos',
      data: params
    })
  },
  getArbitralDecisionCheckInfos(params) {  //  管辖权异议【核对裁决书】查看列表
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/getArbitralDecisionCheckInfos',
      data: params
    })
  },
  getArbitralDecisionVerifyInfos(params) {  //  管辖权异议【审核裁决书】查看列表
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/getArbitralDecisionVerifyInfos',
      data: params
    })
  },
  getArbitralDecisionReviewDetail(params) {  //  管辖权异议查看详情【校对决定书】
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/getArbitralDecisionReviewDetail',
      data: params
    })
  },
  arriveArbitralDecisionAwardSuccess(params) {  //  管辖权异议查看详情【校对决定书】
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/arriveArbitralDecisionAwardSuccess',
      data: params
    })
  },
  getArbitralDecisionDetail(params) {  //  管辖权异议查看详情
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/getArbitralDecisionDetail',
      data: params
    })
  },
  getArbitralOpenCourtList(params) {  //  管辖权异议查看详情
    return myAxios({
      method: 'post',
      url: '/api/getArbitralOpenCourtList',
      data: params
    })
  },
  getTribunalToMergeInfo(params) {  //  管辖权异议查看详情
    return myAxios({
      method: 'post',
      url: '/api/getTribunalToMergeInfo',
      data: params
    })
  },
  mergeOpenCourt(params) {  //  管辖权异议查看详情
    return myAxios({
      method: 'post',
      url: '/api/mergeOpenCourt',
      data: params
    })
  },
  checkArbitralDecisionNoPass(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/checkArbitralDecisionNoPass',
      data
    })
  },
  checkArbitralDecisionPass(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/checkArbitralDecisionPass',
      data
    })
  },
  reviewArbitralDecision(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/reviewArbitralDecision',
      data
    })
  },
  verifyArbitralDecisionNoPass(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/verifyArbitralDecisionNoPass',
      data
    })
  },
  verifyArbitralDecisionPass(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/verifyArbitralDecisionPass',
      data
    })
  },
  getTribunalMergeRecordArbitralInfos(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/getTribunalMergeRecordArbitralInfos',
      data
    })
  },

  mergeOpenCourt(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/mergeOpenCourt',
      data
    })
  },
  getTribunalToMergeInfo(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/getTribunalToMergeInfo',
      data
    })
  },
  getArbitralOpenCourtList(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/getArbitralOpenCourtList',
      data
    })
  },
  getArbitralInfoDetailForMergeHearRecord(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/getArbitralInfoDetailForMergeHearRecord',
      params: data
    })
  },
  getArbitralDecisionAwardArrive(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/getArbitralDecisionAwardArrive',
      data
    })
  },
  getAllArbitralInfosAboutCheckJudge(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/getAllArbitralInfosAboutCheckJudge',
      data
    })
  },
  checkArbitralAwardPass(data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/process/checkArbitralAwardPass',
      data
    })
  },
  queryArbitralMergeCourtRecord (data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/document/queryArbitralMergeCourtRecord',
      params: data
    })
  },
  queryMergeHearRecordContext (data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/document/queryMergeHearRecordContext',
      params: data
    })
  },
  hearMergeJudgeOUploadRecord (data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/process/hearMergeJudgeOUploadRecord',
      data
    })
  },
  saveMergeHearRecordContext (data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/process/saveMergeHearRecordContext',
      data
    })
  },
  saveArbitralDecisionAward (data) {  //  管辖权异议【核对决定书】审核不通过
    return myAxios({
      method: 'post',
      url: '/api/arbitral/decision/saveArbitralDecisionAward',
      data
    })
  },
}
export { api }
