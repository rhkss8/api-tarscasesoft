const fs = require('fs')
// import dateFormat from "dateformat";
//     // dateFormat = require('dateformat'),
//     date = new Date(),
//     today = dateFormat(date, "yyyymmdd");

const dateFormat = require('dateformat'),
  date = new Date(),
  today = dateFormat(date, "yyyymmdd");
const mv = require('mv');
// const iconv  = require('iconv-lite');

function handleError(res, err) {
    console.error('handleError....');
    console.error(err);
    console.error('error code...'+err.code);
    return res.status(400).json({err : {code : err.code||-10002, message : err.message||'INTERVAL_ERROR'}});
}

function isJson(str) {
    try {
        str = JSON.parse(str);
    } catch (e) {
        str = str;
    }
    return str
}
function getNextSequenceValue(DB,sequenceName){

    const sequenceDocument = DB.findAndModify({
        query:{_id: sequenceName },
        update: {$inc:{sequence_value:1}},
        new:true
    });

    return sequenceDocument.sequence_value;
}

function getProductFilePath(req, type, product_id){
    const obj = {};
    const allowedOrigins = ['http://localhost:9020', 'http://localhost:9030'];
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        //if local
        obj.uidPath = 'nasdb/images/' + type + '/';
        obj.newPath = 'nasdb/images/' + type + '/' + today + '/' +  product_id;//for save
        obj.returnPath = 'http://localhost:8080/images/'+ type + '/' + today + '/' + product_id;//for mainImage url
    } else {
        obj.uidPath = '/nasdb/images/' + type + '/';
        obj.newPath = '/nasdb/images/'+type + '/' + today + '/' + product_id ;
        // obj.returnPath = 'images.yeoungcha.com/' + type + '/' + req.body.uid + '/' + today;
        obj.returnPath = 'https://image.yeoungcha.com/' + type + '/' + today + '/' + product_id;
    }

    //if doesn't have directory create directory
    if (!fs.existsSync(obj.uidPath)){
        fs.mkdirSync(obj.uidPath);
    }
    if (!fs.existsSync(obj.uidPath + today)){
        fs.mkdirSync(obj.uidPath + today);
    }
    if (!fs.existsSync(obj.newPath)){
        fs.mkdirSync(obj.newPath);
    }

    return obj;
}

function getFilePath(req, type){
    const obj = {};
    const _body = isJson(req.body.data);
    const _uid = _body.uid.replace(/[~!@\#$%<>^&*\()\-=+_\’"]/gi,'');

    // const origin = req.get('origin');

    const allowedOrigins = ['http://localhost:9000', 'http://localhost:9010'];
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        //if local
        obj.uidPath = 'nasdb/images/' + type + '/';
        obj.newPath = 'nasdb/images/' + type + '/' + _uid + '/' + today ;//for save
        obj.returnPath = 'http://localhost:8080/images/'+ type + '/' + _uid + '/' + today;//for mainImage url
    } else {
        obj.uidPath = '/nasdb/images/' + type + '/';
        obj.newPath = '/nasdb/images/'+type + '/' + _uid + '/' + today ;
        // obj.returnPath = 'images.yeoungcha.com/' + type + '/' + req.body.uid + '/' + today;
        obj.returnPath = 'https://image.yeoungcha.com/' + type + '/' + _uid + '/' + today;
    }

    //if doesn't have directory create directory
    if (!fs.existsSync(obj.uidPath + _uid)){
        fs.mkdirSync(obj.uidPath + _uid);
    }
    if (!fs.existsSync(obj.newPath)){
        fs.mkdirSync(obj.newPath);
    }

    return obj;
}

function fileRename(newName , oldName, callback){
    mv(newName, oldName, function(err){
        callback(err);
    });
}

function fileNameConv(name) {
  name = name.replace(/ /gi, "");
  // iconv.extendNodeEncodings();
  // const strContents = new Buffer(name);
  return name;
}

function emailMasking(email) {

  const len = email.split('@')[0].length - 3;

  return email.replace(new RegExp('.(?=.{0,' + len + '}@)', 'g'), '*');

}

exports.handleError = handleError;
exports.isJson = isJson;
exports.getNextSequenceValue = getNextSequenceValue;
exports.getProductFilePath = getProductFilePath;
exports.getFilePath = getFilePath;
exports.fileRename = fileRename;
exports.fileNameConv = fileNameConv;
exports.emailMasking = emailMasking;
