/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * user.known_dir
 portal:포털사이트
 sns:SNS 커뮤니티
 youtube:유투버 홍보
 friend:지인 추천
 media:미디어
 offline:오프라인광고(지하철, 버스)
 etc : 기타
 */


var ReviewSchema = new Schema({
  uid: Schema.Types.ObjectId,//작성자아이디
  did: Schema.Types.ObjectId,//딜러이이디
  writer : Object({ name: String, email: String}),//작성자정보 회원탈퇴시 해당정보로 사용
  title: String,//제목
  site: {type: String, default: 'Y'},//영차: Y, 안녕마이카: H
  category: String,//review
  sub_category: String,//(구매후기 : buy,판매후기 : sell)
  content: String,//내용
  car_num: String,//차량번호
  grade: Number,//등급
  mainImage: String,
  user : Object({
    known_dir : String,//영차를 알게된 경로
    city : String,
    paid : String,
    gender : String,
    age : Number
  }),
  agree : Boolean,
  files : [{url : String, name : String}],
  extra_file : Object({url : String, name : String}),
  views: { type: Number, default :0 },
  status: Object({ name: {type : String , default : 'review posted'}, val: {type : String , default : '301'}}),// 201 사용중, ,301 대기, 401 삭제, 501 중지
  regDate: {type: Date, default: Date.now},
  modDate: {type: Date, default: Date.now},
  reply:[{uid:Schema.Types.ObjectId, profile:String, name:String, content:String , regDate: {type: Date, default: Date.now}, modDate: {type: Date, default: Date.now}}]
});

module.exports = mongoose.model('Review', ReviewSchema);
