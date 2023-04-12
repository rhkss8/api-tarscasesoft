/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ModelSchema = new Schema({
    key: { type: Number, default : 0 },// key
    type: String,// 카테고리 종류 : ex) 'brand','fuel'..
    made: String,// 제조별 : ex) 'brand','fuel'..
    name: String,// 카테고리명
    dept: { type: Number, default : 0 },// 카테고리 순서
    price: Number,// 해당카테고리 신차가격
    f_key: Number,// 연료 key
    cc: Number,// cc
    mechanic: String,// 2WD , 4WD 등
    brand_name: String,//이미지 맵핑에 사용됨
    order: String,
    cc_unit: String,// cc 이상,이하단위
    model_type: String,// 준형준중형구분 경차(a),소형(b),준중형(c),중형(d),대형(e),SUV,RV(f),스포츠(g),화물(h)
    year: Object({ start_year: { type: Number }, end_year: { type: Number }}),// 연도 최종트림 선택시 연도 표기
    parent_type: String,// 부모 type
    parent_uid: Schema.Types.ObjectId,// 부모 uid
    status: { type: Number, default : 201 },// 상태여부 (201 : 사용 , 301 : 사용안함)
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Category', ModelSchema);
