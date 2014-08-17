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
