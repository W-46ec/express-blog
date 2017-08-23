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

router.get('/*', function(req, res, next){
	if(check.checkBody(req.body)){
		next();
	} else {
		res.status(500);
		res.render('msg', {
			title: 'Error', 
			text: 'Error!', 
			path: '/users/login.html'
		});
	}
});

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
			res.render('msg', {
				title: 'Wrong', 
				text: 'Username does not exist!', 
				path: '/users/login.html'
			});
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
				res.render('msg', {
					title: 'Success', 
					text: 'Welcome!', 
					path: '/lists'
				});
			} else {
				res.render('msg', {
					title: 'Wrong', 
					text: 'Wrong password!', 
					path: '/users/login.html'
				});
			}
		}
	});
});

//注销操作
router.get('/logout', function(req, res, next) {
	res.clearCookie('auth');
	res.clearCookie('username');
	res.redirect('/lists');
});

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
					if(check.isValid(result)){
						auth.cookies(req, res, req.body);
						res.render('msg', {
							title: 'Success', 
							text: 'Success!', 
							path: '/lists'
						});
					} else {
						message.dbError(res);
					}
				});
			} else {
				res.render('msg', {
					title: 'Wrong', 
					text: 'Please reconfirm your password!', 
					path: '/users/register.html'
				});
			}
		} else {
			res.render('msg', {
				title: 'Wrong', 
				text: 'Username has already exist!', 
				path: '/users/register.html'
			});
		}
	});
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

//新增博客页面
router.get('/new.html', function(req, res, next) {
	res.render('new');
});

//新增博客操作
router.post('/new', function(req, res, next){
	if(req.body.title.trim().length === 0 || req.body.content.trim().length === 0){
		res.render('msg', {
			title: 'Wrong', 
			text: 'Title and content cannot be empty!', 
			path: '/users/new.html'
		});
	} else {
		mdb.addBlog(req, function(err, result){
			if(err){
				message.dbError(res);
				return;
			}
			if(check.isValid(result)){
				res.render('msg', {
					title: 'Success', 
					text: 'Success!', 
					path: '/lists'
				});
			} else {
				res.status(500);
				res.render('msg', {
					title: 'Error', 
					text: 'Error!', 
					path: '/lists'
				});
			}
		});
	}
});

//编辑博客页面
router.get('/edit.html', function(req, res, next) {
	mdb.blogDetail(req.query.id, function(err, result){
		if(err){
			message.dbError(res);
			return;
		}
		if(check.isValid(result)){
			if(check.checkAuthor(req, result)){
				var title = result[0].title;
				var content = result[0].content;
				var page = req.query.page;
				var id = req.query.id;
				res.render('edit', {
					title: title, 
					content: content, 
					page: page, 
					id: id
				});
			} else {
				res.render('msg', {
					title: 'Access denied', 
					text: 'Access denied!', 
					path: '/lists'
				});
			}
		} else {
			message.error404(res);
		}
	});
});

//编辑博客操作
router.post('/edit', function(req, res, next){
	mdb.blogDetail(req.query.id, function(err, result){
		if(err){
			message.dbError(res);
			return;
		}
		if(check.isValid(result)){
			if(check.checkAuthor(req, result)){
				mdb.updateBlog(req.query.id, req.body, function(err, result2){
					if(err){
						message.dbError(res);
						return;
					}
					if(check.isValid(result2)){
						res.render('msg', {
							title: 'Success', 
							text: 'Success!', 
							path: '/lists'
						});
					} else {
						message.dbError(res);
					}
				});
			} else {
				res.render('msg', {
					title: 'Access denied', 
					text: 'Access denied!', 
					path: '/lists'
				});
			}
		} else {
			message.error404(res);
		}
	});
});

//删除博客操作
router.get('/delete', function(req, res, next){
	mdb.blogDetail(req.query.id, function(err, result){
		if(err){
			message.dbError(res);
			return;
		}
		if(check.isValid(result)){
			if(check.checkAuthor(req, result)){
				mdb.deleteBlog(req.query.id, function(err, result2){
					if(err){
						message.dbError(res);
						return;
					}
					if(check.isValid(result2)){
						res.render('msg', {
							title: 'Success', 
							text: 'Success!', 
							path: '/lists'
						});
					} else {
						message.dbError(res);
					}
				});
			} else {
				res.render('msg', {
					title: 'Access denied', 
					text: 'Access denied!', 
					path: '/lists'
				});
			}
		} else {
			message.error404(res);
		}
	});
});

module.exports = router;