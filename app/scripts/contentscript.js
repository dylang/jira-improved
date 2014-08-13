'use strict';

function js (AJS, GH) {
    if (!AJS || !GH) { return; }

    console.log('(((============ JIRA IMPROVED ADDED ==============)))');

    // jquery
    var $ = AJS.$;

    var API_PREFIX = window.location.pathname.replace('/secure/RapidBoard.jspa', '');

    var API_URL = API_PREFIX + '/rest/api/2/';
    var STATUS_MAP = {
        Open: 'Backlog'
    };

    /**
     * To get info about the board you are looking at
     * https://ticket.opower.com/rest/greenhopper/1.0/rapidviewconfig/editmodel.json?rapidViewId=1023
     *
     * To get all tickets for open epics
     * https://ticket.opower.com/rest/api/2/search?maxResults=400&fields=status,customfield_13258&jql=issueFunction%20in%20linkedIssuesOf(%22project%20%3D%20XWEB%20AND%20resolution%20%3D%20unresolved%22%2C%20%22is%20Epic%20of%22)
     * but you have to know the what to search for
     *
     * More functions
     * https://jamieechlin.atlassian.net/wiki/display/GRV/Scripted+JQL+Functions
     */

    /**
     *
     * LOCAL STORAGE CACHING
     * still a little buggy
     *
    window.onerror = false;
    GH.Exception.handleJsException = function(err){debugger; throw err;};

    $.ajaxTransport("json", function(options){
           var cacheKey = options.cacheKey ||
               options.url.replace(/jQuery.*
               /, '') + (options.type || 'GET') + (options.data || '');
           var storage = window.localStorage;

           var value = storage.getItem(cacheKey);
           if (value){
               console.log('>>>>>>> LOADED FROM CACHE!!!', options.url);

               // In the cache? Get it, parse it to json, call the completeCallback with the fetched value.
               if (options.dataType.indexOf( 'json' ) === 0) value = JSON.parse(value);
               return {
                   send: function(headers, completeCallback) {
                       completeCallback(200, 'success', {json:value})
                   },
                   abort: function() {
                       console.log("Aborted ajax transport for json cache.");
                   }
               };
           } else {
               console.log('$$$$$$ CACHE MISS', options.url);
           }
    });
    **/

    /**
     * Prefilter for caching ajax calls - adapted from
     * https://github.com/paulirish/jquery-ajax-localstorage-cache, made to work with jqXHR Deferred Promises.
     * See also $.ajaxTransport.
     * New parameters available on the ajax call:
     * localCache   : true,        // required if we want to use the cache functionality
     * cacheTTL     : 1,           // in hours. Optional
     * cacheKey     : 'post',      // optional
     * isCacheValid : function  // optional - return true for valid, false for invalid
     * @method $.ajaxPrefilter
     * @param options {Object} Options for the ajax call, modified with ajax standard settings
     */
    /**
    $.ajaxPrefilter(function(options){
        var storage = window.localStorage;

        options.cache = true;

        var hourstl = options.cacheTTL || 1;

        var cacheKey = options.cacheKey ||
            options.url.replace( /jQuery.*
            /,'' ) + (options.type || 'GET') + (options.data || '');

        // isCacheValid is a function to validate cache
        if ( options.isCacheValid && !options.isCacheValid() ){
            storage.removeItem( cacheKey );
        }
        // if there's a TTL that's expired, flush this item
        var ttl = storage.getItem(cacheKey + 'cachettl');
        if ( ttl && ttl < +new Date() ){
            storage.removeItem( cacheKey );
            storage.removeItem( cacheKey + 'cachettl' );
            ttl = 'expired';
        }

        var value = storage.getItem( cacheKey );
        if ( !value ){
            // If it not in the cache, we store the data, add success callback - normal callback will proceed
            if ( options.success ) {
                options.realsuccess = options.success;
            }
            options.success = function( data ) {
                var strdata = data;
                if ( this.dataType.indexOf( 'json' ) === 0 ) strdata = JSON.stringify( data );

                // Save the data to storage catching exceptions (possibly QUOTA_EXCEEDED_ERR)
                try {
                    storage.setItem( cacheKey, strdata );
                } catch (e) {
                    // Remove any incomplete data that may have been saved before the exception was caught
                    storage.removeItem( cacheKey );
                    storage.removeItem( cacheKey + 'cachettl' );
                }

                if ( options.realsuccess ) options.realsuccess( data );
            };

            // store timestamp
            if ( ! ttl || ttl === 'expired' ) {
                storage.setItem( cacheKey + 'cachettl', +new Date() + 1000 * 60 * 60 * hourstl );
            }
        }
    });
    */

    function fromQueryString (key) {
        var querystring = window.location.search.substring(1).split('&');
        var params = {}, pair, d = decodeURIComponent;
        for (var i = querystring.length - 1; i >= 0; i--) {
            pair = querystring[i].split('=');
            params[d(pair[0])] = d(pair[1]);
        }

        return params[key];
    }

    var matchUrls = new RegExp('((http|https):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))','g');

    function processPullRequests(str) {
        if (!str || str.length === 0) { return; }

        var urls = str.match(matchUrls);

        // URL: https://github.com/x-web/x-web-canonical-lookup/pull/35
        // API: https://github.com/api/v3/repos/x-web/x-web-canonical-lookup/pulls/35

        return urls.map(function(url){
            return {
                url: url,
                api: url
                    .replace(/(\/\/[^/]*)/, '$1/api/v3/repos')
                    .replace('/pull/', '/pulls/')
            };
        });
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
            .draggable({
                distance: 2,
                start: showLastColumn,
                stop: checkLastColumn
            });

        checkLastColumn();

        GH.WorkDataLoader.getData(rapidView).done(function(data) {

            var issues = data.issuesData.issues;
            var $issues = $('.ghx-issue');

            var epics = {};
            var openTicketsToCheckForPRs = [];

            if (issues[0] && (issues[0].typeName === 'Feature' || issues[0].typeName === 'Epic')){
                var CUSTOM_FIELD_EPIC_PARENT = 'customfield_13258';
                var project = issues[0].key.replace(/-.*/, '');

                $.ajax(API_URL + 'search?maxResults=500&fields=summary,status,' + CUSTOM_FIELD_EPIC_PARENT + '' +
                    '&jql=issueFunction%20in%20linkedIssuesOf(%22project%20%3D%20' +
                    project +
                    '%20AND%20resolution%20%3D%20unresolved%22%2C%20%22is%20Epic%20of%22)', {
                    dataType: 'json',
                    type: 'GET'
                }).then(function(data){

                    if (!data) { return; }
                    if (!data.issues) { return; }

                    data.issues.forEach(function(issue){

                        var parentTicket = issue.fields[CUSTOM_FIELD_EPIC_PARENT];
                        var summary = issue.fields.summary;
                        var status = issue.fields.status.name;
                        var color = issue.fields.status.statusCategory.colorName;

                        $('[data-issue-key=' + parentTicket + ']').append('<a href="/browse/' + issue.key + '" target="_blank" class="' +
                        'jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-' + color + ' jira-issue-status-lozenge-new jira-issue-status-lozenge-max-width-short' +
                        '" title="' + summary + '">' +
                            status + '</a>');
                    });

                });
            }



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
                $issue.find('.ghx-flags').hide();
                if (issue.epic) {
                    epics[issue.epic] = epics[issue.epic] || issue.epic;
                    $issue.append('<a href="/browse/' + issue.epic + '" target="_blank" data-epic="' + issue.epic + '" title="' + issue.epic + '">' +
                        '</a>');
                }
            });

            Object.keys(epics).forEach(function(epic) {
                var CUSTOM_FIELD_EPIC_NAME = 'customfield_13259';
                $.ajax(API_URL + 'issue/' + epic + '?fields=summary,status,' + CUSTOM_FIELD_EPIC_NAME, {
                    dataType: 'json',
                    type: 'GET'
                }).then(function(data) {
                    if (!data) { return; }
                    if (!data.fields) { return; }
                    if (!data.fields.status) { return; }
                    if (!data.fields.summary) { return; }

                    if (data.fields.summary !== data.fields[CUSTOM_FIELD_EPIC_NAME]) {
                        console.log('Missmatch names!');
                        console.log(epic, ' > ', data.fields.summary);
                        console.log(epic, ' > ', data.fields[CUSTOM_FIELD_EPIC_NAME]);
                    }

                    var status = STATUS_MAP[data.fields.status.name] || data.fields.status.name;

                    $issues.find('[data-epic=' + epic + ']')
                        .addClass('ghx-label-' + data.fields.status.statusCategory.id)
                        .addClass('dylan')
                        .append('<span class="status">' + status + '</span>')
                        .append('<span class="summary">' + data.fields.summary + '</span>');

                });
            });

            if (openTicketsToCheckForPRs.length) {
                var CUSTOM_FIELD_PULL_REQUESTS = 'customfield_13153';

                var query = openTicketsToCheckForPRs.join('%20OR%20issue%3D');

                $.ajax(API_URL + 'search?jql=issue%3D' + query + '%20AND%20(labels%20is%20not%20empty%20OR%20"Code%20Review%20URL(s)"%20is%20not%20EMPTY)&fields=labels,' + CUSTOM_FIELD_PULL_REQUESTS, {
                    dataType: 'json',
                    type: 'GET'
                }).then(function(data) {
                    if (!data) {
                        return;
                    }
                    if (!data.issues) {
                        return;
                    }

                    data.issues.forEach(function(issue){
                        var pullRequests = processPullRequests(issue.fields[CUSTOM_FIELD_PULL_REQUESTS]);

                        if (pullRequests) {
                            var $where = $issues.filter('[data-issue-key=' + issue.key + ']').append('<div class="pull-requests">');
                            pullRequests.forEach(function(pullRequest) {

                                $where.append('<a href="' + pullRequest.url + '" target="_blank">' +
                                    '<span data-pr="' + pullRequest.api + '" class="pull-request pull-request-unknown"></span>' +
                                    '</a>');

                                $.ajax(pullRequest.api, {
                                    dataType: 'json',
                                    type: 'GET'
                                }).then(function(data) {
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
                });
            }

            // must re-register in case of updates
            GH.CallbackManager.registerCallback(GH.WorkController.CALLBACK_POOL_RENDERED, 'SelectMostAppropriateIssueCallback', addFeatureNames);
        });
    }
    GH.CallbackManager.registerCallback(GH.WorkController.CALLBACK_POOL_RENDERED, 'SelectMostAppropriateIssueCallback', addFeatureNames);
}

var script = document.createElement('script');
script.textContent = '(' + (js.toString()) + ')(window.AJS, window.GH);';
document.body.appendChild(script);
