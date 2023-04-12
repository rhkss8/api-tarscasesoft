/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
    uid: Schema.Types.ObjectId,
    board_id : Schema.Types.ObjectId,//board_id
    writer : Object({ name: String, email: String, profile : String}),
    content: String,
    files : [{url : String, name : String}],
    views: { type: Number, default :0 },
    status: Object({ name: {type : String , default : 'event posted'}, val: {type : String , default : '201'}}),// 201 사용중, 301 삭제
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Event', EventSchema);
