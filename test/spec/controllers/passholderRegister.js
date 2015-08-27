'use strict';

xdescribe('Controller: PassholderRegisterController', function () {

  // load the controller's module
  beforeEach(module('ubr.registration'));

  var controller, $scope, Pass, unregisteredPass;

  var unregisteredPassData = {
    'uitPas': {
      number: '0930000422202',
      kansenStatuut: false,
      status: 'ACTIVE',
      type: 'CARD'
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, $rootScope) {
    Pass = $injector.get('Pass');
    unregisteredPass = new Pass(unregisteredPassData);
    $scope = $rootScope;
    controller = $controller('PassholderRegisterController', {
      pass: unregisteredPass
    });
  }));

  it('should have a pass object', function () {
    expect(controller.pass).toEqual(unregisteredPass);
  });
});
