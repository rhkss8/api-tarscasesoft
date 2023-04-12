/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
    uid: Schema.Types.ObjectId,//작성자 아이디
    car_num : String,//자동차번호
    category : Object({
        section : Schema.Types.ObjectId,//카테고리 - 종류(국산,수입,특장)
        brand : Schema.Types.ObjectId,//카테고리 - 브랜드
        model : Schema.Types.ObjectId,//카테고리 - 모델
        model_detail : Schema.Types.ObjectId,//카테고리 - 세부모델
        fuel : Schema.Types.ObjectId,//카테고리 - 연료
        grade : Schema.Types.ObjectId,//카테고리 - 등급
        grade_detail : Schema.Types.ObjectId//카테고리 - 세부등급
    }),
    name : String,// 차량명( 카테고리명조합)
    real_name : String,// 차량명( 카테고리명조합 전체)
    made : String,// 국산 수입여부, 국산(a),수입(b)
    made_year : Date,// 국산 수입여부, 국산(a),수입(b)
    year : Number,//연식(연)
    month : Number,//연식(월)
    mission : String,//변속기
    fuel : String,//연료
    model_type : String,//차종(중형,대형 등)
    color : String,//색상
    distance : Number,//주행거리
    cc : Number,//배기량
    sale_type : String,//판매유형
    options : Object({
       sun_roof : { type : Boolean , default : false},//옵션 - 선루프
       smart_key : { type : Boolean , default : false},//옵션 - 스마트키
       cool_seat : { type : Boolean , default : false},//옵션 - 통풍시트
       hot_seat : { type : Boolean , default : false},//옵션 - 열선시트
       auto_seat : { type : Boolean , default : false},//옵션 - 전동시트
       reader_seat : { type : Boolean , default : false},//옵션 - 가죽시트
       black_box : { type : Boolean , default : false},//옵션 - 블랙박스
       hi_pass : { type : Boolean , default : false},//옵션 - 하이패스
       back_sensor : { type : Boolean , default : false},//옵션 - 후방센서
       front_sensor : { type : Boolean , default : false},//옵션 - 전방센서
       navigation : { type : Boolean , default : false},//옵션 - 네비게이션
       back_camera : { type : Boolean , default : false}//옵션 - 후방카메라
   }),
   price : { type: Number, default : 0 },//차량가격
   photo : Object({
       front : { name : String, url : String, thumb_url : String},//사진 - 앞면
       back : { name : String, url : String, thumb_url : String},//사진 - 뒷면
       side : { name : String, url : String, thumb_url : String},//사진 - 측면
       panel : { name : String, url : String, thumb_url : String},//사진 - 계기판
       interior : { name : String, url : String, thumb_url : String},//사진 - 실내
       engine : { name : String, url : String, thumb_url : String},//사진 - 엔진
       mission : { name : String, url : String, thumb_url : String},//사진 - 변속기
       seat : { name : String, url : String, thumb_url : String},//사진 - 차량시트
       wheel : { name : String, url : String, thumb_url : String},//사진 - 휠/타이어
       trunk : { name : String, url : String, thumb_url : String},//사진 - 트렁크
       option_1 : { name : String, url : String, thumb_url : String},
       option_2 : { name : String, url : String, thumb_url : String},
       option_3 : { name : String, url : String, thumb_url : String},
       option_4 : { name : String, url : String, thumb_url : String},
       option_5 : { name : String, url : String, thumb_url : String},
       option_6 : { name : String, url : String, thumb_url : String},
       option_7 : { name : String, url : String, thumb_url : String},
       option_8 : { name : String, url : String, thumb_url : String},
       option_9 : { name : String, url : String, thumb_url : String},
       option_10 : { name : String, url : String, thumb_url : String}
    }),
    performance_log : Object({//성능점검기록부
        file : { name : String, url : String},//사진
        data : { name : String},//추후 html 로 작성시 사용할예정
        db : { name : String}//추후 html 로 작성시 사용할예정
    }),
    insurance_log : Object({//보험이력
        file : { name : String, url : String},//사진
        data : { name : String}//추후 html 로 작성시 사용할예정
    }),
    desc : String,//차량설명
    video_url : String,//동영상 유투브 url
    video_key : String,//동영상 유투브 url key
    tag : String,//태그 #무사고#1인신조#비흡연차량#단순교환 등등
    status: Object({ name: { type: String, default : "product posted" }, val: { type: String, default : 401 }}),
    // 상태여부 (201 : 광고차량 / 301 : 일시정지 / 401 : 심사대기 / 501 : 반려 / 601 : 등록차량 / 701 : 판매완료 / 801 : 삭제처리 / 901 : 판매자 삭제된 매물)
    reject: String,//반려사유
    city : String,//지역
    status_update_uid: Schema.Types.ObjectId,//업데이트 아이디
    expDate: Date,
    regDate: {type: Date, default: Date.now},
    modDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Product', ProductSchema);
