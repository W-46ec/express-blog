var express = require('express');
var path = require('path');
var sha256 = require('sha256');

var mdb = require('../tools/db.js');
var auth = require('../tools/auth.js')
var check = require('../tools/check.js')

var mongoClient = mdb.mongoClient;
var DB_CONN_STR = mdb.DB_CONN_STR;

var router = express.Router();

/* GET users listing. */
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

router.get('/login.html', function(req, res, next) {
	if(check.isLogin(req)){
		res.redirect('/lists');
	} else {
		res.render('login');
	}
});

router.get('/register.html', function(req, res, next) {
	res.render('register');
});

router.get('/new.html', function(req, res, next) {
	if(check.isLogin(req)){
		res.render('new');
	} else {
		res.redirect("/users/login.html");
	}
});

router.get('/edit.html', function(req, res, next) {
	if(check.isLogin(req)){
		mdb.blogDetail(req.query.id, function(result){
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
				res.status(404);
				res.render('msg', {
					title: 'Error', 
					text: 'Not found!', 
					path: '/lists'
				});
			}
		});
	} else {
		res.redirect("/users/login.html");
	}
});

router.post('/edit', function(req, res, next){
	if(check.isLogin(req)){
		mdb.blogDetail(req.query.id, function(result){
			if(check.isValid(result)){
				if(check.checkAuthor(req, result)){
					mdb.updateBlog(req.query.id, req.body, function(result2){
						if(check.isValid(result2)){
							res.render('msg', {
								title: 'Success', 
								text: 'Success!', 
								path: '/lists'
							});
						} else {
							console.log(typeof result2);
							res.status(500);
							res.render('msg', {
								title: 'Error', 
								text: 'Error!', 
								path: '/lists'
							});
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
				res.status(404);
				res.render('msg', {
					title: 'Error', 
					text: 'Not found!', 
					path: '/lists'
				});
			}
		});
	} else {
		res.redirect("/users/login.html");
	}
});

router.get('/delete', function(req, res, next){
	if(check.isLogin(req)){
		mdb.blogDetail(req.query.id, function(result){
			if(check.isValid(result)){
				if(check.checkAuthor(req, result)){
					mdb.deleteBlog(req.query.id, function(result2){
						if(check.isValid(result2)){
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
				} else {
					res.render('msg', {
						title: 'Access denied', 
						text: 'Access denied!', 
						path: '/lists'
					});
				}
			} else {
				res.status(404);
				res.render('msg', {
					title: 'Error', 
					text: 'Not found!', 
					path: '/lists'
				});
			}
		});
	} else {
		res.redirect("/users/login.html");
	}
});

router.get('/logout', function(req, res, next) {
	res.clearCookie('auth');
	res.clearCookie('username');
	res.redirect('/lists');
});

router.post('/login', function(req, res, next) {
	mdb.findUser(req.body.username, function(result){
		if(result.length === 0){
			res.render('msg', {
				title: 'Wrong', 
				text: 'Username does not exist!', 
				path: '/users/login.html'
			});
		} else {
			var pwdSalt = sha256(req.body.pwd + result[0].salt);
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

router.post('/register', function(req, res, next) {
	mdb.findUser(req.body.username, function(result){
		if(result.length === 0){
			if(sha256(req.body.pwd) === sha256(req.body.reconfirm)){
				mdb.addUser(req.body, function(result){
					if(check.isValid(result)){
						auth.cookies(req, res, req.body);
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

router.post('/new', function(req, res, next){
	if(check.isLogin(req)){
		if(req.body.title.trim().length === 0 || req.body.content.trim().length === 0){
			res.render('msg', {
				title: 'Wrong', 
				text: 'Title and content cannot be empty!', 
				path: '/users/new.html'
			});
		} else {
			mdb.addBlog(req, function(result){
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
	} else {
		res.redirect("/users/login.html");
	}
});

module.exports = router;