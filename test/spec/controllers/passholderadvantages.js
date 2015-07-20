'use strict';

describe('Controller: PassholderAdvantagesController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var PassholderadvantagesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PassholderadvantagesCtrl = $controller('PassholderAdvantagesController', {
      $scope: scope
    });
  }));
});
