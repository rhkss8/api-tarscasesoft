/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PerformSchema = new Schema({
  uid: Schema.Types.ObjectId,//작성자 아이디
  product_id: Schema.Types.ObjectId,//차량 아이디
  reportNum1: String,//성능번호
  reportNum2: String,//성능번호
  reportNum3: String,//성능번호
  tuningState : String,//튜닝
  serious : String,//특별이력
  usageChange : String,//용도변경
  color : String,//색상
  mainOptions : String,//주요옵션
  uiAccidentInfo : {type: Boolean, default: false},//사고이력
  uiRepairInfo : {type: Boolean, default: false},//단순수리
  uiLank1Info : {type: Boolean, default: false},//부위별 이상여부 외판부위 1랭크
  uiLank2Info : {type: Boolean, default: false},//부위별 이상여부 외판부위 2랭크
  uiFrameInfo : {type: Boolean, default: false},//부위별 이상여부 주요골격
  uiFrameDetailInfo : Object({//부위별 이상여부 주요골격 options
    aRank : {type: Boolean, default: false},//A랭크
    bRank : {type: Boolean, default: false},//B랭크
    cRank : {type: Boolean, default: false}//C랭크
  }),
  priceConditionInput : {type: Boolean, default: false},//자동차가격조사·산정 선택
  parts_81 : {type: Boolean, default: false},//서명, 중고자동차성능·상태를 점검
  parts_82 : {type: Boolean, default: false},//서명, 자동차가격조사·산정
  master : {
    carName : String,//차명
    carNum : String,//자동차 등록번호
    carYear : String,//자동차 연식
    checkStartDate : String,//검사 유효기간 앞자리
    checkEndDate : Date,//검사 유효기간 뒷자리
    registerDate : Date,//최초등록일
    missionType : String,//변속기 종류
    fuelType : String,//사용연료
    carRegistration : String,//차대번호
    guarantyType : String,//보증유형
    motorType : String,//원동기 형식
    boardState : String,//주행거리 계기상태
    mileageStatus : String,//주행거리 상태
    mileage : String,//현재 주행거리
    carState : String,//차대번호 표기
    gasCoStatus : {type: Boolean, default: true},//배출가스 일산화탄소
    hydStatus : {type: Boolean, default: true},//배출가스 탄화수소
    smokeStatus : {type: Boolean, default: false},//배출가스 매연
    gasCo : String,//일산화탄소(CO)
    hyd : String,//탄화수소(HC)
    smoke : String,//탄화수소(HC)
    tuningState : Object({ //튜닝 checkbox options
      legality : {type: Boolean, default: false},//적법
      illegal : {type: Boolean, default: false},//불법
      rescue : {type: Boolean, default: false},//구조
      device : {type: Boolean, default: false}//장치
    }),
    serious : Object({ //특별이력 checkbox options
      flooding : {type: Boolean, default: false},//침수
      fire : {type: Boolean, default: false}//화재
    }),
    usageChange : Object({ //용도변경 checkbox options
      rent : {type: Boolean, default: false},//렌트
      lease : {type: Boolean, default: false},//리스
      business : {type: Boolean, default: false}//영업용
    }),
    paintPart : Object({ //색상 checkbox options
      whole : {type: Boolean, default: false},//전체도색
      change : {type: Boolean, default: false}//색상변경
    }),
    mainOptions : Object({ //주요옵션 checkbox options
      etc : {type: Boolean, default: false},//기타
      sunroof : {type: Boolean, default: false},//선루프
      navi : {type: Boolean, default: false}//네비게이션
    }),
    comments : String,//성능·상태 점검자
    issueDate : Date,//서명 날짜
    inspNm : String,//중고자동차 성능 · 상태 점검자
    noticeNm : String//중고자동차 성능 · 상태 고지자
  },
  outer : Object({
    //외판 부위의 판금, 용접수리, 교환 및 부식
    hood : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//1. 후드
    frontFenderLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//2. 프론트 휀더(좌)
    frontFenderRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//3. 프론트 휀더(우)
    frontDoorLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//4. 프론트 도어(좌)
    frontDoorRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//5. 프론트 도어(우)
    rearDoorLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//6. 리어 도어(좌)
    rearDoorRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//7. 리어 도어(우)
    trunkLead : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//8. 트렁크리드
    radiatorSupport : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//9. 라디에이터 서포트(볼트체결부품)
    roofPanel : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//10. 루프 패널
    quarterPanelLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//11. 쿼터 패널(좌)
    quarterPanelRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//12. 쿼터 패널(우)
    sideSillPanelLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//13. 사이드실 패널(좌)
    sideSillPanelRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//14. 사이드실 패널(우)
    //주요 골격 부위의 판금, 용접수리, 교환 및 부식
    frontPanel : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//1. 프론트 패널
    crossMember : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//2.크로스 멤버
    insidePanelLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//3. 인사이드 패널(좌)
    insidePanelRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//4. 인사이드 패널(우)
    rearPanel : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//5. 리어 패널
    trunkFloor : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//6. 트렁크 플로어
    frontSideMemberLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//7. 프론트 사이드 멤버(좌)
    frontSideMemberRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//8. 프론트 사이드 멤버(우)
    rearSideMemberLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//9. 리어 사이드 멤버(좌)
    rearSideMemberRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//10. 리어 사이드 멤버(우)
    frontWheelHouseLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//11. 프론트 휠하우스(좌)
    frontWheelHouseRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//12. 프론트 휠하우스(우)
    rearWheelHouseLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//13. 리어 휠하우스(좌)
    rearWheelHouseRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//14. 리어 휠하우스(우)
    pillarPanelFrontLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//15. 필러 패널A(좌)
    pillarPanelFrontRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//16. 필러 패널A(우)
    pillarPanelMiddleLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//17. 필러 패널B(좌)
    pillarPanelMiddleRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//18. 필러 패널B(우)
    pillarPanelRearLeft : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//19. 필러 패널C(좌)
    pillarPanelRearRight : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//20. 필러 패널C(우)
    packageTray : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//21. 패키지트레이
    dashPanel : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean}),//22. 대쉬 패널
    floorPanel : Object({chg : Boolean, met : Boolean, scr : Boolean, une : Boolean, cor : Boolean, dam : Boolean, active : Boolean})//23. 플로어 패널(바닥)
  }),
  priceMaster : Object({
    association : String,//최종 가격조사 · 산정 금액 option
    priceCondition : Number,//가격산정 기준가격
    totalPrice : Number,//최종 가격조사 · 산정 금액
    priceComments : String,//가격·조사 산정자
    priceNm : String//중고자동차 가격조사 · 산정자
  }),
  priceDetail : Object({
    boardState : {price : Number,desc : String},//주행거리 계기상태 산정액, 특기사항
    mileage : {price : Number, desc : String},//현재 주행거리 산정액, 특기사항
    carState : {price : Number, desc : String},//차대번호 표기 산정액, 특기사항
    exhaustGas : {price : Number, desc : String},//배출가스 산정액, 특기사항
    tuning : {price : Number, desc : String},//튜닝 산정액, 특기사항
    serious : {price : Number, desc : String},//특별이력 산정액, 특기사항
    usageChange : {price : Number, desc : String},//용도변경 산정액, 특기사항
    color : {price : Number, desc : String},//색상 산정액, 특기사항
    mainOptions : {price : Number, desc : String},//주요옵션 산정액, 특기사항
    exterior1rank : {price : Number, desc : String},//외판부위 1랭크 산정액, 특기사항
    exterior2rank : {price : Number, desc : String},//외판부위 2랭크 산정액, 특기사항
    mainFramework : {price : Number, desc : String},//주요골격 산정액, 특기사항
    selfCheck : {price : Number, desc : String},//자기진단, 원동기 산정액, 특기사항
    selfCheckTransmission : {desc : String},//자기진단, 변속기 특기사항
    motor : {price : Number, desc : String},//원동기, 작동상태(공회전) 산정액, 특기사항
    motorOilLeakLockerArmCover : {desc : String},//원동기, 오일누유, 로커암 커버 특기사항
    motorOilLeakCylinderHeaderGasket : {desc : String},//원동기, 오일누유, 실린더 헤더/가스켓 특기사항
    motorOilLeakOilFan : {desc : String},//원동기, 오일누유, 오일팬 특기사항
    motorOilFlowRate : {desc : String},//원동기, 오일유량 특기사항
    motorWaterLeakCylinderHeaderGasket : {desc : String},//원동기, 냉각수 누수, 실린더 헤드/가스켓 특기사항
    motorWaterLeakPump : {desc : String},//원동기, 냉각수 누수, 워터펌프 특기사항
    motorWaterLeakRadiator : {desc : String},//원동기, 냉각수 누수, 라디에이터 특기사항
    motorWaterLeakCoolingRate : {desc : String},//원동기, 냉각수 누수, 냉각수 수량 특기사항
    trans : {price : Number},//변속기 산정액
    transAutoOilLeakage : {desc : String},//변속기, 자동변속기(A/T), 오일누유 특기사항
    transAutoOilFlowAndCondition : {desc : String},//변속기, 자동변속기(A/T), 오일유량 및 상태 특기사항
    transAutoStatus : {desc : String},//변속기, 자동변속기(A/T), 작동상태(공회전) 특기사항
    transManualOilLeakage : {desc : String},//변속기, 수동변속기(M/T), 오일누유 특기사항
    transManualMission : {desc : String},//변속기, 수동변속기(M/T), 기어변속장치 특기사항
    transManualOilFlowAndCondition : {desc : String},//변속기, 수동변속기(M/T), 오일유량 및 상태 특기사항
    transManualStatus : {desc : String},//변속기, 수동변속기(M/T), 작동상태(공회전) 특기사항
    power : {price : Number},//동력전달 산정액
    powerClutchAssembly : {desc : String},//동력전달, 클러치 어셈블리 특기사항
    powerConstantVelocityJoint : {desc : String},//동력전달, 등속죠인트 특기사항
    powerWeightedShaftAndBearing : {desc : String},//동력전달, 추진축 및 베어링 특기사항
    steering : {price : Number},//조향 산정액
    steeringPowerOilLeakage : {desc : String},//조향, 동력조향 작동 오일누유 특기사항
    steeringGear : {desc : String},//조향, 작동상태, 스티어링 기어 특기사항
    steeringPump : {desc : String},//조향, 작동상태, 스티어링 펌프 특기사항
    steeringTieRodEndAndBallJoint : {desc : String},//조향, 작동상태, 타이로드엔드 및 볼죠인트 특기사항
    brake : {price : Number},//제동 산정액
    brakeMasterCylinderOilLeakage : {desc : String},//제동, 브레이크 마스터 실린더오일 누유 특기사항
    brakeOilLeakage : {desc : String},//제동, 브레이크오일 누유 특기사항
    brakeSystemStatus : {desc : String},//제동, 배력장치 상태 특기사항
    electric : {price : Number},//전기 산정액
    electricGeneratorOutput : {desc : String},//전기, 발전기 출력 특기사항
    electricStarterMotor : {desc : String},//전기, 시동모터 특기사항
    electricWiperMotorFunction : {desc : String},//전기, 와이퍼 모터기능 특기사항
    electricIndoorBlowerMotor : {desc : String},//전기, 실내송풍 모터 특기사항
    electricRadiatorFanMotor : {desc : String},//전기, 라디에이터 팬 모터 특기사항
    electricWindowMotor : {desc : String},//전기, 윈도우 모터 작동 특기사항
    other : {price : Number},//기타, 연료누출(LP가스 포함) 산정액
    otherFuelLeaks : {desc : String},//기타, 연료누출(LP가스 포함) 특기사항
    etc : {price : Number}//자동차 기타정보 산정액
  }),
  inner : Object({
    selfCheckMotor : String,//자기진단, 원동기
    selfCheckTransmission : String,//자기진단, 변속기
    motorOperationStatus : String,//원동기, 작동상태(공회전)
    motorOilLeakLockerArmCover : String,//원동기, 오일누유, 로커암 커버
    motorOilLeakCylinderHeaderGasket : String,//원동기, 오일누유, 실린더 헤더/가스켓
    motorOilLeakOilFan : String,//원동기, 오일누유, 오일팬
    motorOilFlowRate : String,//원동기, 오일유량
    motorWaterLeakCylinderHeaderGasket : String,//원동기, 냉각수 누수, 실린더 헤드/가스켓
    motorWaterLeakPump : String,//원동기, 냉각수 누수, 워터펌프
    motorWaterLeakRadiator : String,//원동기, 냉각수 누수, 라디에이터
    motorWaterLeakCoolingRate : String,//원동기, 냉각수 누수, 냉각수 수량
    transAutoOilLeakage : String,//변속기, 자동변속기(A/T), 오일누유
    transAutoOilFlowAndCondition : String,//변속기, 자동변속기(A/T), 오일유량 및 상태
    transAutoStatus : String,//변속기, 자동변속기(A/T), 작동상태(공회전)
    transManualOilLeakage : String,//변속기, 수동변속기(M/T), 오일누유
    transManualMission : String,//변속기, 수동변속기(M/T), 기어변속장치
    transManualOilFlowAndCondition : String,//변속기, 수동변속기(M/T), 오일유량 및 상태
    transManualStatus : String,//변속기, 수동변속기(M/T), 작동상태(공회전)
    powerClutchAssembly : String,//동력전달, 클러치 어셈블리
    powerConstantVelocityJoint : String,//동력전달, 등속죠인트
    powerWeightedShaftAndBearing : String,//동력전달, 추진축 및 베어링
    steeringPowerOilLeakage : String,//조향, 동력조향 작동 오일누유
    steeringGear : String,//조향, 작동상태, 스티어링 기어
    steeringPump : String,//조향, 작동상태, 스티어링 펌프
    steeringTieRodEndAndBallJoint : String,//조향, 작동상태, 타이로드엔드 및 볼죠인트
    brakeMasterCylinderOilLeakage : String,//제동, 브레이크 마스터 실린더오일 누유
    brakeOilLeakage : String,//제동, 브레이크오일 누유
    brakeSystemStatus : String,//제동, 배력장치 상태
    electricGeneratorOutput : String,//전기, 발전기 출력
    electricStarterMotor : String,//전기, 시동모터
    electricWiperMotorFunction : String,//기타, 와이퍼 모터기능
    electricIndoorBlowerMotor : String,//전기, 실내송풍 모터
    electricRadiatorFanMotor : String,//전기, 라디에이터 팬 모터
    electricWindowMotor : String,//전기, 윈도우 모터 작동
    otherFuelLeaks : String//전기, 연료누출(LP가스 포함)
  }),
  //자동차 기타정보
  etc : Object({
    exterior : String,//수리필요, 외장
    builtIn : String,//수리필요, 내장
    polish : String,//수리필요, 광택
    roomCleaning : String,//수리필요, 룸 크리닝
    wheel : String,//수리필요, 휠
    wheelOptions : {//수리필요, 휠 checkbox options
      frontDriverSeat : {type: Boolean, default: false},//운전석, 전
      rearDriverSeat : {type: Boolean, default: false},//운전석, 후
      frontPassengerSeat : {type: Boolean, default: false},//동반석, 전
      rearPassengerSeat : {type: Boolean, default: false},//동반석, 후
      emergency : {type: Boolean, default: false}//응급
    },
    tire : String,//수리필요, 타이어
    tireOptions : {//수리필요, 타이어 checkbox options
      frontDriverSeat : {type: Boolean, default: false},//운전석, 전
      rearDriverSeat : {type: Boolean, default: false},//운전석, 후
      frontPassengerSeat : {type: Boolean, default: false},//동반석, 전
      rearPassengerSeat : {type: Boolean, default: false},//동반석, 후
      emergency : {type: Boolean, default: false},//응급
    },
    glass : String,//수리필요, 유리
    basicItems : String,//기본품목, 보유상태
    basicItemsOptions : {//기본품목, 보유상태 checkbox options
      manual : {type: Boolean, default: false},//기본품목, 사용설명서
      tripod : {type: Boolean, default: false},//기본품목, 안전삼각대
      jack : {type: Boolean, default: false},//기본품목, 잭
      spanner : {type: Boolean, default: false}//기본품목, 스패너
    }
  }),
  files : Object({//점검사진
    front : Object({ name : String, url : String}),
    back : Object({ name : String, url : String})
  }),
  regDate: {type: Date, default: Date.now},
  modDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Perform', PerformSchema);
