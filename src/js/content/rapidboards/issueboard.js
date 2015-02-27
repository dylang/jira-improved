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
const cache = require('lscache');

const STATUS_MAP = {
    Open: 'Backlog'
};

let rapidViewId;
let epics;
let openTicketsToCheckForPRs;

function renderPullRequests(issueKey, prString) {

    if (!issueKey || !prString) {
        return;
    }

    const $issue = $('[data-issue-key=' + issueKey + ']');

    $issue.find('.pull-requests').remove();

    var pullRequests = findPRs(prString);

    if (pullRequests) {
        var $where = $('<div class="pull-requests">').appendTo($issue);

        pullRequests.forEach(function(pullRequest) {

            if (pullRequest.api) {
                $('<a href="' + pullRequest.url + '" target="_blank" title="' + pullRequest.url + '" ' +
                    ' data-pr="' + pullRequest.api + '" class="pull-request pull-request-unknown">' +
                    '</a>').tipsy({opacity: 1})
                .appendTo($where);

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
}

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

function checkDevStatusForPullRequests(){

    console.log('Jira Improved: checkDevStatusForPullRequests');

    if (!openTicketsToCheckForPRs || !openTicketsToCheckForPRs.length) {
        return;
    }

    co(function* () {

        const pullRequestsSparse = yield _.map(openTicketsToCheckForPRs, function* (issue){
            const prStatusUrl = `https://ticket.opower.com/rest/dev-status/1.0/issue/detail?issueId=${ issue.id }&applicationType=githubenterprise&dataType=pullrequest`;

            let data = yield api.get(prStatusUrl);

            if (!data || !data.detail || !data.detail[0].pullRequests) {
                return;
            }

            const pullRequests = _.map(data.detail[0].pullRequests, function(pullRequest) {
                return pullRequest.url;
            }).join(' ');

            if (!pullRequests) {
                return;
            }

            return {
                key: issue.key,
                pullRequests: pullRequests
            };
        });

        const pullRequests= _.compact(pullRequestsSparse);

        if (pullRequests.length) {
            $('.pull-requests').remove();

            _.forEach(pullRequests, function(issue){
                renderPullRequests(issue.key, issue.pullRequests);
            });

            cache.set('hasDevStatusPRs', true);
            cache.set('pull-requests', pullRequests);
        } else {
            cache.remove('hasDevStatusPRs');
            cache.remove('pull-requests');
        }
    });
}

function checkCustomFieldForPullRequests(){

    console.log('Jira Improved: checkCustomFieldForPullRequests');

    const issues = _.pluck(openTicketsToCheckForPRs, 'key')
                    .join(' OR issue=');
    const query = {
        maxResults: 500,
        jql: 'issue=' + issues + ' AND (labels is not empty OR "Code Review URL(s)" is not EMPTY)',
        fields: ['labels', CUSTOMFIELDS.PULL_REQUESTS].join(',')
    };


    co(function* (){
        let data = yield api.jql(query);

        if (!data || !data.issues) {
            return;
        }

        const pullRequests = _(data.issues)
            .map(function(issue){
                const pullRequests = issue.fields[CUSTOMFIELDS.PULL_REQUESTS];

                if (!pullRequests) {
                    return;
                }

                return {
                    key: issue.key,
                    pullRequests: pullRequests
                };
            })
            .compact()
            .valueOf();

        if (pullRequests.length) {
            $('.pull-requests').remove();

            console.log('Custom Field PRs', pullRequests);

            _.forEach(pullRequests, function(issue){
                renderPullRequests(issue.key, issue.pullRequests);
            });

            cache.set('pull-requests', pullRequests);
            cache.set('hasCustomFieldPRs', true);
        } else {
            cache.remove('hasCustomFieldPRs');
            cache.remove('pull-requests');
        }

    });
}

function updatePRs() {
    const cachedPullRequests = cache.get('pull-requests');

    _.forEach(cachedPullRequests, function(issue){
        renderPullRequests(issue.key, issue.pullRequests);
    });


    if (cache.get('hasCustomFieldPRs')) {
        return checkCustomFieldForPullRequests();
    }

    if (cache.get('hasDevStatusPRs')) {
        return checkDevStatusForPullRequests();
    }

    checkCustomFieldForPullRequests();
    checkDevStatusForPullRequests();
}

function update(){
    if (!epics) {
        return;
    }
    console.log('Jira Improved: Update');
    // Show the cached value if there is one
    _.forEach(epics, function(issueKeys, epicId) {
        renderEpic(epicId);
    });

   updatePRs();
}


function decorate(data) {
    if (!data.rapidViewId || !data.issuesData || !data.issuesData.issues) {
        console.log('not enough info for decorate', data);
        return;
    }

    rapidViewId = data.rapidViewId;
    console.log('Jira Improved: Decorate', rapidViewId);
    cache.setBucket('issueboard:' + version + ':' + rapidViewId);

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

    openTicketsToCheckForPRs = _(issues)
        .filter(function(issue) {
            return issues.length < 100 || (issue.statusName !== 'Closed' && issue.statusName !== 'Open');
        })
        .map(function(issue){
            return {
                id: issue.id,
                key: issue.key
            };
        })
        .valueOf();

    update();
    updateEpicCache();
}

module.exports = {
    decorate: decorate,
    update: update
};
