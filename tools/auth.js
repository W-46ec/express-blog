var crypto = require('crypto');
var md5 = crypto.createHash('md5');

exports.authorizations = [];

exports.cookies = function(req, res, username){
	md5 = crypto.createHash('md5');
	md5.update(username + (new Date()).toString());
	var auth = md5.digest('hex');
	exports.authorizations.push({username: username, auth: auth});
	res.cookie('username', username, {maxAge: 60 * 60 * 1000});
	res.cookie('auth', auth, {maxAge: 60 * 60 * 1000});
}