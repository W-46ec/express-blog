var express = require('express');
var path = require('path');
var sha256 = require('sha256');
var crypto = require('crypto');

var mdb = require('../tools/db.js');
var auth = require('../tools/auth.js');
var check = require('../tools/check.js');
var message = require('../tools/msg.js');

var router = express.Router();

//注册页面
router.get('/register.html', function(req, res, next) {
	res.render('register');
});

//注册操作
router.post('/register', function(req, res, next) {
	mdb.findUser(req.body.username, function(err, result){
		if(err){
			message.dbError(res);
			return;
		}
		if(result.length === 0){
			if(sha256(req.body.pwd) === sha256(req.body.reconfirm)){
				mdb.addUser(req.body, function(err, result){
					if(err){
						message.dbError(res);
						return;
					}
					mdb.updateProfile(req.body.username, {}, function(err, result2){
						if(err){
							message.dbError(res);
							return;
						}
						if(check.isValid(result) &&
							result.result.n === 1 &&
							result2.result.n === 1){
							auth.cookies(req, res, req.body);
							message.succMsg(res);
						} else {
							message.dbError(res);
						}
					});
				});
			} else {
				message.message(
					res, 
					'Wrong',
					'Please confirm your password!',
					'/register.html'
				);
			}
		} else {
			message.message(
				res, 
				'Wrong',
				'Username is already taken!',
				'/register.html'
			);
		}
	});
});

module.exports = router;