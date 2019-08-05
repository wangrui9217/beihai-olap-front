const rules = {
  username: { required: true, trigger: 'blur', message: '请录入登录名' },
  phoneRule: [
    { required: true, trigger: 'blur', message: '请录入手机号' },
    { pattern: /^1\d{10}$/, trigger: 'blur', message: '手机号格式错误' }
  ],
  passwordRule: { required: true, trigger: 'blur', message: '请填写密码' },
  cityRule: { required: true, trigger: 'change', message: '请选择城市地址' },
  addressRule: [
    { required: true, trigger: 'blur', message: '请填写地址' },
    { max: 100, message: '100个字符以内', trigger: 'blur' }
  ],
  coJobRule: { max: 50, message: '50个字符以内', trigger: 'blur' },
  coIdnum: [
    { required: true, message: '请填写企业统一信用代码' },
    { pattern: /^[^_IOZSVa-z\W]{2}\d{6}[^_IOZSVa-z\W]{10}$/, message: '统一信用代码格式错误',trigger: 'blur' }
  ],
  zipcodeRule: [
    { pattern: /^\d{6}$/, trigger: 'blur', message: '邮编格式错误，请录入正确的邮编' },
  ],
  coNameRule: [
    { required: true, trigger: 'blur', message: '请填写企业名' },
    { max: 50, message: '50个字符以内', trigger: 'blur' }
  ],
  realnameRule: [
    { required: true, trigger: 'blur', message: '请填写姓名' },
    { max: 10, message: '10个字符以内', trigger: 'blur' }
  ],
  emailRule: [
    { required: true, trigger: 'blur', message: '请录入邮箱' },
    { type: 'email', message: '邮箱格式错误，请录入正确的邮箱', trigger: 'blur' },
  ],
  emailRuleNotRequired: [
    { required: true, trigger: 'blur', message: '请录入邮箱' },
    { type: 'email', message: '邮箱格式错误，请录入正确的邮箱', trigger: 'blur' },
  ],
  idnumRule: [
    { required: true, trigger: 'blur', message: '请填写身份证号码' },
    { pattern: /^[1-9]\d{5}(((19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}[xX\d])|(\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}))$/, trigger: 'blur', message: '身份证号格式错误' }
  ],
  coLegalPersonIdnumRule: { pattern: /^[1-9]\d{5}(((19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}[xX\d])|(\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}))$/, trigger: 'blur', message: '身份证号格式错误' },
  hasIdImgRule: { required: true, trigger: 'change', message: '请上传身份证正面和反面' },
  arbApplication: [
    { required: true, trigger: 'blur', message: '请录入请求事项' },
    { max: 2000, trigger: 'blur', message: '仲裁请求长度限制2000个字符' }
  ],
  arbApplicationDescription: [
    { required: true, trigger: 'blur', message: '请录入事实和理由' },
    { max: 8000, trigger: 'blur', message: '事实和理由长度限制8000个字符' }
  ],
  agentJobRule: [
    { required: true, trigger: 'blur', message: '请输入职务' }
  ],
  agentIdnumRule: [
    { required: true, trigger: 'blur', message: '请输入17位执业证号' },
    { pattern: /^\d{17}$/, message: '执业证号格式错误，请输入正确的执业证号', trigger: 'blur' },
  ],
  requireSelect: [{ required: true, trigger: 'change', message: '该项不能为空' }],
  requireInput: [{ required: true, trigger: 'blur', message: '该项不能为空' }]
}
export default rules
