'use strict';

var page = require('../page');
var $ = page.$;

var $lastColumns;
var $lastColumnHeader;


function hide() {
    $lastColumnHeader.hide();
    $lastColumns.hide();
}

function show() {
    $lastColumns.show();
    $lastColumnHeader.show();
}

function update() {
    // if Hide Done is clicked, hide the last column.
    if ($lastColumns.has('div').length === 0) {
        hide();
    } else {
        show();
    }

    page.changed(update);

}

function init(){

    $lastColumns = $('.ghx-columns li:last-child');
    $lastColumnHeader = $('.ghx-column-headers li:last-child');

    $('.js-parent-drag')
        .draggable({
            distance: 2,
            start: show,
            stop: update
        });

    update();
}

module.exports = {
    init: init
};
