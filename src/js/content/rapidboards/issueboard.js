'use strict';

var escape = require('escape-html');

var CUSTOMFIELDS = require('../customfields');
var api = require('../util/api');
var page = require('../page');
var $ = page.$;

var findPRs = require('../util/findPRs');
var randomRGB = require('../util/randomRGB');

var STATUS_MAP = {
    Open: 'Backlog'
};
var prRegex = /.*github.com\/.*\/pull\/.*/;

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
            $issue.find('.ghx-summary').after('<div class="epic-container"><a href="/browse/' + issue.epic + '" target="_blank" data-epic="' + issue.epic + '"></a></div>');
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

            var $epicLinks = $issues.find('[data-epic=' + epic + ']')
                .addClass('ghx-label-' + data.fields.status.statusCategory.id)
                .addClass('epic-link')
                .addClass('expanding-tag');

            $epicLinks
                .append('<span class="summary">' + escape(data.fields.summary) + '</span>')
                .append('<span class="kinda-hidden"> - ' + epic + ' - ' + status + '</span>');


            var rgbColor = $epicLinks.css('backgroundColor');
            var randomColor = randomRGB(rgbColor, data.fields.summary);
            $epicLinks.css('backgroundColor', randomColor);
        });
    });


    if (openTicketsToCheckForPRs.length) {
        openTicketsToCheckForPRs.forEach(function(issueKey) {
            var $where = $('<div class="pull-requests"><div style="clear:both"></div>').appendTo($issues.filter('[data-issue-key=' + issueKey + ']'));
            $.ajax('/rest/api/2/issue/' + issueKey + '/remotelink').then(function(data) {
                if (typeof(data) === 'string') {
                    data = JSON.parse(data);
                }
                data.forEach(function(link) {
                    if (!link.object || !link.object.url) {
                        return;
                    }
                    var isPR = prRegex.test(link.object.url);
                    if (isPR) {
                        var title = link.object.summary || link.object.title;
                        var $prlink = $('<img style="cursor: pointer; float: left; margin-right: 2px" title="' + title + '" width=16 height=16 src="' +
                            link.object.icon.url16x16 +
                            '">');
                        $prlink.on('click', function() {
                            window.open(link.object.url,'_blank');
                        });
                        $where.append($prlink);
                        $prlink.prependTo($where);
                    }
                });
            });
        });
    }
}

module.exports = {
    decorate: decorate
};
