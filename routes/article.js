var express = require('express');
var markdown = require('markdown-js');

var check = require('../tools/check.js');
var mdb = require('../tools/db.js');
var message = require('../tools/msg.js');

var mongoClient = mdb.mongoClient;
var DB_CONN_STR = mdb.DB_CONN_STR;
var limitLists = mdb.limitLists;

var router = express.Router();

//文章列表
router.get('/article', function(req, res, next) {
	if(check.checkPageIsLegal(req.query.page)){
		var loginStat,loginUrl;
		if(check.isLogin(req)){
			loginUrl = "/users/logout";
			loginStat = "Logout";
		} else {
			loginUrl = "/users/login.html";
			loginStat = "Login";
		}
		mdb.list({"username": req.cookies.username}, req.query.page, function(err, result){
			if(err){
				message.dbError(res);
				return;
			}
			if(req.query.page === '1' && result.length === 0){
				res.render('article', {
					lists: [],
					page: 1,
					num: 0,
					loginStat: loginStat, 
					loginUrl: loginUrl
				});
				return;
			}
			check.checkArticleNextPage(res, req, result, function(){
				mdb.list({"username": req.cookies.username}, (parseInt(req.query.page) + 1).toString(), function(err, result2){
					if(err){
						message.dbError(res);
						return;
					}
					var page = parseInt(req.query.page);
					res.render('article', {
						lists: result, 
						page: page, 
						num: check.isValid(result2) ? 1 : 0,
						loginStat: loginStat, 
						loginUrl: loginUrl
					});
				});
			});
		});
	} else {
		res.redirect("/users/article?page=1");
	}
});

module.exports = router;