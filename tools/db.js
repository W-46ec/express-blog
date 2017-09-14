var sha256 = require('sha256');
var uuid = require('uuid');
var crypto = require('crypto');

var mongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://127.0.0.1:27017/blog';
var limitLists = 10;	//每页显示博客条数

var tbUser = 'users';
var tbBlog = 'blog';
var tbProfile = 'profile';

//查找用户
var findUser = function(query, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbUser);
		var whereStr = {"username":query};
		collection.find(whereStr).toArray(function(err, result){
			callback(err, result);
		});
	});
}

//添加用户
var addUser = function(query, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbUser);
		var username = query.username;
		var salt = sha256(uuid.v4());
		//HMACSHA256方式加盐
		var pwd = crypto.pbkdf2Sync(
			query.pwd,
			salt,
			4096,	//迭代次数
			256,	//生成密码长度
			'sha256'
		).toString('hex');
		var date = new Date().toLocaleString();
		var timestamp = +(new Date());
		var data = [{
			username: username, 
			pwd: pwd, 
			salt: salt,
			date: date,
			timestamp: timestamp
		}];
		collection.insert(data,function(err,result){
			callback(err, result);
			db.close();
		});
	});
}

//修改密码
var changepwd = function(query, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbUser);
		var salt = sha256(uuid.v4());
		var pwd = crypto.pbkdf2Sync(
			query.pwd,
			salt,
			4096,
			256,
			'sha256'
		).toString('hex');
		var whereStr = {"username": query.username};
		var updateStr = {$set: {
			pwd: pwd,
			salt: salt
		}};
		collection.update(whereStr, updateStr, function(err,result){
			callback(err, result);
			db.close();
		})
	});
}

//获取用户信息
var getProfile = function(username, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbProfile);
		var whereStr = {"username": username};
		collection.find(whereStr).toArray(function(err, result){
			callback(err, result);
		});
	});
}

//修改用户信息
var updateProfile = function(username, query, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbProfile);
		var whereStr = {"username": username};
		var updateStr = {$set: {
			email: query.email, 
			phone: query.phone,
			job: query.job,
			address: query.address,
			aboutme: query.aboutme
		}};
		collection.update(whereStr, updateStr, {upsert: true}, function(err,result){
			callback(err, result);
			db.close();
		})
	});
}

//查询博客详情
var blogDetail = function(query, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbBlog);
		var whereStr = {"id": query};
		collection.find(whereStr).toArray(function(err, result){
			callback(err, result);
			db.close();
		});
	});
}

//首页查询
var list = function(query, page, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbBlog);
		var skip = (parseInt(page) - 1) * limitLists;
		collection.find(query).sort({"timestamp": -1}).limit(limitLists).skip(skip).toArray(function(err, result){
			callback(err, result);
			db.close();
		});
	});
}

//添加博客
var addBlog = function(req, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbBlog);
		var query = req.body;
		var username = req.cookies.username;
		var title = query.title;
		var content = query.content;
		var date = new Date().toLocaleString();
		var timestamp = +(new Date());
		var id = sha256(username + title + content + data);
		var privacy;
		if(query.privacy === undefined){
			privacy = 0;
		} else {
			privacy = 1;
		}
		var data = [{
			username: username, 
			title: title, 
			content: content, 
			date: date, 
			timestamp: timestamp,
			id: id,
			privacy: privacy
		}];
		collection.insert(data,function(err,result){
			callback(err, result);
			db.close();
		});
	});
}

//修改博客
var updateBlog = function(id, query, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbBlog);
		var whereStr = {"id": id};
		var privacy;
		if(query.privacy === undefined){
			privacy = 0;
		} else {
			privacy = 1;
		}
		var updateStr = {$set: {
			title: query.title, 
			content: query.content,
			privacy: privacy
		}};
		collection.update(whereStr, updateStr, function(err,result){
			callback(err, result);
			db.close();
		})
	});
}

//删除博客
var deleteBlog = function(id, callback){
	mongoClient.connect(DB_CONN_STR,function(err,db){
		var collection = db.collection(tbBlog);
		var whereStr = {"id": id};
		collection.deleteOne(whereStr, function(err,result){
			callback(err, result);
			db.close();
		});
	});
}

module.exports = {
	mongoClient: mongoClient,
	DB_CONN_STR: DB_CONN_STR,
	limitLists: limitLists,
	findUser: findUser,
	addUser: addUser,
	changepwd: changepwd,
	getProfile: getProfile,
	updateProfile: updateProfile,
	addBlog: addBlog,
	blogDetail: blogDetail,
	list: list,
	updateBlog: updateBlog,
	deleteBlog: deleteBlog
}