var express = require('express');
var check = require('../tools/check.js')
var mdb = require('../tools/db.js');

var mongoClient = mdb.mongoClient;
var DB_CONN_STR = mdb.DB_CONN_STR;
var limitLists = mdb.limitLists;

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/lists');
});

router.get('/lists', function(req, res, next) {
	if(check.checkPageIsLegal(req.query.page)){
		mdb.list(req.query.page, function(result){
			check.checkNextPage(res, req, result, function(){
				mdb.list((parseInt(req.query.page) + 1).toString(), function(result2){
					var page = parseInt(req.query.page);
					if(check.checkIsEmpty(result2) === 0){
						res.render('lists', {lists: result, page: page, num: 0});
					} else {
						res.render('lists', {lists: result, page: page, num: 1});
					}
				});
			});
		});
	} else {
		res.redirect("/lists?page=1");
	}
});

router.get('/detail', function(req, res, next) {
	mdb.blogDetail(req.query.id, function(result){
		if(check.checkIsEmpty(result)){
			var title = result[0].title;
			var content = result[0].content;
			var page = req.query.page;
			var id = req.query.id;
			res.render('detail', {title: title, content: content, page: page, id: id});
		} else {
			res.status(404);
			res.render('msg', {title: 'Error', text: 'Not found!', path: '/lists'});
		}
	});
});

module.exports = router;