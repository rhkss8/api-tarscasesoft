/**
 * Created by rhkss8 on 2016. 11. 15..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddProductSchema = new Schema({
    saleId: Schema.Types.ObjectId,                  // 광고정보 : 매물번호
    orderId: Schema.Types.ObjectId,                  // 광고정보 : 매물번호
    uid: Schema.Types.ObjectId,                     // 광고정보 : 신청자 아이디
    title: String,                                  // 광고정보 : 매물 타이틀
    orderNo: String,                                // 광고정보 : 주문번호(자동생성 / 랜덤문자 + 날짜)
    orderType: String,                              // 광고정보 : 광고 타입 (메인,메인서브 등등)
    price : { type: Number, default : 0 },          // 광고정보 : 광고 비용

    type: String,                                           // 캘린더 정보 : 타입
    startsAt: Date,                                         // 캘린더 정보 : 광고 신청날짜
    draggable: { type: Boolean, default : true },           // 캘린더 정보 : 드래그가능여부
    color: Object({ primary: String, secondary: String}),   // 캘린더 정보 : 색상 (광고 타입에 따라 다르게 설정됨)

    views: { type: Number, default : 0 },                                                                           // 광고 기재시 view 카운트
    status: Object({ name: { type: String, default : "add posted" }, val: { type: String, default : "201" }}),      // 상태여부 (201 : 신청 / 301 : 승인 / 401 : 반려 / 501 : 종료)
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now},
});

module.exports = mongoose.model('AddProduct', AddProductSchema);
