# App
 Contains all the files that make up the application. You should work in this directory.
 Most directory names are self-explanatory.
 
 ## Index.html
 This main HTML file ties the app together. It provides the main `ui-view` which includes child views. All javascript files need to be included here. Bower_components are add by bower. Every script file you add to the app should also be added to this file.

---
## Scripts
 Contains all the javascript files. The files are grouped together conceptually as [modules](angular_module_structure.md).
 
 The folder _passholder_ contains all the files that deal with the passholder. Subfolders are used for large fractions of functionality.

### Special script files
* `app.js`: The main angular module. Injects all other modules. Contains general ui-router states. Every module you add should be added as a dependency to this module.
* `config.js`: Is generated during `grunt build` and filled with the configuration data from `config.dist.json` or `config.json`

### Scipts/utilities
 Contains functionality that is used across the multiple controllers. Some files of more importance are:

* `app.controller.js`: Contains general routing and authentication functionality.
* `day.factory.js`: Creates moment objects from date strings.Circumvents a bug in JavaFX: https://bugs.openjdk.java.net/browse/JDK-8090098. Also see: https://jira.uitdatabank.be/browse/UBR-212. This might become obsolete.
* `uitpas-router.service.js`: Contains redirection logic based on UiTPAS type and status.

---
## Styles
 Contains all the [Sass](http://sass-lang.com) .scss files for styling.
 
 Read more about [styling and markup](../development/styling_and_markup.md).

---
## Views
 Contains all the template files used in the app states.
 
 Template file names should be as self-explanatory as possible.

Examples:

| File name | What it is |
| -- | -- |
| modal-more-info.html | The markup used in the _more info_ modal |
| content-help.html | The help information show in the content area |
| sidebar-passholder-details.html | The passholder details that are shown in the sidebar |


