'use strict';

xdescribe('Controller: PassholderRegisterController', function () {


  var registerController, $scope, Pass, unregisteredPass, $state, Passholder, passholderService, $controller;

  var unregisteredPassData = {
    'uitPas': {
      number: '0930000422202',
      kansenStatuut: false,
      status: 'ACTIVE',
      type: 'CARD'
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, $rootScope) {
    $controller = $injector.get('$controller');
    Pass = $injector.get('Pass');
    unregisteredPass = new Pass(unregisteredPassData);
    $scope = $rootScope;

    $state = $injector.get('$state');
    Passholder = {'pass': 'holder'};
    passholderService = $injector.get('passholderService');

    registerController = $controller('PassholderRegisterController', {
      pass: unregisteredPass,
      $state: $state,
      Passholder: Passholder,
      passholderService: passholderService
    });
  }));

  it('should have a pass object', function () {
    expect(registerController.pass).toEqual(unregisteredPass);
  });
});
