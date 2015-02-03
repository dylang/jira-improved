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
    $('.ghx-extra-field').each(function(i, el){
        var $parent = $(el);
        if ($parent.attr('data-tooltip').indexOf('Component') >= 0) {
            var $comps = $parent.find('.ghx-extra-field-content');
            $comps.each(function(i, node) {
                
                var compName = node.innerText;
                node.outerHTML = '<a class="repolink" style="pointer-events:auto;" href="https://github.com/Workiva/' +
                    compName + '">' + compName + '</a>';
                $parent.find('.repolink').on('click', function(ev) {
                    var el = ev.target;
                    window.open(el.href, '_blank');
                })
            });
        }
    });
    
}

module.exports = {
    update: update
};
