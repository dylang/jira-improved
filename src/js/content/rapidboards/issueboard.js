'use strict';

const _ = require('lodash');
var co = require('co');

const escape = require('escape-html');

const CUSTOMFIELDS = require('../customfields');
const FIELDS = ['summary', 'status', CUSTOMFIELDS.EPIC_NAME];

const api = require('../util/api');
const page = require('../page');
const $ = page.$;

const findPRs = require('../util/findPRs');
const randomRGB = require('../util/randomRGB');

const version = require('../../../../package.json').version;
const cache = require('ls-cache').createBucket('issueboard:' + version);

const STATUS_MAP = {
    Open: 'Backlog'
};

let epics;
let openTicketsToCheckForPRs;

function renderEpic(epicId) {

    var epic = cache.get(epicId);

    if (!epic || !epic.issueKeys) {
        console.log('Jira Improved: No cache for', epicId, epic);
        return;
    }

    var issueKeyFilter = epic.issueKeys.map(function(issueKey) {
        return '[data-issue-key=' + issueKey + ']';
    }).join(', ');

    $(issueKeyFilter)
        //.find('.ghx-summary')
        .not(':has(.epic-container)')
        .append('<div class="epic-container">' +
        '<a href="/browse/' + epicId + '" ' +
        'class="ghx-label-' + epic.statusId + ' epic-link expanding-tag originalColor"' +
        'target="_blank" data-epic="' + epicId + '">' +
        '<span class="summary">' + escape(epic.summary) + '</span>' +
        '<span class="kinda-hidden"> - ' + epicId + ' - ' + epic.status + ' - ' + epic.alternateSummary + '</span>' +
        '</a>' +
        '</div>');


    var $epicLinks = $('.originalColor[data-epic="' + epicId + '"]');
    if (!$epicLinks.length) {
        return;
    }
    var rgbColor = $epicLinks.css('backgroundColor');
    var randomColor = randomRGB(rgbColor, epic.summary);
    $epicLinks
        .removeClass('originalColor')
        .css('backgroundColor', randomColor);
}

function updateEpicCache() {
    _.forEach(epics, function(issueKeys, epicId) {

        co(function* (){
            let data = yield api.issue(epicId, FIELDS);

            if (!data || !data.fields || !data.fields.status || !data.fields.summary) { return; }

            let summary = data.fields.summary.trim();
            let alternateSummary = data.fields[CUSTOMFIELDS.EPIC_NAME].trim();

            if (summary.toLocaleLowerCase() !== alternateSummary.toLocaleLowerCase()) {
                console.log('Missmatch names!');
                console.log(epicId, ' > ', data.fields.summary);
                console.log(epicId, ' > ', data.fields[CUSTOMFIELDS.EPIC_NAME]);
                if (alternateSummary.length < summary.length) {
                    [ summary, alternateSummary ]  = [ alternateSummary, summary ];
                }
            } else {
                alternateSummary = '';
            }

            cache.set(epicId, {
                            status: STATUS_MAP[data.fields.status.name] || data.fields.status.name,
                            statusId: data.fields.status.statusCategory.id,
                            summary: summary,
                            alternateSummary: alternateSummary,
                            issueKeys: issueKeys
                        }, 10000);

            renderEpic(epicId);
        });
    });
}

function updatePRs() {

    if (!openTicketsToCheckForPRs || !openTicketsToCheckForPRs.length) {
        return;
    }

    var query = {
        maxResults: 500,
        jql: 'issue=' + openTicketsToCheckForPRs.join(' OR issue=') + ' AND (labels is not empty OR "Code Review URL(s)" is not EMPTY)',
        fields: ['labels', CUSTOMFIELDS.PULL_REQUESTS].join(',')
    };

    co(function* (){
        let data = yield api.jql(query);

        if (!data || !data.issues) {
            console.log('Jira Improved: No PR issues.');
            return;
        }

        data.issues.forEach(function(issue){

            var $issue = $('[data-issue-key=' + issue.key + ']');

            if ($issue.has('.pull-requests').length) {
                return;
            }

            var pullRequests = findPRs(issue.fields[CUSTOMFIELDS.PULL_REQUESTS]);

            if (pullRequests) {
                var $where = $('<div class="pull-requests">').appendTo($issue);

                pullRequests.forEach(function(pullRequest) {

                    if (pullRequest.api) {
                        $where.append('<a href="' + pullRequest.url + '" target="_blank" title="' + pullRequest.url + '" ' +
                            ' data-pr="' + pullRequest.api + '" class="pull-request pull-request-unknown">' +
                            '</a>');

                        api.get(pullRequest.api).then(function(data) {
                            if (!data) { return; }

                            $('[data-pr="' + pullRequest.api + '"')
                                .removeClass('pull-request-unknown')
                                .addClass('pull-request-' + data.state);
                        }).fail(function(err) {
                            if (err.status === 0) { return; }

                            $('[data-pr="' + pullRequest.api + '"')
                                .removeClass('pull-request-unknown')
                                .addClass('pull-request-error');
                        });
                    }

                    if (pullRequest.favIcon) {
                        $where.append('<a href="' + pullRequest.url + '" target="_blank" title="' + pullRequest.url + '" ' +
                            'class="pull-request-other">' +
                            '<img src="' + pullRequest.favIcon + '">' +
                            '</a>');
                    }

                });
            }
        });

        $('.pull-requests a').tipsy({opacity: 1});
    });
}

function update(){
    if (!epics) {
        return;
    }
    console.log('Jira Improved: Update', epics);
    // Show the cached value if there is one
    _.forEach(epics, function(issueKeys, epicId) {
        renderEpic(epicId);
    });

    updatePRs();
}

function decorate(data) {

    const issues = _(data.issuesData.issues)
        .filter('key')
        .reject({typeName: 'Feature'})
        .reject({typeName: 'Epic'})
        .valueOf();

    epics = _(issues)
        .filter('epic')
        .reduce(function(acc, issue){
            let epic = issue.epic;
            let issueKey = issue.key;
            acc[epic] = acc[epic] || [];
            acc[epic].push(issueKey);
            return acc;
        },
        {})
        .valueOf();

    update();
    updateEpicCache();

    openTicketsToCheckForPRs = _(issues)
        .filter(function(issue) {
            return issue.statusName !== 'Closed' && issue.statusName !== 'Open';
        })
        .pluck('key')
        .valueOf();

    updatePRs();
}

module.exports = {
    decorate: decorate,
    update: update
};
