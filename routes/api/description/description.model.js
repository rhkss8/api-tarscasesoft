/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DescriptionSchema = new Schema({
    uid: Schema.Types.ObjectId,
    title: String,
    content: String,
    key: String,
    regDate: {type: Date, default: Date.now},
    modDate: Date
});

module.exports = mongoose.model('Description', DescriptionSchema);
