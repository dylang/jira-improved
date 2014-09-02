'use strict';

var page = require('../page');
var $ = page.$;

function fixUI() {
    page.changed(fixUI);

    // i forget what this is for - should d be there?
    //$('.ghx-scroll-coldumns').removeClass('ghx-scroll-coldumns');

}

module.exports = fixUI;

