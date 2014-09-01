'use strict';

var page = require('../page');
var $ = page.$;


var $lastColumns = $('.ghx-columns li:last-child');
var $lastColumnHeader = $('.ghx-column-headers li:last-child');

function hideLastColumn() {
    $lastColumnHeader.hide();
    $lastColumns.hide();
}

function showLastColumn() {
    $lastColumns.show();
    $lastColumnHeader.show();
}

function updateLastColumn() {
    // if Hide Done is clicked, hide the last column.
    if ($lastColumns.has('div').length === 0) {
        hideLastColumn();
    } else {
        showLastColumn();
    }

}

function init(){
    $('.js-parent-drag')
        .draggable({
            distance: 2,
            start: showLastColumn,
            stop: updateLastColumn
        });
}

module.exports = {
    init: init,
    hide: hideLastColumn,
    show: showLastColumn,
    update: updateLastColumn
};
