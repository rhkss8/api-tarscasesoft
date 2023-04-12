/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlanSchema = new Schema({
    type: String,// 기획종류 : ex) 'recommend','promotion'..
    title: String,// 기획명
    sub_title: String,// 기획 부제
    photo : Object({ name : String, url : String, thumb_url : String}),
    items : [{
      product_id : Schema.Types.ObjectId,
      order : Number
    }],
    status: { type: Number, default : 301 },// 상태여부 (201 : 사용 , 301 : 사용안함)
    order: Number,
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Plan', PlanSchema);
