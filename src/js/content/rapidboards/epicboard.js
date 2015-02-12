'use strict';
var escape = require('escape-html');

var CUSTOMFIELDS = require('../customfields');
var api = require('../util/api');
var page = require('../page');
var $ = page.$;
var filter = require('../ui/filter');

var ticketCache = {};
var ticketCacheStarted;
var ticketCacheComplete;

function isEpic(issue) {
    return issue && (issue.typeName === 'Feature' || issue.typeName === 'Epic');
}

function projectOfIssue(issue) {
    return issue.key.replace(/-.*/, '');
}


function renderTickets() {
    Object.keys(ticketCache).forEach(function(featureKey){

        var colors = ticketCache[featureKey];

        var $featureTicket = $('[data-issue-key=' + featureKey + ']');
        var $improved = $featureTicket.find('.improved');
        if (!$improved.length) {
            $improved = $('<div class="improved"></div>').appendTo($featureTicket);
        }

        $improved
            .html('<div class="traffic-light">' +
                '<span class="jira-issue-status-lozenge-blue-gray ji-font-smaller jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short">' +
                    (colors['blue-gray'].length || '') +
                '</span>' +
                '<span class="jira-issue-status-lozenge-yellow ji-font-smaller jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short">' +
                    (colors.yellow.length || '') +
                '</span>' +
                '<span class="jira-issue-status-lozenge-green ji-font-smaller jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short">' +
                    (colors.green.length || '') +
                '</span>' +
            '</div>' +
            '<div class="issues">' +
                '<div class="issues-blue-gray">' + colors['blue-gray'].sort().join('\n') + '</div>' +
                '<div class="issues-yellow">' + colors.yellow.sort().join('\n') + '</div>' +
                '<div class="issues-green">' + colors.green.sort().join('\n') + '</div>' +
            '</div>');
    });
}

function getTickets(project, startAt) {

    if (ticketCacheStarted || ticketCacheComplete) {
        renderTickets();
        return;
    }

    ticketCacheStarted = true;

    var query = {
        startAt: startAt || 0,
        maxResults: 100,
        fields: ['summary', 'status', CUSTOMFIELDS.EPIC_PARENT].join(','),
        jql: 'issueFunction in linkedIssuesOf("project = ' + project + ' AND resolution = unresolved", "is Epic of")'
    };

    api.jql(query).then(function(data){

        if (!data) { return; }
        if (!data.issues) { return; }

        data.issues.forEach(function(issue){

            var summary = issue.fields.summary;
            var status = issue.fields.status.name;
            var color = issue.fields.status.statusCategory.colorName;

            var issueHTML = '<div><a x-status="' + status + '" href="/browse/' + issue.key + '" target="_blank" ' +
                'data-issue-key="'+ issue.key + '"' +
                'class="' +
                'jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-' + color + ' jira-issue-status-lozenge-new' +
                '">' +
                status + ' - ' +  issue.key + ' - ' + escape(summary) + '</a></div>';

            // remove duplicate which can happen during drag/drop
            // $parentTicket.find('[data-issue-key='+ issue.key + ']').remove();

            var parentTicketId = issue.fields[CUSTOMFIELDS.EPIC_PARENT];
            ticketCache[parentTicketId] = ticketCache[parentTicketId] || {
                'blue-gray': [],
                yellow: [],
                green: []
            };

            ticketCache[parentTicketId][color].push(issueHTML);

        });


        if (data.total > (data.maxResults + data.startAt)) {
            renderTickets();
            getTickets(project, data.maxResults + data.startAt);
        } else {
            ticketCacheComplete = true;
            renderTickets();
        }

        filter.filter(true);
    });
}



function decorate(data) {

    var issues = data.issuesData.issues;

    if (isEpic(issues[0])){
        var project = projectOfIssue(issues[0]);

        getTickets(project, 0);
    }
}

module.exports = {
    decorate: decorate
};
