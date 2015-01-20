'use strict';

var page = require('../page');
var $ = page.$;



function update() {
    $('.ghx-avatar').each(function(i, el){
        var $avatar = $(el);
        var $parent = $avatar.parent('.ghx-has-avatar');
        $avatar.prependTo($parent);
    });
}

module.exports = {
    update: update
};
