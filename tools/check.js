var mdb = require('../tools/db.js');

var limitLists = mdb.limitLists;

var checkBody = function(body){
	if(body === 'undefined'){
		return false;
	} else {
		return true;
	}
}

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

var checkNextPage = function(res, req, result, callback){
	if(isValid(result) === 0){
		res.redirect("/lists?page=1");
	} else if(isValid(result) >= limitLists) {
		callback();
	} else if(isValid(result) < limitLists){
		var page = parseInt(req.query.page);
		var loginStat,loginUrl;
		if(isLogin(req)){
			loginUrl = "/users/logout";
			loginStat = req.cookies.username + "	Logout";
		} else {
			loginUrl = "/users/login.html";
			loginStat = "Login";
		}
		res.render('lists', {
			lists: result, 
			page: page, 
			num: 0, 
			loginStat: loginStat, 
			loginUrl: loginUrl
		});
	}
}

var isLogin = function(req){
	if((authorizations.some(e => e.username === req.cookies.username))
	 && (authorizations.some(e => e.auth === req.cookies.auth))){
		return true;
	} else {
		return false;
	}
}

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