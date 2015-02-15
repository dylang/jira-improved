'use strict';
const co = require('co');
const _ = require('lodash');

const escape = require('escape-html');

const CUSTOMFIELDS = require('../customfields');
const api = require('../util/api');
const page = require('../page');
const $ = page.$;
const filter = require('../ui/filter');

const version = require('../../../manifest.json').version;
const cache = require('ls-cache').createBucket('epicboard:' + CUSTOMFIELDS.EPIC_PARENT + version);

let project;

function isEpic(issue) {
    return issue && (issue.typeName === 'Feature' || issue.typeName === 'Epic');
}

function projectOfIssue(issue) {
    return issue.key.replace(/-.*/, '');
}

function buildIssue(issue) {
    return '<div><a x-status="' + issue.status + '" href="/browse/' + issue.key + '" target="_blank" ' +
        'data-issue-key="' + issue.key + '"' +
        'class="' +
        'jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-' + issue.color + ' jira-issue-status-lozenge-new' +
        '">' +
        issue.status + ' - ' + issue.key + ' - ' + escape(issue.summary) + '</a></div>';
}

function buildIssues(issues) {
    return _(issues)
        .values()
        .sortByAll(['status', 'key'])
        .map(buildIssue)
        .join('\n');
}

function buildLight(colors, color) {
    return '<span class="jira-issue-status-lozenge-' + color + ' ji-font-smaller jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short">' +
                (_.keys(colors[color]).length || '') +
            '</span>';
}

function renderTickets(epics) {

    _.map(epics, function(colors, epicKey){

        let $featureTicket = $('[data-issue-key=' + epicKey + ']');
        let $improved = $featureTicket.find('.improved');
        if (!$improved.length) {
            $improved = $('<div class="improved"></div>').appendTo($featureTicket);
        }

        $improved
            .html('<div class="traffic-light">' +
                buildLight(colors, 'blue-gray') +
                buildLight(colors, 'yellow') +
                buildLight(colors, 'green') +
            '</div>' +
            '<div class="issues">' +
                '<div class="issues-blue-gray">' + buildIssues(colors['blue-gray']) + '</div>' +
                '<div class="issues-yellow">' + buildIssues(colors.yellow) + '</div>' +
                '<div class="issues-green">' + buildIssues(colors.green) + '</div>' +
            '</div>');
    }).valueOf();
}

function processIssues(issues) {
    return _.transform(issues, function(result, issue) {
        let parentKey = issue.fields[CUSTOMFIELDS.EPIC_PARENT];
        let color = issue.fields.status.statusCategory.colorName;

        result[parentKey] = result[parentKey] || {};
        result[parentKey][color] = result[parentKey][color] || {};

        result[parentKey][color][issue.key] = {
            key: issue.key,
            color: color,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            cacheDate: new Date()
        };

        return result;
    }, {}).valueOf();
}

function getTickets(project, startAt, acc) {
    /*
    if (ticketCacheStarted || ticketCacheComplete) {
    renderTickets();
    return;
    }
    */

    if (!project) {
        throw new Error('project is not valid: ' + project);
    }

    let query = {
        startAt: startAt || 0,
        maxResults: 100,
        fields: ['summary', 'status', CUSTOMFIELDS.EPIC_PARENT].join(','),
        jql: 'issueFunction in linkedIssuesOf("project = ' + project + ' AND resolution = unresolved", "is Epic of")'
    };

    co(function* () {
        let data = yield api.jql(query);

        if (!data || !data.issues) {
            return;
        }

        let allProcessedData = _.merge(acc, processIssues(data.issues), {});

        if (data.total > (data.maxResults + data.startAt)) {
            if (!cache.get(project)) {
                renderTickets(allProcessedData);
                filter.filter(true);
            }

            return getTickets(project, data.maxResults + data.startAt, allProcessedData);
        }

        renderTickets(allProcessedData);
        filter.filter(true);
        cache.set(project, allProcessedData, 10000);
        console.log('Jira Improved: all tickets complete');

    }).catch(function(err) { console.error(err.stack); });
}

function decorate(data) {
    let issues = data.issuesData.issues;

    if (isEpic(issues[0])){
        project = projectOfIssue(issues[0]);

        let previousData = cache.get(project);
        renderTickets(previousData);
        getTickets(project, 0, {});
    }
}

function update(){
    if (!project) {
        return;
    }
    renderTickets(cache.get(project));
}

module.exports = {
    decorate: decorate,
    update: update
};
