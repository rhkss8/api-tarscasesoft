/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlogSchema = new Schema({
    uid: Schema.Types.ObjectId,
    writer : Object({ name: String, email: String}),
    title: String,
    tag: String,
    blogNo: String,
    content: String,
    mainImage: String,
    views: { type: Number, default :0 },
    status: Object({ name: String, val: Number}),
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now},
    like: [],
    reply:[{uid:String, profile:String, name:String, content:String , regDate: {type: Date, default: Date.now}, modDate: {type: Date, default: Date.now}}],

});

module.exports = mongoose.model('Blog', BlogSchema);
