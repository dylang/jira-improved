'use strict';

var head = document.getElementsByTagName('head')[0];

var link = document.createElement('link');
link.type = 'text/css';
link.rel = 'stylesheet';
link.href = chrome.extension.getURL('../styles/improved.css');

head.appendChild(link);

var script = document.createElement('script');
script.src = chrome.extension.getURL('../scripts/improved.js');

head.appendChild(script);
