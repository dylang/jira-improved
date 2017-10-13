'use strict';

const _ = require('lodash');
var co = require('co');

const escape = require('escape-html');

const CUSTOMFIELDS = require('../customfields');
const FIELDS = ['summary', 'status']; //, CUSTOMFIELDS.EPIC_NAME];

const api = require('../util/api');
const page = require('../page');
const $ = page.$;

const findPRs = require('../util/findPRs');
const randomRGB = require('../util/randomRGB');

const cache = require('lscache');

const STATUS_MAP = {
    Open: 'Backlog'
};

let epics;
let openTicketsToCheckForPRs;

function renderPullRequests(issueKey, prString) {

    if (!issueKey || !prString) {
        return;
    }

    const $issue = $('[data-issue-key=' + issueKey + ']:not(.ghx-swimlane-header):not(.ghx-parent-group)');

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

                    console.log(issueKey, pullRequest.api, err);

                    if (err.status === 0) { return; }

                    $('[data-pr="' + pullRequest.api + '"')
                        .removeClass('pull-request-unknown')
                        .addClass('pull-request-error');
                });
            }

            if (pullRequest.favIcon) {
                $where.append('<a href="' + pullRequest.url + '" target="_blank" title="' + pullRequest.url + '" ' +
                    'class="pull-request-other">' +
                    '<img src="' + pullRequest.favIcon + '" onerror="this.parentElement.classList.add(\'broken-image\');">' +
                    '<span class="ghx-avatar-img" style="background-color: ' + randomRGB('rgb(32,115,150)', pullRequest.host) +'">' + pullRequest.host.substring(0, 2) +'</span>' +
                    '</a>');
            }
        });
    }
}

function renderLabels(issueKey, labels) {

    if (!labels || !labels.length) {
        return;
    }

    const $issueKey = $('.ghx-issue[data-issue-key=' + issueKey + ']');
    let $labelContainer = $issueKey.find('.labelContainer');

    if (!$labelContainer.length) {
        $labelContainer = $('<div class="label-container">').appendTo($issueKey);
    }

    $labelContainer.html(
        '<span class="kinda-hidden">labels</span>' +
        labels.map(function(label) {
            return '<span class="label" style="background-color: ' + randomRGB('rgb(245, 245, 245)', label) +'">' + label + '</span>';
        }).join(''));
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
        .filter('.ghx-issue') // only issues, not parents of structure issues
        .not(':has(.epic-container)')
        //.not(':has([data-epickey="' + epicId + '")]')
        .append('<div class="epic-container">' +
            '<a href="/browse/' + epicId + '" ' +
                'class="ghx-label-' + epic.statusId + ' epic-link expanding-tag originalColor" ' +
                'title="' + epicId + ' - ' + epic.status + '"' +
                'target="_blank" data-epic="' + epicId + '">' +
                '<span class="summary ' + (epic.status === 'Closed' ? 'closed' : '') + '">' +
                    '<span class="summary-text">' + escape(epic.summary) + '</span>' +
                '</span>' +
                '<span class="kinda-hidden"> - ' + epicId + ' - ' + epic.status + '</span>' +
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
        .css('backgroundColor', randomColor)
        .tipsy();
}

function updateEpicCache() {
    _.forEach(epics, function(issueKeys, epicId) {

        co(function* (){
            let data = yield api.issue(epicId, FIELDS);

            if (!data || !data.fields || !data.fields.status || !data.fields.summary) { return; }

            let summary = data.fields.summary.trim();
            /*let alternateSummary = (data.fields[CUSTOMFIELDS.EPIC_NAME] || summary).trim();

            if (summary.toLocaleLowerCase() !== alternateSummary.toLocaleLowerCase()) {
                console.log('Mismatched names!');
                console.log(epicId, ' > ', data.fields.summary);
                console.log(epicId, ' > ', data.fields[CUSTOMFIELDS.EPIC_NAME]);
                if (alternateSummary.length < summary.length) {
                    [ summary, alternateSummary ]  = [ alternateSummary, summary ];
                }
            } else {
                alternateSummary = '';
            }*/

            cache.set(epicId, {
                            status: STATUS_MAP[data.fields.status.name] || data.fields.status.name,
                            statusId: data.fields.status.statusCategory.id,
                            summary: summary,
                            //alternateSummary: alternateSummary,
                            issueKeys: issueKeys
                        });

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
            const prStatusUrl = `/rest/dev-status/1.0/issue/detail?issueId=${ issue.id }&applicationType=githubenterprise&dataType=pullrequest`;

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
            //$('.pull-requests').remove();

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

function checkCustomFieldForPullRequests(ticketsToCheck = openTicketsToCheckForPRs){

    if (!ticketsToCheck || !ticketsToCheck.length) {
        return;
    }

    console.log('Jira Improved: checkCustomFieldForPullRequests', ticketsToCheck.length);

    const issues = _.pluck(ticketsToCheck, 'key')
        .splice(0, 20)
        .join(' OR issue=');
    const query = {
        maxResults: 500,
        jql: 'issue=' + issues + ' AND ' +
            // move detection to separate module
            (document.location.hostname === 'ticket.opower.com' ? '(labels is not EMPTY OR "Code Review URL(s)" is not EMPTY)' :
            'labels is not EMPTY'),
        fields: ['labels', 'description', CUSTOMFIELDS.PULL_REQUESTS].join(',')
    };

    co(function* (){
        let data = yield api.jql(query);

        if (!data || !data.issues) {
            return;
        }

        const labels = _(data.issues)
            .map(function(issue){
                const labels = issue.fields.labels;

                if (!labels || !labels.length) {
                    return;
                }

                return {
                    key: issue.key,
                    labels: labels
                };
            })
            .compact()
            .valueOf();

        const pullRequests = _(data.issues)
            .map(function(issue){
                //const pullRequests = issue.fields.description; //[CUSTOMFIELDS.PULL_REQUESTS];
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

        if (labels.length) {
            //$('.improved-labels').remove();

            _.forEach(labels, function(issue){
                renderLabels(issue.key, issue.labels);
            });

            //cache.set('pull-requests', pullRequests);
            //cache.set('hasCustomFieldPRs', true);
        }

        if (pullRequests.length) {
            //$('.pull-requests').remove();

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

    checkCustomFieldForPullRequests(ticketsToCheck.splice(20));
}

function updatePRs() {
    if (!openTicketsToCheckForPRs) {
        return;
    }

    const cachedPullRequests = cache.get('pull-requests');

    _.forEach(cachedPullRequests, function(issue){
        renderPullRequests(issue.key, issue.pullRequests);
    });

    checkCustomFieldForPullRequests();
    checkDevStatusForPullRequests();
}

function update(){
    if (epics) {
        // Show the cached value if there is one
        _.forEach(epics, function(issueKeys, epicId) {
            renderEpic(epicId);
        });
    }

   updatePRs();
}


function decorate(data) {
    if (!data.rapidViewId || !data.issuesData || !data.issuesData.issues) {
        console.log('not enough info for decorate', data);
        return;
    }

    const issues = _(data.issuesData.issues)
        .filter('key')
        .reject({typeName: 'Feature'})
        .reject({typeName: 'Epic'})
        .valueOf();

    if (!issues.length) {
        return;
    }

    epics = _(issues)
        .filter('epic')
        .reduce(function(acc, issue){
            let epic = issue.epic;
            let issueKey = issue.key;
            acc[epic] = acc[epic] || [];
            acc[epic].push(issueKey);
            return acc;
        }, {})
        .valueOf();

    openTicketsToCheckForPRs = _(issues)
        .filter(function(issue) {
            return issues.length < 100 || (issue.statusName !== 'Closed');
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
