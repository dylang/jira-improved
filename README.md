# Jira Improved

#### Improves the Agile and Kanban boards!

 * Text filtering on every board *Hotkey: `f`*
 * Hide the Done column if you use a quick filter to hide those tickets. 
 * Shorter page headers to give more room to the boards.

### Epic Board Improved

![screen shot 2014-08-18 at 10 43 23 am](https://cloud.githubusercontent.com/assets/51505/3952810/09ab6868-26e6-11e4-937e-65a1abe4db53.png)

 * Issue count for Blue: `Backlog`, Yellow: `In Progress`, Green: `Closed`.
 * Hover over Epic to see every issue assigned to that Epic.
 * Click on an issue to jump to that issue.

### Issue Board Improved

![screen shot 2014-08-18 at 10 43 01 am](https://cloud.githubusercontent.com/assets/51505/3952812/0b41ad40-26e6-11e4-98b4-6448ac0cb5b7.png)

 * See what Epic issues are part of.
 * Red: `Backlog`. Blue: `In Progress`. Green: `Done`. 
 * Show a Github icon for every PR associated with the ticket.
 * Closed PR's are colored green.

### Add to Chrome

[Add to Chrome](https://chrome.google.com/webstore/detail/jira-improved/mdfbpeoaadkecmpingophakekbicinip)

### Building locally

```bash
# Install dependencies
$ npm install

# Auto-rebuild and reload extension as you make changes
$ gulp 

# Increase the version and build a zip file.
$ gulp build
```


### Disclaimers

Not created owned or supported by Atlassian/Jira.

#### Should be safe to use

* This plugin will not make changes to Jira. 
* This plugin does not requrie any special permissions.
* This plugin will never ask for your username or password.
* It is safe to try on any Jira install.

Because everybody uses Jira differently I can't promise that it will work as well for you as it does for me, especially 
because I utilize some custom fields that I'm not sure are the same in every Jira install. 
Tell me what field you use and I'll see if I can auto-detect it or I'll create an options UI.

#### Custom fields

```js
var CUSTOM_FIELD_EPIC_NAME = 'customfield_13259';
var CUSTOM_FIELD_EPIC_PARENT = 'customfield_13258';
var CUSTOM_FIELD_PULL_REQUESTS = 'customfield_13153';
```

### Contributing

I accept Pull Requests.


### License

Copyright (c) 2014 Dylan Greene.

Released under the [MIT license](https://tldrlegal.com/license/mit-license).
