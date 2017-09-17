var express = require('express');
var path = require('path');
var sha256 = require('sha256');
var crypto = require('crypto');

var mdb = require('../tools/db.js');
var auth = require('../tools/auth.js');
var check = require('../tools/check.js');
var message = require('../tools/msg.js');

var router = express.Router();

//个人信息页面
router.get('/profile', function(req, res, next) {
	mdb.getProfile(req.cookies.username, function(err, result){
		if(err){
			message.dbError(res);
			return;
		}
		if(check.isValid(result)){
			res.render('profile', {
				username: req.cookies.username,
				result: result[0]
			});
		} else {
			message.error404(res);
		}
	});
});

//个人信息页面-只读
router.get('/profiles', function(req, res, next) {
	mdb.getProfile(req.query.username, function(err, result){
		if(err){
			message.dbError(res);
			return;
		}
		if(check.isValid(result)){
			res.render('profile_readonly', {
				username: req.query.username,
				result: result[0]
			});
		} else {
			message.error404(res);
		}
	});
});

router.post('/save', function(req, res, next) {
	mdb.getProfile(req.cookies.username, function(err, result){
		if(err){
			message.dbError(res);
			return;
		}
		if(check.isValid(result)){
			if(check.checkAuthor(req, result)){
				mdb.updateProfile(req.cookies.username, req.body, function(err, result2){
					if(err){
						message.dbError(res);
						return;
					}
					if(check.isValid(result2)){
						message.succMsg(res);
					} else {
						message.dbError(res);
					}
				});
			} else {
				message.accessDeniedMsg(res);
			}
		} else {
			message.error404(res);
		}
	});
});

module.exports = router;