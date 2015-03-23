'use strict';

require('babelify/polyfill');

var manifest = require('../../manifest.json');
console.log('(((============ JIRA IMPROVED ' + manifest.version + ' ADDED ==============)))');


const cache = require('lscache');
var featureTickets = require('./tickets/feature-tickets');
var issueTickets = require('./tickets/issue-tickets');

//var emptyColumn = require('./ui/emptyColumn');
var filter = require('./ui/filter');
var avatar = require('./ui/avatar');

var page = require('./page');

var GH = page.GH;

function init() {
    console.log('Jira Improved: Calling Init');
    avatar.update();
    // make sure this is using the same data
    GH.WorkDataLoader.getData(page.rapidViewID).then(function(data) {

        let rapidViewId = data.rapidViewId;
        cache.setBucket('improved:' + rapidViewId);

        featureTickets.decorate(data);
        issueTickets.decorate(data);
        // must re-register in case of updates
        page.changed(init);
    });
}

function update () {
    console.log('Jira Improved: Calling Update');
    avatar.update();
    featureTickets.update();
    issueTickets.update();
    page.changed(init);
}


if (GH && GH.SwimlaneView && GH.SwimlaneView.rerenderCellOfIssue) {
    var original = {};
    original['GH.SwimlaneView.rerenderCellOfIssue'] = GH.SwimlaneView.rerenderCellOfIssue;

    GH.SwimlaneView.rerenderCellOfIssue = function(key) {
        console.log('issue updated:', key);
        original['GH.SwimlaneView.rerenderCellOfIssue'](key);
        update();
    };
}


avatar.update();
filter.init();
page.changed(init);
