/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MsgRoomSchema = new Schema({
    productId: Schema.Types.ObjectId,// 문의한 광고 아이디
    type : String,//차량문의:car
    dealer: Schema.Types.ObjectId,
    user: Schema.Types.ObjectId,
    phone_open : {type: Boolean, default: false},
    members : [Schema.Types.ObjectId],
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('MsgRoom', MsgRoomSchema);
