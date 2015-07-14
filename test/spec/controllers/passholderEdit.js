'use strict';

describe('Controller: PassholdereditCtrl', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var PassholdereditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PassholdereditCtrl = $controller('PassholdereditCtrl', {
      $scope: scope
    });
  }));

  xit('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
