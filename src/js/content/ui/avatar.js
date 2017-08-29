'use strict';

var page = require('../page');
var $ = page.$;

function update() {
    $('.ghx-avatar').each(function(i, el){
        var $avatar = $(el).addClass('avatar-improved');
        var $parent = $avatar.parent('.ghx-has-avatar');
        $avatar.prependTo($parent);
        $avatar.find('[title]').tipsy();
    });
}

module.exports = {
    update: update
};
