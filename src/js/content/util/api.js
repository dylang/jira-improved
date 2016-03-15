'use strict';

const got = require('got');

var API_PREFIX = window.location.pathname.replace('/secure/RapidBoard.jspa', '');
var API_URL = API_PREFIX + '/rest/api/2/';

var page = require('../page');
var $ = page.$;
var querystring = require('querystring');

function get(url) {
/*
    return got.get(url, {
        json: true
    })
        .catch(err => { console.log('error getting url', url, err.message, err);  return {}; })
        .then(response => response.body);
*/

    return $.ajax(url,
        {
            dataType: 'json',
            type: 'GET',
            cache: true
        });
}

function jql(query) {
    return get(API_URL + 'search?' + querystring.stringify(query));
}

function issue(issue_id, fields) {
    return get(API_URL + 'issue/' + issue_id + '?' + querystring.stringify({fields: fields.join(',')}));
}

module.exports = {
    get: get,
    jql: jql,
    issue: issue
};
