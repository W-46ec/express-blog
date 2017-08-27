var express = require('express');
var path = require('path');
var sha256 = require('sha256');
var crypto = require('crypto');

var mdb = require('../tools/db.js');
var auth = require('../tools/auth.js');
var check = require('../tools/check.js');
var message = require('../tools/msg.js');

var mongoClient = mdb.mongoClient;
var DB_CONN_STR = mdb.DB_CONN_STR;

var router = express.Router();

//登陆页面
router.get('/', function(req, res, next) {
	res.redirect('/users/login.html');
});

//登陆页面
router.get('/login.html', function(req, res, next) {
	if(check.isLogin(req)){
		res.redirect('/lists');
	} else {
		res.render('login');
	}
});

//登陆操作
router.post('/login', function(req, res, next) {
	mdb.findUser(req.body.username, function(err, result){
		if(err){
			message.dbError(res);
			return;
		}
		if(result.length === 0){
			message.loginMsg(res);
		} else {
			//HMACSHA256方式加盐
			var pwdSalt = crypto.pbkdf2Sync(
				req.body.pwd,
				result[0].salt,
				4096,	//迭代次数
				256,	//生成密码长度
				'sha256'
			).toString('hex');
			if(result[0].pwd === pwdSalt){
				auth.cookies(req, res, req.body);
				message.succMsg(res);
			} else {
				message.loginMsg(res);
			}
		}
	});
});

//注销操作
router.get('/logout', function(req, res, next) {
	for(var i = 0; i < auth.authorizations.length; i++){
		if(auth.authorizations[i].username === req.cookies.username &&
			auth.authorizations[i].auth === req.cookies.auth){
			auth.authorizations.splice(i,1);
			break;
		}
	}
	res.clearCookie('auth');
	res.clearCookie('username');
	res.redirect('/lists');
});

//GET请求登陆检测
router.get('/*', function(req, res, next) {
	if(check.isLogin(req)){
		next();
	} else {
		res.redirect('/users/login.html');
	}
});

//POST请求登陆检测
router.post('/*', function(req, res, next) {
	if(check.isLogin(req)){
		next();
	} else {
		res.redirect('/users/login.html');
	}
});

module.exports = router;