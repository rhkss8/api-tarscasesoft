/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RentHelloMyCarSchema = new Schema({
  encMsg: String,// 위변조데이터
  certNum: String,// 요청번호
  date: String,// 요청일시
  CI: String,// 연계정보(CI)
  DI: String,// 중복가입확인정보(DI)
  phoneNo: String,// 휴대폰번호
  phoneCorp: String,// 이동통신사
  birthDay: String,// 생년월일
  nation: String,// 내국인
  gender: String,//성별
  name: String,//성명
  result: String,// 결과값
  certMet: String,// 인증방법
  ip: String,// ip주소
  M_name: String,// 미성년자성명
  M_birthDay: String,// 미성년자 생년월일
  M_Gender: String,//미성년자 성별
  M_nation: String,//미성년자 내외국인
  //추가정보
  wantCarName: String,//희망차종
  city: String,// 지역
  deposit: String,// 선수금
  term: String,// 계약기간
  km: String,// 약정거리
  userCredit: String,// 신용정보
  naskey: String,// 미탭스 값
  downloaded: {type: Boolean, default: false},// 엑셀다운로드여부
  downloader: String,// 다운받은사람
  regDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('RentHelloMyCar', RentHelloMyCarSchema);
