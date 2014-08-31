'use strict';

var page = require('../page');
var $ = page.$;

var EXPRESSION = $.expr[':'];

// Ignore case and find text almost anywhere.
// Normally jquery matches case and only look in innerText.
function containsAnywhere(elem, i, match) {
    // everything should match blank
    if (!match[3]) { return true; }

    var elementText = (
            (elem.textContent || elem.innerText || '') +
            (elem.getAttribute('href') || '') +
            (elem.getAttribute('title') || '') +
            (elem.getAttribute('original-title') || '')
        ).toLowerCase();

    var searchFor = (match[3] || '').toLowerCase().split(' ');

    // return if they ALL match
    var matches = searchFor.reduce(function(acc, val){
        return acc && elementText.indexOf(val) >= 0
    }, true);

    return matches;
}

function addContainsAnywhere() {
    $.extend(EXPRESSION, {containsAnywhere: containsAnywhere});
}

module.exports = {
    addContainsAnywhere: addContainsAnywhere
};
