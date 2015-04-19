'use strict';

const cache = require('lscache');
const _ = require('lodash');
const api = require('./util/api');

// TODO - figure these out automatically
//const CUSTOM_FIELD_EPIC_NAME = 'customfield_13259';
const CUSTOM_FIELD_PULL_REQUESTS = 'customfield_13153';

let epicLink;

function* guessEpicLinkCustomField() {

    if (getEpicLink()) {
        epicLink = cache.get('customField:EPIC_PARENT');
        return;
    }

    const query = {
        startAt: 0,
        maxResults: 1,
        jql: 'issueFunction in linkedIssuesOf("resolution = unresolved", "is Epic of")'
    };

    const data = yield api.jql(query);

    if (!data || !data.issues) {
        return;
    }

    const prefix = data.issues[0].key.split('-')[0];
    const epicLinkCustomId = _(data.issues[0].fields)
        .findKey(function(value, key){
            return key.startsWith('customfield_') &&
                _.isString(value) &&
                value.startsWith(prefix + '-');
        })
        .valueOf();

    if (!epicLinkCustomId) {
        console.log('Jira Improved: Sad Face: Could not guess the custom field for EPIC PARENT.');
    }

    epicLink = epicLinkCustomId;
    cache.set('customField:EPIC_PARENT', epicLinkCustomId);
}

function getEpicLink() {
    return epicLink;
}


function* init() {
    yield [guessEpicLinkCustomField];
}

module.exports = {
    init: init,
    epicLink: getEpicLink,
    //EPIC_NAME: CUSTOM_FIELD_EPIC_NAME,
    PULL_REQUESTS: CUSTOM_FIELD_PULL_REQUESTS
};
