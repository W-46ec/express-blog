var express = require('express');
var path = require('path');

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
		res.render('msg', {title: 'Error', text: 'Error!', path: '/users/login.html'});
	}
});

router.get('/', function(req, res, next) {
	res.redirect('/users/login.html');
});

router.get('/login.html', function(req, res, next) {
	if((auth.authorizations.some(e => e.username === req.cookies.username))
	 && (auth.authorizations.some(e => e.auth === req.cookies.auth))){
		res.redirect('/lists');
	} else {
		res.render('login');
	}
});

router.get('/new.html', function(req, res, next) {
	if((auth.authorizations.some(e => e.username === req.cookies.username))
	 && (auth.authorizations.some(e => e.auth === req.cookies.auth))){
		res.render('new');
	} else {
		res.redirect("/users/login.html");
	}
});

router.get('/edit.html', function(req, res, next) {
	if((auth.authorizations.some(e => e.username === req.cookies.username))
	 && (auth.authorizations.some(e => e.auth === req.cookies.auth))){
		mdb.blogDetail(req.query.id, function(result){
			if(check.checkIsEmpty(result)){
				var title = result[0].title;
				var content = result[0].content;
				var page = req.query.page;
				var id = req.query.id;
				res.render('edit', {title: title, content: content, page: page, id: id});
			} else {
				res.status(404);
				res.render('msg', {title: 'Error', text: 'Not found!', path: '/lists'});
			}
		});
	} else {
		res.redirect("/users/login.html");
	}
});

router.get('/delete', function(req, res, next){
	if((auth.authorizations.some(e => e.username === req.cookies.username))
	 && (auth.authorizations.some(e => e.auth === req.cookies.auth))){
		mdb.blogDetail(req.query.id, function(result){
			if(check.checkIsEmpty(result)){
				mdb.deleteBlog(req.query.id, function(result2){
					if(check.checkIsUndef(result2)){
						res.render('msg', {title: 'Success', text: 'Success!', path: '/lists'});
					} else {
						res.status(500);
						res.render('msg', {title: 'Error', text: 'Error!', path: '/lists'});
					}
				});
			} else {
				res.status(404);
				res.render('msg', {title: 'Error', text: 'Not found!', path: '/lists'});
			}
		});
	} else {
		res.redirect("/users/login.html");
	}
});

router.post('/login', function(req, res, next) {
	mdb.findUser(req.body.username, function(result){
		if(result.length === 0){
			res.render('msg', {title: 'Wrong', text: 'Username does not exist!', path: '/users/login.html'});
		} else {
			if(result[0].pwd === req.body.pwd){
				auth.cookies(req, res, req.body.username);
				res.render('msg', {title: 'Success', text: 'Welcome!', path: '/lists'});
			} else {
				res.render('msg', {title: 'Wrong', text: 'Wrong password!', path: '/users/login.html'});
			}
		}
	});
});

router.post('/new', function(req, res, next){
	if((auth.authorizations.some(e => e.username === req.cookies.username))
	 && (auth.authorizations.some(e => e.auth === req.cookies.auth))){
		mdb.addBlog(req.body, function(result){
			if(check.checkIsUndef(result)){
				res.render('msg', {title: 'Success', text: 'Success!', path: '/lists'});
			} else {
				res.status(500);
				res.render('msg', {title: 'Error', text: 'Error!', path: '/lists'});
			}
		});
	} else {
		res.redirect("/users/login.html");
	}
});

router.post('/edit', function(req, res, next){
	if((auth.authorizations.some(e => e.username === req.cookies.username))
	 && (auth.authorizations.some(e => e.auth === req.cookies.auth))){
		mdb.blogDetail(req.query.id, function(result){
			if(check.checkIsEmpty(result)){
				mdb.updateBlog(req.query.id, req.body, function(result2){
					if(check.checkIsUndef(result2)){
						res.render('msg', {title: 'Success', text: 'Success!', path: '/lists'});
					} else {
						res.status(500);
						res.render('msg', {title: 'Error', text: 'Error!', path: '/lists'});
					}
				});
			} else {
				res.status(404);
				res.render('msg', {title: 'Error', text: 'Not found!', path: '/lists'});
			}
		});
	} else {
		res.redirect("/users/login.html");
	}
});

module.exports = router;