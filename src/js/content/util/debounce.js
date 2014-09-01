'use strict';

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
///http://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this;
        var args = arguments;

        window.clearTimeout(timeout);

        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) { func.apply(context, args);}
        }, wait);
        if (immediate && !timeout) { func.apply(context, args); }
    };
}

module.exports = debounce;
