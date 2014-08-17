'use strict';

var API_PREFIX = window.location.pathname.replace('/secure/RapidBoard.jspa', '');
var API_URL = API_PREFIX + '/rest/api/2/';

var page = require('../page');
var $ = page.$;

function get(url) {
    return $.ajax(url,
        {
            dataType: 'json',
            type: 'GET'
        });
}

function jql(search) {
    return get(API_URL + 'search?' + search);
}

function issue(search) {
    return get(API_URL + 'issue/' + search);
}

module.exports = {
    get: get,
    jql: jql,
    issue: issue
};
