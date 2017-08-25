var mdb = require('../tools/db.js');
var auth = require('../tools/auth.js');

var limitLists = mdb.limitLists;

//检测请求是否合法
var checkBody = function(body){
	if(body === undefined){
		return false;
	} else {
		return true;
	}
}

//检测首页page参数是否合法
var checkPageIsLegal = function(page){
	if(typeof(page) === 'undefined'){
		return false;
	} else if(page.length === 0){
		return false;
	} else if(isNaN(parseInt(page))){
		return false;
	} else if(page === '0'){
		return false;
	} else {
		return true;
	}
}

//检测下一页
var checkNextPage = function(res, req, result, callback){
	if(isValid(result) === 0){
		res.redirect("/lists?page=1");
	} else if(isValid(result) >= limitLists) {
		callback();
	} else if(isValid(result) < limitLists){
		var page = parseInt(req.query.page);
		var loginStat,loginUrl,loginLogoClass;
		if(isLogin(req)){
			loginUrl = "/users/logout";
			loginStat = req.cookies.username;
			loginLogoClass = '<i class="fa fa-sign-out fa-stack-1x fa-inverse"></i>';
		} else {
			loginUrl = "/users/login.html";
			loginStat = "个人主页";
			loginLogoClass = '<i class="fa fa-user-circle-o fa-stack-1x fa-inverse"></i>';
		}
		res.render('lists', {
			lists: result, 
			page: page, 
			num: 0, 
			loginStat: loginStat, 
			loginUrl: loginUrl,
			loginLogoClass: loginLogoClass
		});
	}
}

//检测查询结果
var isValid = function(result){
	if(result === undefined){
		return false;
	} else {
		if(Object.keys(result).length === 0){
			return 0;
		} else {
			return Object.keys(result).length;
		}
	}
}

//登陆检测
var isLogin = function(req){
	if((auth.authorizations.some(e => e.username === req.cookies.username))
	 && (auth.authorizations.some(e => e.auth === req.cookies.auth))){
		return true;
	} else {
		return false;
	}
}

//用户身份检测
var checkAuthor = function(req, result){
	if(req.cookies.username === result[0].username){
		return true;
	} else {
		return false;
	}
}

module.exports = {
	checkBody: checkBody,
	checkPageIsLegal: checkPageIsLegal,
	isValid: isValid,
	checkNextPage: checkNextPage,
	isLogin: isLogin,
	checkAuthor: checkAuthor
}