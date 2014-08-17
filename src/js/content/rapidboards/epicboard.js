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

function decorate(data) {

    var issues = data.issuesData.issues;

    if (isEpic(issues[0])){
        var project = projectOfIssue(issues[0]);

        api.jql('maxResults=500&fields=summary,status,' + CUSTOMFIELDS.EPIC_PARENT + '' +
            '&jql=issueFunction%20in%20linkedIssuesOf(%22project%20%3D%20' +
            project +
            '%20AND%20resolution%20%3D%20unresolved%22%2C%20%22is%20Epic%20of%22)').then(function(data){

            if (!data) { return; }
            if (!data.issues) { return; }

            data.issues.forEach(function(issue){

                var parentTicket = issue.fields[CUSTOMFIELDS.EPIC_PARENT];
                var summary = issue.fields.summary;
                var status = issue.fields.status.name;
                var color = issue.fields.status.statusCategory.colorName;

                $('[data-issue-key=' + parentTicket + ']').append('<a href="/browse/' + issue.key + '" target="_blank" class="' +
                'ji-font-smaller jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-' + color + ' jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short' +
                '" title="' + summary + '">' +
                    status + '</a>');
            });

            $('a.aui-lozenge').tipsy({opacity: 1});
        });
    }
}

module.exports = {
    decorate: decorate
};
