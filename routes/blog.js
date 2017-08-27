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

//新增博客页面
router.get('/new.html', function(req, res, next) {
	var loginStat,loginUrl;
	if(check.isLogin(req)){
		loginUrl = "/users/logout";
		loginStat = "Logout";
	} else {
		loginUrl = "/users/login.html";
		loginStat = "Login";
	}
	res.render('new', {
		loginStat: loginStat, 
		loginUrl: loginUrl
	});
});

//新增博客操作
router.post('/new', function(req, res, next){
	if(req.body.title.trim().length === 0 || req.body.content.trim().length === 0){
		message.message(
			res, 
			'Sorry',
			'Title and content should not be empty!',
			'/users/blog/new.html'
		);
	} else {
		mdb.addBlog(req, function(err, result){
			if(err){
				message.dbError(res);
				return;
			}
			if(check.isValid(result) &&
				result.result.n === 1){
				message.succMsg(res);
			} else {
				message.dbError(res);
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
				var loginStat,loginUrl;
				if(check.isLogin(req)){
					loginUrl = "/users/logout";
					loginStat = "Logout";
				} else {
					loginUrl = "/users/login.html";
					loginStat = "Login";
				}
				var title = result[0].title;
				var content = result[0].content;
				var id = req.query.id;
				res.render('edit', {
					loginStat: loginStat,
					loginUrl: loginUrl,
					title: title, 
					content: content,
					id: id
				});
			} else {
				message.accessDeniedMsg(res);
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
					if(check.isValid(result2) &&
						result2.result.nModified === 1){
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
					if(check.isValid(result2) &&
						result2.result.n === 1){
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