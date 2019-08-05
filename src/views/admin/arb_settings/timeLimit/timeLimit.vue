<template>
  <div v-loading.fullscreen="loading" class="g-listpage__style">
    <div style="display: flex;
    flex-wrap: wrap;">
      <div class="time-limit" v-for="item in lists">
        <div class="time-title">{{item.procedureName}}</div>
        <ul>
          <li v-for="child in item.children">
            <dl>
              <dt>阶段：</dt>
              <dd><b>{{child.name}}</b></dd>
            </dl>
            <dl>
              <dt>时限(天)：</dt>
              <dd>
                <b v-if="!child.isSetting">{{child.limitDay}}</b>
                <input v-else type="text" v-model="child.limitDayInput" @change="validate(1, child)">
                <p v-if="child.error1">{{child.error1}}</p>
              </dd>
            </dl>
            <dl>
              <dt>提醒时间(天)：</dt>
              <dd>
                <b v-if="!child.isSetting">{{child.remindDay}}</b>
                <input v-else type="text" v-model="child.remindDayInput" @change="validate(2, child)">
                <p v-if="child.error2">{{child.error2}}</p>
              </dd>
            </dl>
            <div class="exchange">
              <p v-if="!child.isSetting" @click="edit(child)">修改</p>
              <div v-else><span class="g-link" @click="save(child)">确定</span><span @click="cancel(child)">取消</span></div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { api } from '@/api'
import DICT from '@/const/dict'
export default {
  data() {
    return {
      loading: false,
      lists: []
    }
  },
  methods: {
    edit(item) {
      item.limitDayInput = item.limitDay
      item.remindDayInput = item.remindDay
      item.isSetting = true
    },
    save(item) {
      if (/^[1-9]\d*$/.test(item.limitDayInput) === false) {
        item.error1 = '请填写正整数数字'
      } else if (/^[1-9]\d*$/.test(item.remindDayInput) === false) {
        item.error2 = '请填写正整数数字'
      } else if (item.limitDayInput - item.remindDayInput <= 0) {
        item.error2 = '时限不能小于提醒时间'
      } else {
        item.error2 = ''
        this.loading = true
        api.saveArbitralTimeLimit({
          limitDay: item.limitDayInput,
          remindDay: item.remindDayInput,
          stage: item.stage,
          arbitralProcedureId: item.arbitralProcedureId
        }).then(res => {
          this.loading = false
          item.isSetting = false
          if (res.data.code === '1') {
            this.$message.success(res.data.msg)
            item.limitDay = item.limitDayInput
            item.remindDay = item.remindDayInput
          } else {
            this.$message.error(res.data.msg)
          }
        })
      }
    },
    cancel(item) {
      item.error1 = ''
      item.error2 = ''
      item.isSetting = false
    },
    getArbitralTimeLimit() {
      this.loading = true
      api.getArbitralTimeLimit({
        stages: '1,4'
      }).then(res => {
        this.loading = false
        if (res.data.code === '1') {
          let data = res.data.data
          let procedureNameArray = data.map((item) => {
            return item.procedureName
          })
          procedureNameArray = Array.from(new Set(procedureNameArray))
          let lists = []
          procedureNameArray.forEach(item => {
            let o = {
              procedureName: item,
              children: []
            }
            data.forEach((value) => {
              // stage (integer): 阶段，1-立案，2-答辩，3裁决， 4缴费
              Object.assign(value, {
                name: DICT.timeLimits[value.stage - 1],
                limitDayInput: '',
                remindDayInput: '',
                isSetting: false,
                error1: '',
                error2: ''
              })
              if (value.procedureName === o.procedureName) {
                o.children.push(value)
              }
            })
            lists.push(o)
          })
          this.lists = lists
        }
      })
    },
    validate(type, item) {
      if (type === 1) {
        if (/^[1-9]\d*$/.test(item.limitDayInput) === false) {
          item.error1 = '请填写正整数数字'
        } else {
          item.error1 = ''
        }
      } else {
        if (/^[1-9]\d*$/.test(item.remindDayInput) === false) {
          item.error2 = '请填写正整数数字'
        } else {
          item.error2 = ''
        }
      }
    }
  },
  created() {
    this.getArbitralTimeLimit()
  }
}

</script>
<style lang="scss" scoped>
.time-title {
  line-height: 48px;
  text-align: center;
  background: #ccc;
}

.time-limit {
  width: 330px;
  margin-right: 15px;
  margin-left: 15px;
  margin-bottom: 20px;
  input {
    height: 26px;
    line-height: 26px;
    border: solid 1px #bebebe;
    display: block;
    width: 100px;
  }

  ul {
    li {
      box-sizing: border-box;
      border: solid 1px rgba(233, 233, 233, 1);
      border-radius: 2px;

      .exchange {
        margin-top: 20px;
        background: #f7f9fa;
        text-align: center;
        color: #8d8d8d;
        line-height: 48px;
        cursor: pointer;

        p:hover {
          color: #2b85ff;
        }

        span {
          display: inline-block;
          width: 50%;
          line-height: 48px;
        }
      }
    }

    dl {
      box-sizing: border-box;
      line-height: 30px;
      display: flex;
      width: 100%;
      margin-top: 20px;

      dt {
        width: 40%;
        font-size: 14px;
        text-align: right;
        color: #999;
      }

      dd {
        padding-left: 25px;
        width: 70%;
        font-size: 16px;
        position: relative;

        p {
          position: absolute;
          width: 100%;
          height: 20px;
          left: 0;
          padding-left: 25px;
          top: 100%;
          color: #f00;
          font-size: 12px;
          line-height: 20px;
        }
      }
    }
  }
}

</style>
