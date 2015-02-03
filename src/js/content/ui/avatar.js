'use strict';

var page = require('../page');
var $ = page.$;



function update() {
    $('.ghx-flags').each(function(i, el){
        var $avatar = $(el);
        var $parent = $avatar.parent('.ghx-issue');
        var $newSpot = $parent.find('.ghx-issue-fields:first');
        $avatar.prependTo($newSpot);
    });
    $('.ghx-avatar').each(function(i, el){
        var $avatar = $(el);
        var $parent = $avatar.parent('.ghx-issue');
        var $newSpot = $parent.find('.ghx-issue-fields:first');
        $avatar.prependTo($newSpot);
    });
}

module.exports = {
    update: update
};
