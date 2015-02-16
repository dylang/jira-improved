'use strict';

var fromQueryString = require('./util/fromQueryString');
var rapidViewID = fromQueryString('rapidView');

var AJS = window.AJS;
var GH = window.GH;
var $ = AJS && AJS.$;

var enabled;

if (rapidViewID &&
    AJS &&
    GH &&
    GH.CallbackManager &&
    $) {
    enabled = true;
}

// gh.work.pool.rendered

function changed(fn) {
    if (enabled) {
        GH.CallbackManager.registerCallback(GH.WorkController.CALLBACK_POOL_RENDERED, 'SelectMostAppropriateIssueCallback', fn);
    }
}

module.exports = {
    AJS: AJS,
    GH: GH,
    $: $,
    rapidViewID: rapidViewID,
    changed: changed
};
