# File system layout
 The 
 
## [App](files_app.md)
 Contains all the files required to develop the app.
## Bower_components
 Contains all the packages / external libraries installed by the [Bower](http://bower.io) package manager.

 You should never commit the contents of this directory to the source code repository [^1]. Instead, you manage the exact versions of the dependencies with bower.json and package.json.

[^1] An entry in .gitignore excludes the entire vendor directory from version control.

## Coverage
 Contains a generated [PhantomJS](http://phantomjs.org) [unit test](../development/unit_tests.md) code coverage report
 
## Dist
 Contains the code generated by `grunt build`, this code resembles the production code the most
 
## Node_modules
 Contains the required [npm](https://www.npmjs.com) packages for the development environment
 
## Test
 Contains the [Jasmine](http://jasmine.github.io) unit tests