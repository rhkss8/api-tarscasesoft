/**
 * Created by tarscase-soft on 2017. 11. 13..
 * 기본 변수 모음
 */
module.exports = {
  user: {name: 1, phone: 1, photo: 1, company: 1, _id : 1},
  product: {
    _id : 1,
    uid: 1,
    car_num: 1,
    category: 1,
    city: 1,
    name: 1,
    year: 1,
    month: 1,
    mission: 1,
    fuel: 1,
    color: 1,
    distance: 1,
    cc: 1,
    model_type: 1,
    sale_type: 1,
    options: 1,
    price: 1,
    photo: 1,
    performance_log: 1,
    insurance_log: 1,
    desc: 1,
    video_url: 1,
    tag: 1,
    status: 1,
    reject: 1,
    status_update_uid: 1,
    expDate: 1,
    regDate: 1,
    modDate: 1,
    updater: {name: 1, phone: 1, photo: 1, company: 1, _id : 1},
    writer: {name: 1, phone: 1, photo: 1, company: 1, review : 1, _id : 1}
  },
  board: {
    uid: 1,
    title: 1,
    site: 1,
    category: 1,
    sub_category: 1,
    content: 1,
    mainImage: 1,
    files : 1,
    extra_file : 1,
    views: 1,
    status: 1,
    regDate: 1,
    modDate: 1,
    reply:1,
    writer:1,
    answerable:1,
    attachable:1,
    eventExpireDate:1,
    uWriter: {name: 1, phone: 1, photo: 1, company: 1, _id : 1}
  },
  review: {
    uid: 1,
    did:1,
    title: 1,
    category: 1,
    sub_category: 1,
    content: 1,
    mainImage: 1,
    files : 1,
    extra_file : 1,
    views: 1,
    status: 1,
    regDate: 1,
    modDate: 1,
    reply:1,
    writer:{name: 1, phone: 1, photo: 1, company: 1, _id : 1},
    dealer:{name: 1, phone: 1, photo: 1, company: 1, review : 1, _id : 1},
    user:1
  },
  category : {
    key: 1,
    type: 1,
    made: 1,
    name: 1,
    dept: 1,
    price: 1,
    f_key: 1,
    cc: 1,
    cc_unit: 1,
    brand_name: 1,
    order: 1,
    mechanic: 1,
    year: 1,
    parent_type: 1,
    parent_uid: 1,
    status: 1,
    regDate: 1,
    modDate: 1,
    parent : {name : 1, cc: 1, cc_unit: 1, mechanic: 1, brand_name:1, order:1, _id: 1, regDate: 1}
  },
  event : {
    uid: 1,
    board_id : 1,
    writer : 1,
    content: 1,
    files : 1,
    views: 1,
    status: 1,
    regDate: 1,
    modDate: 1
  },
  multi_cate_group : {
    _id : "$parent.name", items: { $push: "$$ROOT" }
  },
  multi_detail_parent_cate_group : {
    _id : "$parent._id", items: { $push: "$$ROOT" }
  },
  multi_detail_cate_group : {
    _id: {
      _id: "$parent._id",
      name: "$parent.name",
      cc: "$parent.cc",
      cc_unit: "$parent.cc_unit",
      mechanic: "$parent.mechanic"
    },
    regDate: {$first: "$parent.regDate" },
    // parent_info : {
    //   name: "$parent.name",
    //   cc: "$parent.name",
    //   cc_unit: "$parent.cc_unit"
    // },
    items: { $push: "$$ROOT" }
  },
  group: {
    product : {
      _id: "$_id",
      uid: {"$first": "$uid"}
    }
  },
  blog: {
    title: 1
    , content: 1
    , status: 1
    , category: 1
    , mainImage: 1
    , uid: 1
    , tag: 1
    , blogNo: 1
    , regDate: 1
    , reply: 1
    , views: 1
    , writer: {name: 1, email: 1, photo: 1, _id: 1, phone: 1, intro: 1}
    // ,like : 1
  },
  question : {
    list : {
      productId: 1,
      product: 1,
      dealerId : 1,
      content : 1,
      type : 1,
      status: 1,
      regDate: 1,
      modDate: 1,
      ids : 1
    }
  },
  message: {
    project: {
      productId: 1,
      dealer: 1,
      user: 1,
      members: 1,
      regDate: 1,
      modDate: 1,
      messages: 1,
      phone_open : 1,
      userObj: {name: 1, email: 1, photo: 1, _id: 1, phone: 1},
      dealerObj: {name: 1, email: 1, photo: 1, _id: 1, phone: 1,company : {shop_name : 1}},
      product : {
        _id : 1,
        car_num: 1,
        name: 1,
        year: 1,
        month: 1,
        mission: 1,
        fuel: 1,
        distance: 1,
        price: 1,
        photo: 1,
        video_url: 1,
        tag: 1,
        status: 1,
        color: 1,
        cc: 1,
        model_type: 1,
        sale_type: 1,
        options: 1,
        performance_log: 1,
        insurance_log: 1,
        desc: 1,
        regDate: 1,
        modDate: 1
      }
    },
    group: {
      _id: "$_id",
      productId: {"$first": "$productId"},
      dealer: {"$first": "$dealer"},
      user: {"$first": "$user"},
      members: {"$first": "$members"},
      regDate: {"$first": "$regDate"},
      modDate: {"$first": "$modDate"},
      messages: {"$first": "$messages"},
      product: {"$first": "$product"},
      dealerObj: {"$push": "$dealerObj"},
      phone_open: {"$push": "$phone_open"},
      userObj: {"$push": "$userObj"}
    }
  },
  dashboard :{
    message : {
      "_id": 1,
      "productId": 1,
      "members": 1,
      "messages": {
        "_id": 1,
        "roomId": 1,
        "uid": 1,
        "content": 1,
        "read": 1
      }
    }
  },
  sell: {
    name: 1,
    phone: 1,
    car_name: 1,
    distance: 1,
    car_num: 1,
    mainImage: 1,
    agree : 1,
    files : 1,
    extra_file : 1,
    status: 1,
    regDate: 1,
    modDate: 1
  }
};
