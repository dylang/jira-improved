'use strict';

var url = require('url');

function faviconUrl (urlStr) {

    var urlObj = url.parse(urlStr);

    var hostname = url.format({
        protocol: urlObj.protocol,
        host: urlObj.host,
        port: urlObj.port
    });

    var backupFavIcon = url.format({
        protocol: urlObj.protocol,
        host: urlObj.host,
        port: urlObj.port,
        pathname: 'favicon.ico'
    });

    if (urlObj.host === 'src.va.opower.it') {
        return 'http://marketplace.servicerocket.com/static/products/atlassian/logoCruciblePNG.png';
    }

    if (urlObj.host === 'testrail.va.opower.it') {
        return 'http://help.fogcreek.com/wp-content/uploads/2015/01/testrail.png';
    }



    /*
    var favIconNotWorking = url.format({
        protocol: 'https',
        host: 'getfavicon.appspot.com',
        pathname: hostname,
        search: 'defaulticon=' + backupFavIcon
    });
    */

    //https://favatar.mention.com/
    var favIcon = url.format({
        protocol: 'https',
        host: 'favatar.mention.com',
        pathname: 'image',
        query: {
            url: hostname,
            format: 'image',
            api_key: 'favatardemokey',
            default: backupFavIcon
        }
    });


    return favIcon;
}

module.exports = faviconUrl;
