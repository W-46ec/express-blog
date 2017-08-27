//信息模板
var message = function(res, title, text, path){
	res.status(200);
	res.render('msg', {
		title: title,
		text: text,
		path: path
	});
}

//数据库操作错误信息
var dbError = function(res){
	res.status(500);
	res.render('msg', {
		title: "Error",
		text: "Error",
		path: '/home'
	});
}

//404错误信息
var error404 = function(res){
	res.status(404);
	res.render('err404', {
		path: '/home'
	});
}

//登陆错误信息
var loginMsg = function(res){
	res.status(200);
	res.render('msg', {
		title: 'Login', 
		text: 'Incorrect username or password.', 
		path: '/users/login.html'
	});
}

//成功信息
var succMsg = function(res){
	res.status(200);
	res.render('msg', {
		title: 'Success', 
		text: 'Success!', 
		path: '/home'
	});
}

//拒绝访问
var accessDeniedMsg = function(res){
	res.status(200);
	res.render('msg', {
		title: 'Access denied', 
		text: 'Access denied!', 
		path: '/home'
	});
}

module.exports = {
	message: message,
	dbError: dbError,
	error404: error404,
	loginMsg: loginMsg,
	succMsg: succMsg,
	accessDeniedMsg: accessDeniedMsg
}