'use strict';

var manifest = require('../../manifest.json');

const page = require('./page');
const GH = page.GH;

function runExtension() {
    console.log('(((============ JIRA IMPROVED ' + manifest.version + ' ADDED ==============)))');

    const cache = require('lscache');

    const CACHE_VERSION = 3;
    if (cache.get('CACHE_VERSION') !== CACHE_VERSION) {
        console.log('Jira Improved', 'Old cache version:', cache.get('CACHE_VERSION'), 'flushing to use', CACHE_VERSION);
        cache.flush();
        cache.set('CACHE_VERSION', CACHE_VERSION);
    }

    const epicTickets = require('./tickets/epic-tickets');
    const issueTickets = require('./tickets/issue-tickets');

    const filter = require('./ui/filter');
    const avatar = require('./ui/avatar');

    const customFields = require('./customfields');
    const co = require('co');

    function init () {
        co(function* () {
            console.log('Jira Improved: Calling Init');
            avatar.update();
            // make sure this is using the same data
            let data = yield GH.WorkDataLoader.getData(page.rapidViewID);

            yield customFields.init();

            let rapidViewId = data.rapidViewId;
            cache.setBucket('improved:' + rapidViewId);

            epicTickets.decorate(data);
            issueTickets.decorate(data);

            // must re-register in case of updates
            page.changed(init);
        });
    }

    function update () {
        console.log('Jira Improved: Calling Update');
        avatar.update();
        epicTickets.update();
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

}

if (GH) {
    runExtension();
}
