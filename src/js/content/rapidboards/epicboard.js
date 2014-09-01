'use strict';

var CUSTOMFIELDS = require('../customfields');
var api = require('../util/api');
var page = require('../page');
var $ = page.$;

function isEpic(issue) {
    return issue && (issue.typeName === 'Feature' || issue.typeName === 'Epic');
}

function projectOfIssue(issue) {
    return issue.key.replace(/-.*/, '');
}

function getTickets(project, startAt) {

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


            var parentTicket = issue.fields[CUSTOMFIELDS.EPIC_PARENT];
            //var summary = issue.fields.summary;
            var status = issue.fields.status.name;
            var color = issue.fields.status.statusCategory.colorName;
            var $parentTicket = $('[data-issue-key=' + parentTicket + ']');


            var $tag = $parentTicket.find('.traffic-light .' + color);
            if (!$tag.length) {
                console.log(color, status);
            }
            var count = ($tag.data('count') || 0) + 1;
            $tag.data('count', count).addClass('jira-issue-status-lozenge-' + color);
            $tag.html(count);

            //$parentTicket.append(trafficLight);
            /*

            var tag = '<a href="/browse/' + issue.key + '" target="_blank" ' +
                    'data-status="' + status + '" ' +
                'class="' +
                        'ji-font-smaller jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-' + color + ' jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short' +
                        '" title="' + summary + '">' +
                            '1 ' + status.substring(2, 0) + '</a>';
            */
        });


        if (data.total > (data.maxResults + data.startAt)) {
            getTickets(project, data.maxResults + data.startAt);
        } else {
            $('a.aui-lozenge').tipsy({opacity: 1});
        }

    });
}

function decorate(data) {

    var issues = data.issuesData.issues;

    if (isEpic(issues[0])){
        var project = projectOfIssue(issues[0]);

        $('.ghx-issue').append('<div class="traffic-light">' +
            '<span class="blue-gray ji-font-smaller jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short"></span>' +
            '<span class="yellow ji-font-smaller jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short"></span>' +
            '<span class="green ji-font-smaller jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short"></span>' +
        '</div>');


        getTickets(project, 0);
    }
}

module.exports = {
    decorate: decorate
};
