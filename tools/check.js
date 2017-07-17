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

var checkIsEmpty = function(result){
	if(result.length === 0){
		return 0;
	} else {
		return result.length;
	}
}

var checkIsUndef = function(result){
	if(result === undefined){
		return false;
	} else {
		return true;
	}
}

var checkNextPage = function(res, req, result, callback){
	if(checkIsEmpty(result) === 0){
		res.redirect("/lists?page=1");
	} else if(checkIsEmpty(result) >= limitLists) {
		callback();
	} else if(checkIsEmpty(result) < limitLists){
		var page = parseInt(req.query.page);
		res.render('lists', {lists: result, page: page, num: 0});
	}
}

module.exports = {
	checkBody: checkBody,
	checkPageIsLegal: checkPageIsLegal,
	checkIsEmpty: checkIsEmpty,
	checkIsUndef: checkIsUndef,
	checkNextPage: checkNextPage
}