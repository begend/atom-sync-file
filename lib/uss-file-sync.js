var File = require('atom').File;
var spawn = require('child_process').spawn;
var http = require('http');  
var qs = require('querystring');  

module.exports = function () {
    var _syncFile = function () 
    {
        console.log("in sync");
        var editor = atom.workspace.getActiveTextEditor();
        var filePath = editor.getPath();
        var searchPhrase = atom.config.get("uss-file-sync.uss_local_env_path");
        var serverIp = atom.config.get("uss-file-sync.server_ip");
        var serverPort = atom.config.get("uss-file-sync.server_port");
        var serverUrl = atom.config.get("uss-file-sync.server_url");
        if (filePath.indexOf(searchPhrase) !== -1) 
        {
            var relative_file_path_array = filePath.split(searchPhrase);
            var relative_file_path = relative_file_path_array[1];
            var post_data = {  
                "rootPath": searchPhrase,
                "fileName" : relative_file_path + ".bak",
                "fileContent" : editor.getText(),
                "code" : "gbk",
            };
            var content = qs.stringify(post_data);
            var options = {  
                hostname: serverIp,  
                port: serverPort,  
                path: serverUrl,  
                method: 'POST',  
                headers: {  
                    'Content-Type': 'application/x-www-form-urlencoded; charset=GBK'  
                }  
            };
            var req = http.request(options, function (res) {  
                res.setEncoding('utf8');  
                res.on('data', function (chunk) {  
                    atom.notifications.addSuccess("Success: done", {
                        detail : "sync " + serverIp + " ok"
                    }); 
                });  
            });  
            
            req.on('error', function (e) {  
                console.log('problem with request: ' + e.message);  
                atom.notifications.addError('Error: Sync File Failed', {
                    detail: "Please check your server"
                });
            });  
            
            req.write(content);  
            req.end(); 



        }
    };

    return {
        config: {
            uss_local_env_path: {
                type: "string",
                default: 'D:\\work\\cpp\\ranker'
            },
            server_ip: {
                type: "string",
                default: '127.0.0.1'
            },
            server_port: {
                type: "number",
                default: 8888
            },
            server_url: {
                type: "string",
                default: '/hello'
            }
        },
        activate: function () {
            atom.commands.add('atom-workspace', "uss-file-sync:uss-sync-all", _syncFile);

            atom.packages.onDidActivateInitialPackages(function () {
                atom.workspace.observeTextEditors(function (editor) {
                    editor.onDidSave(function () {
                        _syncFile();
                    });
                });
            });
        }
    };
}();
