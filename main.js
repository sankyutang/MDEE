var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var logger = require('log4js').getLogger();


// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

var dataDirectoryPath = __dirname + '/data/';
var dataFiles = [];

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 768});
  // mainWindow = new BrowserWindow

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  // Open the DevTools.
  // mainWindow.openDevTools();

  // var dialog = require('dialog');
	
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });


  var ipc = require('ipc');
  var fileAPI = require("./app/files");

	ipc.on('request', function(event, args) {
    if(args == 'undefined' || typeof(args) !== 'object'){
      logger.error('error arguments form ipc request');
      return;
    }
    logger.info('request form page, arguments = %s', JSON.stringify(args));
    if(!args.action) return;
    switch(args.action){
      case 'loadMarkdownList':
        var dataFiles = fileAPI.getMarkdownList(dataDirectoryPath, __dirname);
        logger.debug('response to page, fileList = %s', JSON.stringify(dataFiles));
        event.sender.send('response',dataFiles);
        break;
      case 'autoSaveMarkdown':
        // logger.debug('setting = ' + JSON.stringify(args.setting));
        fileAPI.saveMarkdown(args.editor, args.loadUrl);
        break;
      case 'newMarkdown':
        // fileAPI.createMarkdown(args.)
        var directoryPath = args.directoryPath + '/';
        var filename = fileAPI.initNewFilename();
        logger.info('create new Markdown file,filename = %s, path = %s',filename, directoryPath);
        var fullPath = fileAPI.createFile(directoryPath, filename);
        var url = 'file://' + __dirname + '/writer.html?filePath=' + encodeURIComponent(directoryPath + filename) + '&filename=' + filename + '.md';
        logger.info(url);
        mainWindow.loadUrl(url);
        break;
      case 'saveFilename':
        var sourceValue = args.sourceValue,
            value = args.value,
            loadUrl = args.loadUrl,
            directoryPath = args.directoryPath;
        var flag = fileAPI.renameFilename(sourceValue, value, directoryPath);
        var url = 'file://' + __dirname + '/writer.html?filePath=' + encodeURIComponent(directoryPath + value + '.md') + '&filename=' + encodeURIComponent(value + '.md');
        logger.info(url);
        mainWindow.loadUrl(url);
        break;
      case 'openMarkdown':
        fileAPI.getMarkdownListByDialog(function(path){
          var dataFiles = fileAPI.getMarkdownListByPath(path);
          console.log(dataFiles);
          event.sender.send('response',{
            action: 'openMarkdown',
            dirPath: __dirname,
            data:dataFiles,
            directoryPath: path
          });
        });
        break;
      case 'openMarkdownByPath':
        var directoryPath = args.directoryPath;
        logger.info(directoryPath);
        var dataFiles = fileAPI.getMarkdownListByPath(directoryPath);
        console.log(dataFiles);
        event.sender.send('response',{
          action: 'openMarkdown',
          dirPath: __dirname,
          data:dataFiles,
          directoryPath: directoryPath
        });
        break;
      default:
        console.log('default');
        break;
    }
	  
	});

	ipc.on('synchronous-message', function(event, arg) {
	  console.log(arg);  // prints "ping"
	  event.returnValue = result;
	});

});