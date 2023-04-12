/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var mail = require('../../../config/mail/mailsender');
var Utils = require('../../../config/utils');
var request = require('request');
var cheerio = require('cheerio');

exports.index = function (req, res) {

  // mail.sendMailToHtml(url , mail , parent, children);
  mail.sendMailToHtml('https://m.yeoungcha.com' , 'rhkss8@nate.com' , {title : '영차 인증메일'}, function (err, result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data : result});
  });

};

exports.crwaling = function (req, res) {

  var options = {

    encoding: "utf-8",

    method: "POST",
    formData : {
      id : '3705003084',
      number : '48어5519'
    },

    url: "https://www.kaiwa.org/inspection/search"

  };

  request(options, function(err,result,html){

    var $ = cheerio.load(html,{xml: {
      normalizeWhitespace: true
    }});

    // console.log($)
    // var div = $('#wrap');
    // console.log(div)

    // console.log($('#wrap'))
    // console.log($('#sub-header'))

    // $('#wrap').each(function(){
    //   console.log("wrap : " + $(this));
    // });

    return res.status(200).json({data : html});

  });

};
