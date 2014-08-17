'use strict';

var querystring = require('querystring');

function fromQueryString (key) {
    var qs = window.location.search.substring(1);
    return querystring.parse(qs)[key];
}

module.exports = fromQueryString;
