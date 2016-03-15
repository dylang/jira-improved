'use strict';

const cache = require('lscache');
const _ = require('lodash');
const api = require('./util/api');

// TODO - figure these out automatically
//const CUSTOM_FIELD_EPIC_NAME = 'customfield_13259';
const CUSTOM_FIELD_PULL_REQUESTS = 'customfield_13153';

let epicLink;

function getEpicLink() {
    return epicLink;
}

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

    let data;
    try {
        data = yield api.jql(query);
    } catch (err) {
        console.log('Improved: Bad JQL request for custom fields', query, err.message, err);
        return;
    }


    if (!data || !data.issues) {
        return;
    }

    const epicLinkCustomIdArray = data.issues.map(function(issue) {
        const epicLinkCustomId = _(data.issues[0].fields)
            .findKey(function(value, key){

                return key.startsWith('customfield_') &&
                    _.isString(value) &&
                    value.includes('-') &&
                    value.match(/^[A-Z]+-[0-9]+$/);
            });

        if (!epicLinkCustomId) {
            console.log('Jira Improved: No EPIC PARENT for prefix:', issue.key);
        }

        return epicLinkCustomId;

    }).filter(Boolean);

    if (_.isArray(epicLinkCustomIdArray) && epicLinkCustomIdArray[0]) {
        epicLink = epicLinkCustomIdArray[0];
        cache.set('customField:EPIC_PARENT', epicLink);
        console.log('Jira Improved: Found EPIC_PARENT:', epicLink);
    } else {
        console.log('Jira Improved: EPIC SAD: Could not guess the custom field for EPIC PARENT.');
    }

    //epicLink = epicLinkCustomId;

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
