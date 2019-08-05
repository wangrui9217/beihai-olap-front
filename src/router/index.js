import Vue from 'vue'
import Router from 'vue-router'

import routerview from '@/views/common/routerview'

import NotFoundComponent from '@/views/common/404'
// 用户端
import arbitralList from '@user/arbitral_list'
import arbitralInfo from '@user/arbitralInfo'
import userLogin from '@user/login'
import user from '@user/user'
import userHome from '@user/home'
import apply from '@user/apply'
import editArbitral from '@user/editArbitral'
import dissentReply from '@user/dissentReply'
import msg from '@user/msg'
import userCenter from '@user/userCenter'
import updatePassword from '@user/updatePassword'

// 管理端
import admin from '@admin/admin'
import adminHome from '@admin/home'
import arbLogin from '@admin/login'
import AllInfo from '@admin/AllInfo'
import arbNumber from '@admin/arb_settings/arb_number/arb_number'
import arbitratorManage from '@admin/arb_settings/arbitrator_manage/arbitrator_manage'
import initParameter from '@admin/arb_settings/init_parameter/init_parameter'
import contractFormula from '@admin/arb_settings/contract_formula/contract_formula'
import costCalcRule from '@admin/arb_settings/cost_calc_rule/costCalcRule'
import addRule from '@admin/arb_settings/cost_calc_rule/addRule'
import readRule from '@admin/arb_settings/cost_calc_rule/readRule'
import arbitralAwardManage from '@admin/arb_settings/arbitralAward/arbitralAwardManage'
import addArbitralAward from '@admin/arb_settings/arbitralAward/addArbitralAward'
import timeLimit from '@admin/arb_settings/timeLimit/timeLimit'
import product from '@admin/arb_settings/product/product'
import arbProcedure from '@admin/arb_settings/arb_procedure'
import bill from '@admin/financial/bill'
import prepayment from '@admin/financial/prepayment'
import precharge from '@admin/financial/precharge'
import recharge from '@admin/financial/recharge'
import adminMsg from '@admin/arb_manage/msg'
import notice from '@admin/arb_manage/notice'
import arbitralAward from '@admin/arb_manage/arbitralAward'
import proofread from '@admin/arb_manage/proofread'
import verify from '@admin/arb_manage/verify'
import proofreadDetail from '@admin/arb_manage/proofreadDetail'
import verifyDetail from '@admin/arb_manage/verifyDetail'
import check from '@admin/arb_manage/check'
import courtRecordList from '@admin/arb_manage/courtRecordList'
import courtRecordDetail from '@admin/arb_manage/courtRecordDetail'
import courtRecordTotalDetail from '@admin/arb_manage/courtRecordTotalDetail'
import reply from '@admin/arb_manage/reply'
import tribunal from '@admin/arb_manage/tribunal'
import tribunalOffline from '@admin/arb_manage/tribunalOffline'
import tribunalWritten from '@admin/arb_manage/tribunalWritten'
import queryArbitral from '@admin/arb_manage/queryArbitral'
import supplement from '@admin/arb_manage/supplement'
import dissentApply from '@admin/arb_manage/dissent/dissentApply'
import dissentManageArrival from '@admin/arb_manage/dissent/dissentManageArrival'
import dissentReviewList from '@admin/arb_manage/dissent/dissentReviewList'
import dissentReviewItemDetail from '@admin/arb_manage/dissent/dissentReviewItemDetail'
import auditJurisdictionList from '@admin/arb_audit/auditJurisdictionList'
import auditJurisdictionDetail from '@admin/arb_audit/auditJurisdictionDetail'
import auditDataList from '@admin/arb_audit/auditDataList'
import auditDataDetail from '@admin/arb_audit/auditDataDetail'
import auditArbitralAwardList from '@admin/arb_audit/auditArbitralAwardList'
import auditArbitralAwardDetail from '@admin/arb_audit/auditArbitralAwardDetail'
import firstTrial from '@admin/arb_audit/firstTrial'
import lastTrial from '@admin/arb_audit/lastTrial'
import adminManage from '@admin/sys_settings/admin_manage'
import roleManage from '@admin/sys_settings/role_manage'
import userManage from '@admin/sys_settings/user_manage'
import mediation from '@admin/recall/mediation'
import sms from '@admin/sms'
import dissentCheck from '@admin/dissent/dissentCheck'
import dissentCheckDetail from '@admin/dissent/dissentCheckDetail'
import dissentReview from '@admin/dissent/dissentReview'
import dissentReviewDetail from '@admin/dissent/dissentReviewDetail'
import dissentVerify from '@admin/dissent/dissentVerify'
import dissentVerifyDetail from '@admin/dissent/dissentVerifyDetail'
import dissentArrival from '@admin/dissent/dissentArrival'
import courtCase from '@admin/arb_manage/courtCase'
import courtService from '@admin/arb_manage/courtService'
import courtInfo from '@admin/arb_manage/courtInfo'

Vue.use(Router)

const router = new Router({
  // mode: 'history',
  routes: [{
      path: '/',
      component: userLogin,
      name: 'index',
      meta: {
        title: '北海国际仲裁院-用户端',
        noRequireAuth: true,
        user: true
      }
    },
    {
      path: '*',
      component: NotFoundComponent,
      meta: {
        code: '404',
        title: '该页面不存在'
      }
    },
       {
      path: '/userLogin',
      component: userLogin,
      name: 'userLogin',
      meta: {
        title: '北海国际仲裁院-用户端',
        noRequireAuth: true,
        user: true
      }
    },
    {
      path: '/user',
      component: user,
      name: 'user',
      redirect: '/user/arbitralList',
      meta: {
        user: true
      },
      children: [{
          path: 'home',
          component: userHome,
          name: 'userHome',
          redirect: '/user/arbitralList',
          meta: {
            user: true
          }
        },
        {
          path: 'arbitralList',
          component: arbitralList,
          name: 'arbitralList',
          meta: {
            user: true
          }
        },
        {
          path: 'arbitralInfo',
          component: arbitralInfo,
          name: 'arbitralInfo',
          meta: {
            user: true
          }
        },
        {
          path: 'apply',
          component: apply,
          name: 'apply',
          meta: {
            user: true
          }
        },
        {
          path: 'editArbitral',
          component: editArbitral,
          name: 'editArbitral',
          meta: {
            user: true
          }
        },
        {
          path: 'dissentReply',
          component: dissentReply,
          name: 'dissentReply',
          meta: {
            user: true
          }
        },
        {
          path: 'userCenter',
          component: userCenter,
          name: 'userCenter',
          meta: {
            user: true
          }
        },
        {
          path: 'updatePassword',
          component: updatePassword,
          name: 'updatePassword',
          meta: {
            user: true
          }
        },

        {
          path: 'msg',
          component: msg,
          name: 'msg',
          meta: {
            user: true
          }
        }
      ]
    },
    // --------------------------------------------
    {
      path: '/arbLogin',
      component: arbLogin,
      name: 'arbLogin',
      meta: {
        title: '北海国际仲裁院-管理端',
        noRequireAuth: true
      }
    },
    {
      path: '/AllInfo',
      component: AllInfo,
      name: '仲裁请求详情'
    },
    {
      path: '/admin',
      component: admin,
      name: '仲裁管理端',
      redirect: '/admin/audit',
      children: [{
          path: 'home',
          component: adminHome,
          name: '首页',
          redirect: 'audit',
        },
        {
          path: 'manage',
          redirect: 'manage/notice',
          name: '案件管理',
          component: routerview,
          children: [
            {
              path: 'notice',
              component: notice,
              name: '立案送达'
            },
            {
              path: 'reply',
              component: reply,
              name: '案件答辩'
            },
            {
              path: 'tribunal',
              component: tribunal,
              name: '案件组庭'
            },
            {
              path: 'tribunalOffline',
              component: tribunalOffline,
              name: '组庭开庭送达'
            },
            {
              path: 'tribunalWritten',
              component: tribunalWritten,
              name: '书面审理送达'
            },
            {
              path: 'courtRecord',
              component: routerview,
              redirect: 'courtRecord/courtRecordList',
              name: '开庭笔录',
              children: [
                {
                  path: 'courtRecordList',
                  component: courtRecordList,
                  name: ''
                },
                {
                  path: 'courtRecordDetail',
                  component: courtRecordDetail,
                  name: '开庭笔录详情'
                },
                {
                  path: 'courtCase',
                  component: courtCase,
                  name: '案件开庭'
                },
              ]
            },
            {
              path: 'proofread',
              component: routerview,
              redirect: 'proofread/proofreadList',
              name: '裁决管理',
              children: [
                {
                  path: 'proofreadList',
                  component: proofread,
                  name: '校对裁决书'
                },
                {
                  path: 'verifyList',
                  component: verify,
                  name: '核对裁决书'
                },
                {
                  path: 'proofreadDetail',
                  component: proofreadDetail,
                  name: '校对裁决书详情'
                },
                {
                  path: 'verifyDetail',
                  component: verifyDetail,
                  name: '核对裁决书详情'
                },
              ]
            },
            {
              path: 'check',
              component: routerview,
              redirect: 'check/checkList',
              name: '核对裁决书',
              children: [
                {
                  path: 'checkList',
                  component: check,
                  name: ''
                },
                // {
                //   path: 'proofreadDetail',
                //   component: proofreadDetail,
                //   name: '校对裁决书详情'
                // },
              ]
            },
            {
              path: 'arbitralAward',
              component: arbitralAward,
              name: '裁决书送达'
            },
            {
              path: 'sms',
              component: sms,
              name: '短信'
            },
            {
              path: 'queryArbitral',
              component: queryArbitral,
              name: '案件查询'
            },
            {
              path: 'supplement',
              component: supplement,
              name: '证据补充'
            },
            {
              path: 'adminMsg',
              component: adminMsg,
              name: '消息中心'
            },
            {
              path: 'mediation',
              component: mediation,
              name: '案件调解'
            },
            {
              path: 'dissent',
              redirect: 'dissent/dissentApply',
              name: '管辖权异议',
              component: routerview,
              children: [
                {
                  path: 'dissentApply',
                  component: dissentApply,
                  name: '管辖权异议申请'
                },
                {
                  path: 'dissentManageArrival',
                  component: dissentManageArrival,
                  name: '管辖权异议送达'
                },
                {
                  path: 'dissentReviewList',
                  component: dissentReviewList,
                  name: '管辖权异议审核'
                },
                {
                  path: 'dissentReviewItemDetail',
                  component: dissentReviewItemDetail,
                  name: '管辖权异议审核详情'
                }
              ]
            }
          ]
        },
        {
          path: 'audit',
          redirect: 'audit/auditJurisdiction',
          name: '审核管理',
          component: routerview,
          children: [{
              path: 'auditJurisdiction',
              component: routerview,
              name: '审核管辖权',
              redirect: 'auditJurisdiction/auditJurisdictionList',
              children: [
                {
                  path: 'auditJurisdictionList',
                  component: auditJurisdictionList,
                  name: ''
                },
                {
                  path: 'auditJurisdictionDetail',
                  component: auditJurisdictionDetail,
                  name: '审核管辖权详情'
                }
              ]
            },
            {
              path: 'auditData',
              component: routerview,
              name: '审核案件资料',
              redirect: 'auditData/auditDataList',
              children: [
                {
                  path: 'auditDataList',
                  component: auditDataList,
                  name: ''
                },
                {
                  path: 'auditDataDetail',
                  component: auditDataDetail,
                  name: '审核案件资料详情'
                }
              ]
            },
            {
              path: 'auditArbitralAward',
              component: routerview,
              name: '审核校对裁决书',
              redirect: 'auditArbitralAward/auditArbitralAwardList',
              children: [
                {
                  path: 'auditArbitralAwardList',
                  component: auditArbitralAwardList,
                  name: ''
                },
                {
                  path: 'auditArbitralAwardDetail',
                  component: auditArbitralAwardDetail,
                  name: '审核校对裁决书详情'
                }
              ]
            },
            {
              path: 'firstTrial',
              component: firstTrial,
              name: '撤回请求初审'
            },
            {
              path: 'lastTrial',
              component: lastTrial,
              name: '撤回请求终审'
            }
          ]
        },
        {
          path: 'settings',
          component: routerview,
          name: '案件设置',
          redirect: 'settings/arbitratorManage',
          children: [{
              path: 'arbitratorManage',
              component: arbitratorManage,
              name: '维护仲裁员'
            },
            {
              path: 'product',
              component: product,
              name: '维护产品类型'
            },
            {
              path: 'contractFormula',
              component: contractFormula,
              name: '维护计算公式'
            },
            {
              path: 'arbitralAwardManage',
              component: arbitralAwardManage,
              name: '维护裁决书模板'
            },
            {
              path: 'addArbitralAward',
              component: addArbitralAward,
              name: '新增裁决书模板'
            },
            {
              path: 'updateArbitralAward',
              component: addArbitralAward,
              name: '修改裁决书模板'
            },
            {
              path: 'addRule',
              component: addRule,
              name: '新增仲裁费用计算规则'
            },
            {
              path: 'updateRule',
              component: addRule,
              name: '修改仲裁费用计算规则'
            },
            {
              path: 'readRule',
              component: readRule,
              name: '查看仲裁费用计算规则'
            },
            {
              path: 'costCalcRule',
              component: costCalcRule,
              name: '维护仲裁费用计算规则'
            },
            {
              path: 'timeLimit',
              component: timeLimit,
              name: '设置时限'
            },
            {
              path: 'arbNumber',
              component: arbNumber,
              name: '设置可用号段'
            },
            {
              path: 'initParameter',
              component: initParameter,
              name: '初始化参数'
            },
            {
              path: 'arbProcedure',
              component: arbProcedure,
              name: '适用程序管理'
            }
          ]
        },
        {
          path: 'financial',
          component: routerview,
          name: '财务管理',
          redirect: 'financial/bill',
          children: [{
              path: 'bill',
              component: bill,
              name: '对账单查询'
            },
            {
              path: 'prepayment',
              component: prepayment,
              name: '缴费查询'
            },
            {
              path: 'precharge',
              component: precharge,
              name: '预充值查询'
            },
            {
              path: 'recharge',
              component: recharge,
              name: '充值审核'
            }
          ]
        },
        {
          path: 'adminManage',
          component: routerview,
          name: '系统设置',
          redirect: 'adminManage/adminManageList',
          children: [{
              path: 'adminManageList',
              component: adminManage,
              name: '管理员列表'
            },
            {
              path: 'roleManage',
              component: roleManage,
              name: '角色管理'
            },
            {
              path: 'userManage',
              component: userManage,
              name: '前端账号管理'
            }
          ]
        },
        {
          path: 'dissent',
          redirect: 'dissent/dissentCheck',
          name: '管辖权异议',
          component: routerview,
          children: [
            {
              path: 'dissentCheck',
              component: dissentCheck,
              name: '校对决定书'
            }, {
              path: 'dissentCheckDetail',
              component: dissentCheckDetail,
              name: '校对决定书详情'
            }, {
              path: 'dissentReview',
              component: dissentReview,
              name: '核对决定书'
            }, {
              path: 'dissentReviewDetail',
              component: dissentReviewDetail,
              name: '核对决定书详情'
            }, {
              path: 'dissentVerify',
              component: dissentVerify,
              name: '审核决定书'
            }, {
              path: 'dissentVerifyDetail',
              component: dissentVerifyDetail,
              name: '审核决定书详情'
            }, {
              path: 'dissentArrival',
              component: dissentArrival,
              name: '决定书送达'
            }
          ]
        },
        {
          path: 'court',
          component: routerview,
          redirect: 'court/courtRecordList',
          name: '开庭管理',
          children: [
            {
              path: 'courtRecordList',
              component: courtRecordList,
              name: '开庭笔录'
            },
            {
              path: 'courtRecordDetail',
              component: courtRecordDetail,
              name: '开庭笔录详情'
            },
            {
              path: 'courtRecordTotalDetail',
              component: courtRecordTotalDetail,
              name: '合并开庭笔录详情'
            },
            {
              path: 'courtCase',
              component: courtCase,
              name: '案件开庭'
            },
            {
              path: 'courtService',
              component: courtService,
              name: '书面审理送达'
            },
            {
              path: 'courtInfo',
              component: courtInfo,
              name: '审核案件资料'
            },
            {
              path: 'courtInfoDetail',
              component: courtRecordDetail,
              name: '审核案件详情'
            },
          ]
        },
      ]
    }
  ]
})
// 判断是否需要登录权限 以及是否登录
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  if (to.meta && to.meta.code === '404') {
    next()
  } else if (to.meta && to.meta.user) { // 用户端
    if (localStorage.getItem('userAccessToken')) { //有登录token
      if (to.meta && to.meta.noRequireAuth) { // 对于登录页,转登录后首页
        next({
          path: '/user/home'
        })
      } else {
        next()
      }
    } else { // 无登录token
      if (to.meta && to.meta.noRequireAuth) { // 对于登录页,放行
        next()
      } else {
        next({
          path: '/userLogin'
        })
      }
    }
  } else { // 是管理端
    if (localStorage.getItem('adminAccessToken')) { //有登录token
      if (to.meta && to.meta.noRequireAuth) { // 对于登录页,转登录后首页
        next({
          path: '/admin/home'
        })
      } else {
        next()
      }
    } else { // 无登录token
      if (to.meta && to.meta.noRequireAuth) { // 对于登录页,放行
        next()
      } else {
        next({
          path: '/arbLogin'
        })
      }
    }
  }
})
export default router
