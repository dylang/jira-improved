'use strict';

require('6to5ify/polyfill');

var manifest = require('../../manifest.json');
console.log('(((============ JIRA IMPROVED ' + manifest.version + ' ADDED ==============)))');



var epicboard = require('./rapidboards/epicboard');
var issueboard = require('./rapidboards/issueboard');

//var emptyColumn = require('./ui/emptyColumn');
var filter = require('./ui/filter');
var avatar = require('./ui/avatar');

var page = require('./page');

var GH = page.GH;

function update () {
    avatar.update();
    // make sure this is using the same data
    GH.WorkDataLoader.getData(page.rapidViewID).then(function(data) {
        epicboard.decorate(data);
        issueboard.decorate(data);
        // must re-register in case of updates
        page.changed(update);
    });
}

avatar.update();
filter.init();
page.changed(update);


if (GH && GH.SwimlaneView && GH.SwimlaneView.rerenderCellOfIssue) {
    var original = {};
    original['GH.SwimlaneView.rerenderCellOfIssue'] = GH.SwimlaneView.rerenderCellOfIssue;

    GH.SwimlaneView.rerenderCellOfIssue = function(key) {
        console.log('issue updated:', key);
        original['GH.SwimlaneView.rerenderCellOfIssue'](key);
        avatar.update();
        epicboard.update();
        //issueboard.decorate();
    };

}
