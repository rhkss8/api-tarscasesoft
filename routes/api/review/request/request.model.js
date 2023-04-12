/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RequestSchema = new Schema({
    getUid: Schema.Types.ObjectId,                  // 받는 사람 아이디
    content: String,                                // 내용
    sendUid: Schema.Types.ObjectId,                 // 메세지 보낸사람 아이디
    phoneStatus : { type: String, default : "301" },// 연락처 공개 여부 201 가능 : 301 불가
    views: { type: String, default : "301" },       // 확인 여부 : 201 읽음 : 301 안읽음
    reqType: { type: String, default : "consultant" },// 의뢰타입 'consultant' , 'bdblog'
    status: Object({ name: { type: String, default : "message posted" }, val: { type: String, default : "201" }}),   // 상태여부 201 사용 : 301 삭제
    sendStatus: Object({ name: { type: String, default : "send message" }, val: { type: String, default : "201" }}),   // 상태여부 201 사용 : 301 삭제
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Request', RequestSchema);
