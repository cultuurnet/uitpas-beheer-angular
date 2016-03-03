# Angular module structure

Conceptual parts of the application are grouped as [Angular modules](https://docs.angularjs.org/guide/module).

## Module file
 Each module contains a file that defines the module, with the name `urb.{concept}.module.js`

 Ui-router states are defined in the `.module.js` file. Unit testing of this file is not possible so the functionality in this file should be kept to the absolute minimum.

## [Services](https://docs.angularjs.org/guide/services)
 Contain either:
 
- Logic to communicate with the Silex API using a callback documented in the swagger file
- Functionality to persist data between multiple controllers

## [Controllers](https://docs.angularjs.org/guide/controller)
 Contain logic to let the page (ui-router state) behave as it needs to. It requests data via services, sets variables and provides methods that can be used as event handlers (mainly click and change) on the pages.
The controller-as syntax is used.

Controllers never:

- Communicate directly with the Silex API
- Access data in $scope or $rootScope
- Inject markup

## [Directives](https://docs.angularjs.org/guide/directive)
 Directives are used in case where a certain logic is tightly coupled with markup, or where markup has to be repeated on multiple pages.

## [Constants](http://twofuckingdevelopers.com/2014/06/angularjs-best-practices-001-constants)


