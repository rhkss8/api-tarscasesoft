/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
    productId: Schema.Types.ObjectId,// 차량
    dealerId : Schema.Types.ObjectId,// 판매자
    ids : [{uid : Schema.Types.ObjectId, regDate: {type : Date, default : Date.now}, read: { type: String, default : 'unread' }}],// 요청자
    content : String,
    type : String,//영상 'video'
    status: Object({ name: { type: String, default : "video request" }, val: { type: String, default : 301 }}),//301 요청 ,201 영상업로드완료
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now},
    read : {type: Boolean, default: false}//딜러전용 읽음상태
});

module.exports = mongoose.model('Question', QuestionSchema);
