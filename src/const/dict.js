const DICT = {
	arbTypes: [
		{value: '', label: '全部', arbStatus:'',content: ''},
		{value: 1, label: '申请', arbStatus:'0,20', content: '案件状态显示：待申请、已申请、审核管辖权不通过等'},
		{value: 2, label: '立案', arbStatus:'20,30', content: '案件状态显示：审核管辖权通过、已立案'},
		{value: 3, label: '答辩', arbStatus:'30,40', content: '案件状态显示：已答辩'},
		{value: 4, label: '组庭', arbStatus:'40,50', content: '案件状态显示：组庭-线下,组庭-书面审理'},
		{value: 5, label: '审理', arbStatus:'50,60', content: '案件状态显示：审理中'},
		{value: 6, label: '裁决', arbStatus:'60,70', content: '案件状态显示：裁决中'},
		{value: 7, label: '结案', arbStatus:'70,80', content: '案件状态显示：已结案、已归档'}
	],

	// 状态:0-未完成
	// 1.待申请 2.审核管辖权不通过 3.审核管辖权拒绝 4.撤回
	// 10.已申请 11.审核管辖权通过 12.缴费成功
	// 20.自动立案成 21.立案-通知书送达
	// 30.答辩成功-上传答辩资料
	// 41.组庭-线下   42.组庭-书面审理（线上）
	// 51.线下通知书送达 52.线下开庭笔录 53.书面审理-文书送达 54.书面审理-审核
	// 60.校对裁决书 61.校对裁决书审核不通过 62.审核裁决书 63.文书签章-送达
	// 70.结案 71.归档

	//arbStopStatus 1-正常，2-撤回中，3-撤回成功

	arbStatus: [
		{value: '0',label: '未完成'},
		{value: '1',label: '待申请'},
		{value: '10',label: '已申请'},
		{value: '11,',label: '审核管辖权通过'},
		{value: '12,',label: '缴费成功'},
		{value: '20',label: '已立案'},
		{value: '21',label: '立案-通知书送达'},
		{value: '30',label: '已答辩'},
		{value: '41',label: '组庭-线下'},
		{value: '42',label: '组庭-书面审理'},
		{value: '51,52,53,54',label: '审理中'},
		{value: '60,61,62,63,64', label: '裁决中'},
		{value: '70', label: '已结案'},
		{value: '71', label: '已归档'},
		{value: '3', label: '审核管辖权拒绝'},
		{value: '4',label: '撤回'},
		{value: '2',label: '审核管辖权不通过'},
	],
	detailType: [
		{value: 1, label: '预充值'},
		{value: 2, label: '缴费'},
		{value: 3, label: '退费'},
		{value: 4, label: '提现'}
	],
	timeLimits: ['立案', '答辩', '裁决', '缴费'],
  getArbStatusName: (num) => {
	  if (!num) {
	    return ''
    }
    const temp = DICT.arbTypes.filter((item, i) => { return i !== 0 }).find(val => {
      let range = val.arbStatus.split(',')
      let max = Number(range[1])
      let min = Number(range[0])
      return num < max && num >= min
    })
    return temp.label
  }
}

export default DICT
