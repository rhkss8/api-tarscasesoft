/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddSchema = new Schema({
    uid: Schema.Types.ObjectId,                    // 광고정보 : 신청자 아이디
    name: String,                                  // 광고정보 : 신청자
    orderNo: String,                               // 광고정보 : 주문번호(자동생성 / 랜덤문자 + 날짜)
    totalPrice: { type: Number, default : 0 },     // 광고정보 : 최종결제금액
    discountTotal: { type: Number, default : 0 },  // 광고정보 : 쿠폰합산가격
    orderPrice: { type: Number, default : 0 },     // 광고정보 : 상품합산가격
    status: Object({ name: { type: String, default : "add posted" }, val: { type: String, default : "201" }}),      // 상태여부 (201 : 신청 / 301 : 승인 / 401 : 반려 / 501 : 종료)
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Add', AddSchema);
