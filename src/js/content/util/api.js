'use strict';

var API_PREFIX = window.location.pathname.replace('/secure/RapidBoard.jspa', '');
var API_URL = API_PREFIX + '/rest/api/2/';

var page = require('../page');
var $ = page.$;
var querystring = require('querystring');

function get(url) {
    return $.ajax(url,
        {
            dataType: 'json',
            type: 'GET'
        });
}

function jql(query) {
    return get(API_URL + 'search?' + querystring.stringify(query));
}

function issue(issue, fields) {
    return get(API_URL + 'issue/' + issue + '?' + querystring.stringify({fields: fields.join(',')}));
}

module.exports = {
    get: get,
    jql: jql,
    issue: issue
};
