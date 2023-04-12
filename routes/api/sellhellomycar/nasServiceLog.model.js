/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NasServiceLogSchema = new Schema({
  certNum: String,// 주문번호
  tryCount: Number,// 시도횟수
  naskey: String,
  success: {type: Boolean, default: false}, //성공여부
  CI: String,// 중복가입확인정보(DI)
  DI: String,// 중복가입확인정보(DI)
  phoneNo: String,// 휴대폰번호
  birthDay: String,// 생년월일
  name: String,//성명
  ip: String,// ip주소
  regDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('NasServiceLog', NasServiceLogSchema);
