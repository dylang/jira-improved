'use strict';

var getUrls = require('get-urls');
var url = require('url');
var path = require('path');
var favIconUrl = require('./favicon');

function prUrlToAPI(str) {
    if (!str || str.length === 0) { return; }

    var urls = getUrls(str);

    // URL: https://github.com/x-web/x-web-canonical-lookup/pull/35
    // API: https://github.com/api/v3/repos/x-web/x-web-canonical-lookup/pulls/35


    return urls.map(function(urlString){

        var urlObj = url.parse(urlString);

        var apiPath = urlObj.pathname.split('/').slice(1,5);
        var apiUrl;
        var favIcon;

        if (apiPath[2] === 'pull') {

            apiPath[2] = 'pulls';

            apiUrl = url.format({
                protocol: urlObj.protocol,
                host: urlObj.host,
                port: urlObj.port,
                pathname: path.join('/api/v3/repos', path.join.apply(path, apiPath))
            });
        } else {
            //http://g.etfv.co/http://www.google.com?defaulticon=http://en.wikipedia.org/favicon.ico
            favIcon = favIconUrl(urlString);
        }

        return {
            url: urlString,
            api: apiUrl,
            host: urlObj.host,
            favIcon: favIcon
        };
    });
}

module.exports = prUrlToAPI;
