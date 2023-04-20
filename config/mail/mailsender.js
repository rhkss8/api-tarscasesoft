/**
 * Created by tarscase-soft on 2016. 11. 4..
 */
const nodeMailer = require('nodemailer');
const _smtpTransport = require("nodemailer-smtp-transport");

const smtpTransport = nodeMailer.createTransport(_smtpTransport({
  host: 'smtp.worksmobile.com',
  secureConnection: true,
  port: 465,
  auth: {
    user: "service@yeoungcha.com",
    pass: "xktmzpdltm1!"
  }
}));


exports.sendMailToHtml = function (url, mail, parent, callback) {

  const mailOptions = {
    from: '영차 <service@yeoungcha.com>',
    to: mail,
    subject: parent.title + '글에 답변이 등록되었습니다.',
    html: '<p style="font-size: 15px;font-weight: 600;">반갑습니다 빌딩블로그입니다.</p>' +
    '<p style="font-weight: 500;">Q.' + parent.title + '</p>' +
    '<p style="font-size: 13px">질문에 대한 답변이 등록되었습니다.</p>' +
    '<p><a target="_blank" href="' + url + '" style="font-size: 13px">답변 확인하러가기</a></p>' +
    '<br>' +
    '<br>' +
    '<hr>' +
    '<img src="https://image.yeoungcha.com/logo.png">' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 10pt;"><br></span></p>' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 10pt;">영차 - 중고차도 이젠 영상으로 보고,듣고 확인하세요</span>&nbsp;</p>' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 9pt;">업체명 : 타스케이스 | 담당자 : 김창열</span></p>' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 9pt;">home-page :&nbsp;</span><a href="https://yeoungcha.com" target="_blank" style="cursor: pointer; white-space: pre;"><span style="font-size: 9pt;">http://bd2blog.com</span></a>&nbsp;</p>' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 9pt;">e-mail : service@yeoungcha.com</span></p>'
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {

    if (error) {
      console.log(error);
    } else {
      console.log("Message sent : " + response.message);
    }
    smtpTransport.close();
    callback(error, response);
  });
};

exports.rePasswordToMail = function (mail, user, repass, callback) {

  if (!callback) callback = function () {
  };

  const mailOptions = {
    from: '영차 <service@yeoungcha.com>',
    to: mail,
    subject: '영차 임시 비빌번호가 발급되었습니다.',
    html: '<h4>' + user.name + '님의 임시비밀번호가 발급되었습니다</h4>' +
    '<p style="font-size: 13px">임시 비밀번호 : ' + repass + '</p>' +
    '<p style="font-size: 13px; color: #ff0000;">* 로그인 후 비밀번호를 재설정해주세요 </p>' +
    '<br>' +
    '<br>' +
    '<hr>' +
    '<img src="https://image.yeoungcha.com/logo.png">' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 10pt;"><br></span></p>' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 10pt;">영차 - 중고차도 이젠 영상으로 보고,듣고 확인하세요</span>&nbsp;</p>' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 9pt;">업체명 : 타스케이스 | 담당자 : 김창열</span></p>' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 9pt;">home-page :&nbsp;</span><a href="https://yeoungcha.com" target="_blank" style="cursor: pointer; white-space: pre;"><span style="font-size: 9pt;">https://yeoungcha.com</span></a>&nbsp;</p>' +
    '<p style="font-size: 13px; margin: 0;"><span style="font-size: 9pt;">e-mail : service@yeoungcha.com</span></p>'
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {

    if (error) {
      console.log(error);
    } else {
      console.log("Message sent : " + response);
    }
    smtpTransport.close();
    callback(error, response);
  });
};

