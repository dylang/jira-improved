'use strict';

var page = require('../page');
var $ = page.$;

var previousFilter;
var previousItems;


//var debounce = require('../util/debounce');
var sizzleCustomizations = require('../util/sizzle-customizations');

var $filter = $('<input>').addClass('filter').attr('placeholder', 'Filter');


function filter(force) {

    // need to re-find all the issues in case some filter was changed that altered what tickets are viewable
    //.ghx-swimlane.ghx-closed .ghx-columns .ghx-issue,
    //.ghx-swimlane.ghx-closed .ghx-columns .ghx-parent-group {

    var $items = $('.ghx-issue');
    var value = $filter.val().trim();

    if (!force && value === previousFilter && previousItems === $items.length) {
        return;
    }

    var $matches = $items.has(':containsAnywhere("' + value + '")');

    $items.find('.highlight').removeClass('highlight');

    if (value) {
        var searchFor = value.split(' ');

        searchFor.forEach(function(val){
            $matches.find(':containsAnywhere("' + val + '"):not(:has(*))').addClass('highlight');
        });
    }

    $items.not($matches).addClass('hidden');
    $matches.removeClass('hidden');
    previousFilter = value;
    previousItems = $items.length;

    page.changed(filter);
}

function init() {

    var $whereToPutFilter = $('#js-quickfilters-label');

    if (!$whereToPutFilter.length) {
        setTimeout(init, 100);
        return;
    }

    // Add new jQuery filter for finding text anywhere
    sizzleCustomizations.addContainsAnywhere();

    $filter
        .on('keyup change', filter)
        .replaceAll('#js-quickfilters-label');

    // Hotkey for `f`/ 'F'
    $(window.document).bind('keyup', function(e) {
        var KEY_F = 102;
        var KEY_f = 70;

        var $target = $(e.target);
        if (page.AJS.keyboardShortcutsDisabled || $target.is(':input')) {
            return;
        }

        if (e.which === KEY_F || e.which === KEY_f) {
            $filter.focus();
            e.preventDefault();
            return false;
        }
    });
}

module.exports = {
    init: init,
    filter: filter
};
