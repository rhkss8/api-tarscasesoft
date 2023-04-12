/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    roomId: Schema.Types.ObjectId,// 방 id
    uid : Schema.Types.ObjectId,//작성자
    content: String,// 내용
    read: {type : Boolean, default : false},// 읽음여부
    regDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Message', MessageSchema);
