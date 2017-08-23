var express = require('express');
var check = require('../tools/check.js');
var mdb = require('../tools/db.js');

var mongoClient = mdb.mongoClient;
var DB_CONN_STR = mdb.DB_CONN_STR;
var limitLists = mdb.limitLists;

var router = express.Router();

//主页
router.get('/', function(req, res, next) {
	res.redirect('/lists');
});

//主页
router.get('/lists', function(req, res, next) {
	if(check.checkPageIsLegal(req.query.page)){
		var loginStat,loginUrl;
		if(check.isLogin(req)){
			loginUrl = "/users/logout";
			loginStat = req.cookies.username + "	Logout";
		} else {
			loginUrl = "/users/login.html";
			loginStat = "Login";
		}
		mdb.list(req.query.page, function(result){
			if(req.query.page === '1' && result.length === 0){
				res.render('lists', {
					lists: [], 
					page: 1,
					num: 0,
					loginStat: loginStat, 
					loginUrl: loginUrl
				});
				return;
			}
			check.checkNextPage(res, req, result, function(){
				mdb.list((parseInt(req.query.page) + 1).toString(), function(result2){
					var page = parseInt(req.query.page);
					res.render('lists', {
						lists: [], 
						page: page, 
						num: check.isValid(result2) ? 1 : 0,
						loginStat: loginStat, 
						loginUrl: loginUrl
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
	mdb.blogDetail(req.query.id, function(result){
		if(check.isValid(result)){
			res.render('detail', {
				result: result[0],
				page: req.query.page, 
				id: req.query.id
			});
		} else {
			res.status(404);
			res.render('msg', {
				title: 'Error', 
				text: 'Not found!', 
				path: '/lists'
			});
		}
	});
});

module.exports = router;