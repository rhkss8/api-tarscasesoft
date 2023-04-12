/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BoardSchema = new Schema({
    uid: Schema.Types.ObjectId,
    writer : Object({ name: String, email: String}),
    title: String,
    site: {type: String, default: 'Y'},// 영차: Y, 안녕마이카: H
    category: String,//contact 문의하기, news 소식 , event 이벤트 , notice 공지
    sub_category: String,//문의하기에서 사
    content: String,
    mainImage: String,
    files : [{url : String, name : String}],
    extra_file : Object({url : String, name : String}),
    views: { type: Number, default :0 },
    status: Object({ name: {type : String , default : 'board posted'}, val: {type : String , default : '201'}}),// 201 사용중, 301 삭제, 401 중지
    eventExpireDate: Date,//이벤트 일때만 사용한다 이벤트 마감날짜
    answerable: Boolean,//참여 가능한 이벤트인지 여부
    attachable: Boolean,//참여 가능할때 파일 첨부 가능인지
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now},
    reply:[{uid:Schema.Types.ObjectId, profile:String, name:String, content:String , regDate: {type: Date, default: Date.now}, modDate: {type: Date, default: Date.now}}]
});

module.exports = mongoose.model('Board', BoardSchema);
