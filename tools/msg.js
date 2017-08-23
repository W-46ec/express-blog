//数据库操作错误信息
var dbError = function(res){
	res.status(500);
	res.render('msg', {
		title: 'Error', 
		text: 'Error!', 
		path: '/lists'
	});
}

var error404 = function(res){
	res.status(404);
	res.render('msg', {
		title: 'Error', 
		text: 'Not found!', 
		path: '/lists'
	});
}

module.exports = {
	dbError: dbError,
	error404: error404
}