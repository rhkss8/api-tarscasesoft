/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SellSchema = new Schema({
  name: String,//제목
  phone: String,//review
  car_name: String,//(구매후기 : buy,판매후기 : sell)
  distance: String,//내용
  car_num: String,//차량번호
  mainImage: String,
  agree : Boolean,
  files : [{url : String, name : String}],
  extra_file : Object({url : String, name : String}),
  status: Object({ name: {type : String , default : 'sell posted'}, val: {type : String , default : '201'}}),// 201 사용중, ,301 대기, 401 삭제, 501 중지
  regDate: {type: Date, default: Date.now},
  modDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Sell', SellSchema);
