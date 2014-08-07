'use strict';

function js (AJS, GH) {
    if (!AJS || !GH) { return; }

    // jquery
    var $ = AJS.$;

    var API_URL = '/rest/api/2/';

    function fromQueryString (key) {
        var querystring = window.location.search.substring(1).split('&');
        var params = {}, pair, d = decodeURIComponent;
        for (var i = querystring.length - 1; i >= 0; i--) {
            pair = querystring[i].split('=');
            params[d(pair[0])] = d(pair[1]);
        }

        return params[key];
    }

    function addFeatureNames () {
        var rapidView = fromQueryString('rapidView');
        if (!rapidView) { return; }

        var $lastColumns = $('.ghx-columns li:last-child');
        var $lastColumnHeader = $('.ghx-column-headers li:last-child');

        function hideLastColumn() {
            $lastColumnHeader.hide();
            $lastColumns.hide();
        }

        function showLastColumn() {
            $lastColumns.show();
            $lastColumnHeader.show();
        }

        function checkLastColumn() {
            // if Hide Done is clicked, hide the last column.
            if ($lastColumns.has('div').length === 0) {
                hideLastColumn();
            } else {
                showLastColumn();
            }

        }

        $('.js-parent-drag')
            .on('mousedown.drag', showLastColumn)
            .on('mouseup.drop', checkLastColumn);

        checkLastColumn();

        GH.WorkDataLoader.getData(rapidView).done(function(data) {

            var issues = data.issuesData.issues;
            var $issues = $('.ghx-issue');

            var epics = {};

            issues.forEach(function(issue) {
                if (!issue) { return; }
                if (!issue.key) { return; }

                var $issue = $issues.filter('[data-issue-key=' + issue.key + ']');
                $issue.find('.ghx-flags').hide();
                if (issue.epic) {
                    epics[issue.epic] = epics[issue.epic] || issue.epic;
                    $issue.append('<a href="/browse/' + issue.epic + '" target="_blank" data-epic="' + issue.epic + '" title="' + issue.epic + '">' +
                        '</a>');
                }
            });

            Object.keys(epics).forEach(function(epic) {
                // https://ticket/rest/api/2/issue/XWEB-1323?fields=summary,customfield_13259,status
                var CUSTOM_FIELD_EPIC_NAME = 'customfield_13259';
                $.ajax(API_URL + 'issue/' + epic + '?fields=summary,status,' + CUSTOM_FIELD_EPIC_NAME, {
                    dataType: 'json',
                    type: 'GET'
                }).then(function(data) {
                    if (!data) { return; }
                    if (!data.fields) { return; }
                    if (!data.fields.status) { return; }
                    if (!data.fields[CUSTOM_FIELD_EPIC_NAME]) { return; }

                    $issues.find('[data-epic=' + epic + ']')
                        .addClass('ghx-label-' + data.fields.status.statusCategory.id)
                        .addClass('dylan')
                        .html(data.fields[CUSTOM_FIELD_EPIC_NAME]);

                });
            });

            // remove the silly priority we don't use
            //$('.ghx-feedback').remove();


            // must re-register in case of updates
            GH.CallbackManager.registerCallback(GH.WorkController.CALLBACK_POOL_RENDERED, 'SelectMostAppropriateIssueCallback', addFeatureNames);
        });
    }

    // To get colors, but need quickfilter so we don't query every closed feature too
    //https://ticket/rest/greenhopper/1.0/xboard/work/allData.json?rapidViewId=1023&activeQuickFilters=5283

    GH.CallbackManager.registerCallback(GH.WorkController.CALLBACK_POOL_RENDERED, 'SelectMostAppropriateIssueCallback', addFeatureNames);
}

var script = document.createElement('script');
script.textContent = '(' + (js.toString()) + ')(window.AJS, window.GH);';
document.body.appendChild(script);
