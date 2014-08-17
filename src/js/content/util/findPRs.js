'use strict';

var matchUrls = new RegExp('((http|https):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))','g');

//var url = require('url');


function prUrlToAPI(str) {
    if (!str || str.length === 0) { return; }

    var urls = str.match(matchUrls);

    // URL: https://github.com/x-web/x-web-canonical-lookup/pull/35
    // API: https://github.com/api/v3/repos/x-web/x-web-canonical-lookup/pulls/35

    return urls.map(function(url){
        return {
            url: url,
            api: url
                .replace(/(\/\/[^/]*)/, '$1/api/v3/repos')
                .replace('/pull/', '/pulls/')
        };
    });
}

module.exports = prUrlToAPI;
