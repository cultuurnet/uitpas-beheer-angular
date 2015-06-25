'use strict';

describe('Controller: CountersCtrl', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var CountersCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CountersCtrl = $controller('CountersCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
