var sha256 = require('sha256');

authorizations = [];

//生成Cookie
cookies = function(req, res, body){
	//防止授权信息积累
	if(authorizations.some(e => e.username === body.username)){
		for(var i = 0; i < authorizations.length; i++){
			if(authorizations[i].date + 60 * 60 * 1000 < +(new Date())){
				authorizations.splice(i,1);
				i-=1;
			}
		}
	}
	var auth = sha256(body.username + (new Date()).toString() + body.pwd);
	authorizations.push({
		username: body.username, 
		auth: auth,
		date: +(new Date())
	});
	res.cookie('username', body.username, {maxAge: 60 * 60 * 1000});	//1h
	res.cookie('auth', auth, {maxAge: 60 * 60 * 1000});	//1h
}

module.exports = {
	authorizations: authorizations,
	cookies: cookies
}