'use strict';

var head = document.getElementsByTagName('head')[0];

var link = document.createElement('link');
link.type = 'text/css';
link.rel = 'stylesheet';
link.href = chrome.extension.getURL('/css/improved.css');

head.appendChild(link);

var script = document.createElement('script');
script.src = chrome.extension.getURL('/js/dist/bundle.js');

head.appendChild(script);
