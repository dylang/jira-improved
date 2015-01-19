'use strict';

var page = require('../page');
var $ = page.$;



function init() {
    $('.ghx-avatar').each(function(i, el){
        var $avatar = $(el);
        var $parent = $avatar.parent('.ghx-has-avatar');
        $avatar.prependTo($parent);
        console.log('avatar moved');
    });
}

module.exports = {
    init: init
};
