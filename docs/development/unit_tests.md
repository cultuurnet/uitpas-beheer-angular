# Unit tests

Unit tests are done with [Jasmine](http://jasmine.github.io).

A test coverage report is generated when `grunt karma` is run. This can be found inside the `coverage` folder.

The test coverage percentage should be as high as possible. Some parts of module files are currently not testable.

Tests should be written to be granular. Only test functionality in one layer of the application. Spy objects can be used to separate dependencies.

E.g:

* In a controller, only test what happens in the controller. Create a Spy object for the service and its used methods, that return what is expected.
* Use the `$httpBackend` object to fake the calls in the services to the Silex API.

You can read [this article](https://medium.com/2dotstwice-connecting-the-dots/testing-with-angular-promises-using-jasmine-341accc658d2) for more information about testing with promises in Jasmine.

