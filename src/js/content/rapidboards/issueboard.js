'use strict';

var escape = require('escape-html');

var CUSTOMFIELDS = require('../customfields');
var api = require('../util/api');
var page = require('../page');
var $ = page.$;

var findPRs = require('../util/findPRs');

var STATUS_MAP = {
    Open: 'Backlog'
};


function decorate(data) {
    var issues = data.issuesData.issues;
    var $issues = $('.ghx-issue');

    var epics = {};
    var openTicketsToCheckForPRs = [];

    issues.forEach(function(issue) {
        if (!issue) { return; }
        if (!issue.key) { return; }

        if (issue.typeName === 'Feature' || issue.typeName === 'Epic') {
            return;
        }

        if (issue.statusName !== 'Closed' && issue.statusName !== 'Open') {
            openTicketsToCheckForPRs.push(issue.key);
        }

        var $issue = $issues.filter('[data-issue-key=' + issue.key + ']');

        if (issue.epic) {
            epics[issue.epic] = epics[issue.epic] || issue.epic;
            $issue.append('<div class="epic-container"><a href="/browse/' + issue.epic + '" target="_blank" data-epic="' + issue.epic + '"></a></div>');
        }
    });

    Object.keys(epics).forEach(function(epic) {

        var FIELDS = ['summary', 'status', CUSTOMFIELDS.EPIC_NAME];

        api.issue(epic, FIELDS).then(function(data) {
            if (!data) { return; }
            if (!data.fields) { return; }
            if (!data.fields.status) { return; }
            if (!data.fields.summary) { return; }

            if (data.fields.summary !== data.fields[CUSTOMFIELDS.EPIC_NAME]) {
                console.log('Missmatch names!');
                console.log(epic, ' > ', data.fields.summary);
                console.log(epic, ' > ', data.fields[CUSTOMFIELDS.EPIC_NAME]);
            }

            var status = STATUS_MAP[data.fields.status.name] || data.fields.status.name;

            $issues.find('[data-epic=' + epic + ']')
                .addClass('ghx-label-' + data.fields.status.statusCategory.id)
                .addClass('epic-link')
                .addClass('expanding-tag')
                .append('<span class="summary">' + escape(data.fields.summary) + '</span>')
                .append('<span class="kinda-hidden"> - ' + epic + ' - ' + status + '</span>');

        });
    });


    if (openTicketsToCheckForPRs.length) {

        var query = {
            maxResults: 500,
            jql: 'issue=' + openTicketsToCheckForPRs.join(' OR issue=') + ' AND (labels is not empty OR "Code Review URL(s)" is not EMPTY)',
            fields: ['labels', CUSTOMFIELDS.PULL_REQUESTS].join(',')
        };

        api.jql(query).then(function(data) {
            if (!data) {
                return;
            }
            if (!data.issues) {
                return;
            }

            data.issues.forEach(function(issue){
                var pullRequests = findPRs(issue.fields[CUSTOMFIELDS.PULL_REQUESTS]);

                if (pullRequests) {
                    var $where = $('<div class="pull-requests">').appendTo($issues.filter('[data-issue-key=' + issue.key + ']'));
                    pullRequests.forEach(function(pullRequest) {

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
                    });
                }
            });

            $('.pull-request').tipsy({opacity: 1});

        });
    }
}

module.exports = {
    decorate: decorate
};
