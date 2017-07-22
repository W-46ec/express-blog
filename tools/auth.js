var sha256 = require('sha256');

authorizations = [];

cookies = function(req, res, body){
	var auth = sha256(body.username + (new Date()).toString() + body.pwd);
	authorizations.push({username: body.username, auth: auth});
	res.cookie('username', body.username, {maxAge: 60 * 60 * 1000});
	res.cookie('auth', auth, {maxAge: 60 * 60 * 1000});
}

module.exports = {
	authorizations: authorizations,
	cookies: cookies
}