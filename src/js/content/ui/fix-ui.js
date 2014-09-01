'use strict';

var page = require('../page');
var $ = page.$;

function fixUI() {
    // remove silly up arrows
    $('.ghx-columns .ghx-priority').hide();
    page.changed(fixUI);

    // i forget what this is for - should d be there?
    //$('.ghx-scroll-coldumns').removeClass('ghx-scroll-coldumns');

}

module.exports = fixUI;

