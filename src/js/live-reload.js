'use strict';

// Reload client for Chrome Apps & Extensions.
// The reload client has a compatibility with livereload.
// WARNING: only supports reload command.


var LIVERELOAD_HOST = 'localhost:';
var LIVERELOAD_PORT = 35729;
var connection = new WebSocket('ws://' + LIVERELOAD_HOST + LIVERELOAD_PORT + '/livereload');

var error;

connection.onerror = function (error) {
    console.log('connection got error', error);
    error = error;
};

connection.onmessage = function (e) {

    if (!error && e.data) {
        var data = JSON.parse(e.data);
        if (data && data.command === 'reload') {
            chrome.runtime.reload();
        }
    }
};

