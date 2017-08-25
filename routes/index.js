var express = require('express');
var check = require('../tools/check.js');
var mdb = require('../tools/db.js');
var message = require('../tools/msg.js');

var mongoClient = mdb.mongoClient;
var DB_CONN_STR = mdb.DB_CONN_STR;
var limitLists = mdb.limitLists;

var router = express.Router();

//GET请求过滤
router.get('/*', function(req, res, next){
	if(check.checkBody(req.body)){
		next();
	} else {
		message.dbError(res);
	}
});

//POST请求过滤
router.post('/*', function(req, res, next){
	if(check.checkBody(req.body)){
		next();
	} else {
		message.dbError(res);
	}
});

//主页
router.get('/', function(req, res, next) {
	res.redirect('/lists');
});

//主页
router.get('/index.html', function(req, res, next) {
	res.redirect('/lists');
});

//主页
router.get('/lists', function(req, res, next) {
	if(check.checkPageIsLegal(req.query.page)){
		var loginStat,loginUrl,loginLogoClass;
		if(check.isLogin(req)){
			loginUrl = "/users/logout";
			loginStat = req.cookies.username;
			loginLogoClass = '<i class="fa fa-sign-out fa-stack-1x fa-inverse"></i>';
		} else {
			loginUrl = "/users/login.html";
			loginStat = "个人主页";
			loginLogoClass = '<i class="fa fa-user-circle-o fa-stack-1x fa-inverse"></i>';
		}
		mdb.list(req.query.page, function(err, result){
			if(err){
				message.dbError(res);
				return;
			}
			if(req.query.page === '1' && result.length === 0){
				res.render('lists', {
					lists: [],
					page: 1,
					num: 0,
					loginStat: loginStat, 
					loginUrl: loginUrl,
					loginLogoClass: loginLogoClass
				});
				return;
			}
			check.checkNextPage(res, req, result, function(){
				mdb.list((parseInt(req.query.page) + 1).toString(), function(err, result2){
					if(err){
						message.dbError(res);
						return;
					}
					var page = parseInt(req.query.page);
					res.render('lists', {
						lists: result, 
						page: page, 
						num: check.isValid(result2) ? 1 : 0,
						loginStat: loginStat, 
						loginUrl: loginUrl,
						loginLogoClass: loginLogoClass
					});
				});
			});
		});
	} else {
		res.redirect("/lists?page=1");
	}
});

//博客详情页
router.get('/detail', function(req, res, next) {
	mdb.blogDetail(req.query.id, function(err, result){
		if(err){
			message.dbError(res);
			return;
		}
		if(check.isValid(result)){
			var loginStat,loginUrl,loginLogoClass;
			if(check.isLogin(req)){
				loginUrl = "/users/logout";
				loginStat = req.cookies.username;
				loginLogoClass = '<i class="fa fa-sign-out fa-stack-1x fa-inverse"></i>';
			} else {
				loginUrl = "/users/login.html";
				loginStat = "个人主页";
				loginLogoClass = '<i class="fa fa-user-circle-o fa-stack-1x fa-inverse"></i>';
			}
			res.render('detail', {
				loginStat: loginStat,
				loginUrl: loginUrl,
				loginLogoClass: loginLogoClass,
				result: result[0],
				page: check.checkPageIsLegal(req.query.page) ? 
				req.query.page : '1',
				id: req.query.id
			});
		} else {
			message.error404(res);
		}
	});
});

module.exports = router;