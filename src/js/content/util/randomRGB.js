'use strict';

var seedRandom = require('seed-random');

var MAX_COLORS = 256;
var RANDOM_RANGE = 0.3;
var MAX_RANGE = Math.floor(MAX_COLORS * RANDOM_RANGE);

function randomWithinRange(start, randomFn, range) {
    var min = Math.max(start - range, 0);
    var max = Math.min(start + range, 255);
    return Math.floor(randomFn() * (max - min + 1)) + min;
}

function toArray(str) {
    var arr = str.split( ',' );
    return [
        parseInt(arr[0].substring(4)),
        parseInt(arr[1]),
        parseInt(arr[2])
    ];
}

function arrayToRGB(rgbArr){
    return 'rgb(' + rgbArr.join(', ') + ')';
}

function randomRGB(rgbStr, seed){
    var random = seedRandom(seed);
    var rangeRemaining = MAX_RANGE;
    return arrayToRGB(toArray(rgbStr)
        .reverse()
        .map(function(n){
            var randomColor = randomWithinRange(n, random, rangeRemaining);
            rangeRemaining = rangeRemaining - Math.abs(n - randomColor);
            return randomColor;
        })
        .reverse()
    );
}

module.exports = randomRGB;
