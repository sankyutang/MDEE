var fs = require("fs");
var logger = require('log4js').getLogger();
var dialog = require('dialog');

var MarkdownFile = function(args){
	this.name = args.name || '';
	this.dataPath = args.dataPath || null;
	this.dirPath = args.dirPath || null;
	this.fullPath = args.fullPath || null;
	this.atime = args.atime || null;
	this.mtime = args.mtime || null;
	this.ctime = args.ctime || null;
}

/**
 * 通过dialog组件打开md文档所在目录
 * 功能暂未实现
 */
var getMDListByDialog = exports.getMarkdownListByDialog = function(callback){
	dialog.showOpenDialog({
		properties: ['openDirectory']
	},callback);
}

// 读取所有文档
var getMDList = exports.getMarkdownList = function(dataDirectoryPath,dirPath){
	var results = fs.readdirSync(dataDirectoryPath);
	results = results.map(function(item){
		return new MarkdownFile({
			name: item,
			dataPath: 'data/' + item,
			dirPath: dirPath,
			fullPath: dataDirectoryPath + item
		});
	});
	results = results.filter(function(item){
		if(item.name.indexOf('.md') > -1){
			return item;
		}
	});
	results = results.sort(function(first, second){
		logger.info('first.mtime = %s,second.mtime = %s', first.mtime, second.mtime );
		if(first.mtime > second.mtime){
			return -1;
		}else if (first.mtime < second.mtime){
			return 1;			
		}else{
			return 0;
		}
	});
	return results;
}

// 读取所有文档
var getMDListByPath = exports.getMarkdownListByPath = function(directoryPath){
	logger.debug(directoryPath);
	var path = directoryPath;
	if(directoryPath instanceof Array && directoryPath.length > 0){
		path = directoryPath[0];
	}
	var results = fs.readdirSync(path);
	logger.info(results);
	results = results.map(function(item){
		var stat = fs.statSync(path + '/' + item);
		return new MarkdownFile({
			name: item,
			dataPath: item,
			fullPath: path + '/' + item,
			atime: stat.atime,
			mtime: stat.mtime,
			ctime: stat.ctime
		});
	});
	results = results.filter(function(item){
		if(item.name.indexOf('.md') > -1){
			return item;
		}
	});
	results = results.sort(function(first, second){
		logger.info('first.mtime = %s,second.mtime = %s', first.mtime, second.mtime );
		if(first.mtime > second.mtime){
			return -1;
		}else if (first.mtime < second.mtime){
			return 1;			
		}else{
			return 0;
		}
	});
	return results;
}

// 保存md文档操作
var saveMarkdown = exports.saveMarkdown = function(data, loadUrl){

	var _data = data;
	logger.debug('saving markdown file. data = ',_data);
	// logger.debug(decodeURIComponent(loadUrl));

	var fullPath = decodeURIComponent(loadUrl);
	var result = fs.writeFileSync(fullPath, _data);

}

// 初始化文件名
var initNewFilename = exports.initNewFilename = function(){
	var name = ['md'];
	var datetime = new Date();
	name.push(datetime.getFullYear());
	name.push(datetime.getMonth());
	name.push(datetime.getDate());
	name.push(datetime.getHours());
	name.push(datetime.getMinutes());
	name.push(datetime.getSeconds());
	return name.join('');
}

var createFile = exports.createFile = function(genPath,filename){
	var fullPath = genPath + filename + '.md';
	console.log(fullPath);
	var result = fs.writeFileSync(fullPath, '');
	return fullPath;
}

var renameFilename = exports.renameFilename = function(oldValue, newValue, genPath){
	var oldPath = genPath + oldValue + '.md';
	var newPath = genPath + newValue + '.md';
	fs.renameSync(oldPath, newPath);
	return true;
}
