var express = require('express');
var path = require('path');
var sha256 = require('sha256');
var crypto = require('crypto');
var uuid = require('uuid');

var mdb = require('../tools/db.js');
var auth = require('../tools/auth.js');
var check = require('../tools/check.js');
var message = require('../tools/msg.js');

var mongoClient = mdb.mongoClient;
var DB_CONN_STR = mdb.DB_CONN_STR;

var router = express.Router();

//修改密码页面
router.get('/reset', function(req, res, next) {
	res.render('changepwd', {
		username: req.cookies.username
	});
});

router.post('/reset', function(req, res, next) {
	if(sha256(req.body.pwd) === sha256(req.body.confirmpwd)){
		mdb.findUser(req.cookies.username, function(err, result){
			if(err){
				message.dbError(res);
				return;
			}
			if(result.length === 0){
				message.dbError(res);
			} else {
				var pwdSalt = crypto.pbkdf2Sync(
					req.body.oldpwd,
					result[0].salt,
					4096,
					256,
					'sha256'
				).toString('hex');
				if(result[0].pwd === pwdSalt){
					mdb.changepwd({
						username: req.cookies.username, 
						salt: sha256(uuid.v4()),
						pwd: req.body.pwd
					}, function(err, result2){
						if(err){
							message.dbError(res);
							return;
						}
						if(check.isValid(result2) &&
							result2.result.nModified === 1){
							for(var i = 0; i < auth.authorizations.length; i++){
								if(auth.authorizations[i].username === req.cookies.username &&
									auth.authorizations[i].auth === req.cookies.auth){
									auth.authorizations.splice(i,1);
									break;
								}
							}
							res.clearCookie('auth');
							res.clearCookie('username');
							message.succMsg(res);
						} else {
							message.dbError(res);
						}
					});
				} else {
					message.message(
						res,
						"Wrong",
						"Sorry!Password is not correct!",
						'/users/password/reset'
					);
				}
			}
		});
	} else {
		message.message(
			res, 
			'Wrong',
			'Please confirm your password!',
			'/users/password/reset'
		);
	}
});

module.exports = router;