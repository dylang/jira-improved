'use strict';

var manifest = require('../../manifest.json');
console.log('(((============ JIRA IMPROVED ' + manifest.version + ' ADDED ==============)))');

var epicboard = require('./rapidboards/epicboard');
var issueboard = require('./rapidboards/issueboard');

var emptyColumn = require('./ui/emptyColumn');
var filter = require('./ui/filter');

var page = require('./page');

var GH = page.GH;
var $ = page.$;

// i forget what this is for - should d be there?
$('.ghx-scroll-coldumns').removeClass('ghx-scroll-coldumns');

function update () {

    emptyColumn.update();

    // make sure this is using the same data
    GH.WorkDataLoader.getData(page.rapidViewID).then(function(data) {
        epicboard.decorate(data);
        issueboard.decorate(data);
        // must re-register in case of updates
        page.changed(update);
    });
}

function init() {
    $('.js-parent-drag')
        .draggable({
            distance: 2,
            start: emptyColumn.show,
            stop: emptyColumn.update
        });

    update();
}

filter.init();
page.changed(init);
