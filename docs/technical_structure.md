The following programming practices are used in the AngularJS UiTPAS Balie app.

# General remarks
Code should be written and structured in a way that make it testable.
Never use abbreviations, use a proper IDE that can help you with code completion. Preferably, use names that explain what a certain object is, or what a method will do.


# [Services](https://docs.angularjs.org/guide/services)
Contain either:
- logic to communicate with the Silex API using a callback documented in the swagger file
- functionality to persist data between multiple controllers

# [Controllers](https://docs.angularjs.org/guide/controller)
Contain logic to let the page (ui-router state) behave as it needs to. It requests data via services, sets variables and provides methods that can be used as event handlers (mainly click and change) on the pages.
The controller-as syntax is used.

Controllers never:

- communicate directly with the Silex API
- access data in $scope or $rootScope
- inject markup

# [Directives](https://docs.angularjs.org/guide/directive)
Directives are used in case where a certain logic is tightly coupled with markup or where markup has to be repeated on multiple pages.

# [Constants](http://twofuckingdevelopers.com/2014/06/angularjs-best-practices-001-constants)

# [Scopes](https://docs.angularjs.org/guide/scope)

# [Templates](https://docs.angularjs.org/guide/templates)

# [Routing with ui-router](https://github.com/angular-ui/ui-router)

# [Testing with Jasmine](http://jasmine.github.io)

# []