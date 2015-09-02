'use strict';

xdescribe('Controller: PassholderRegisterController', function () {

  beforeEach(module('ubr.registration'));

  var controller, Pass, unregisteredPass, $state, Passholder, passholderService, $scope, $controller, modalInstance, counterService;

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
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    $controller = $injector.get('$controller');
    Pass = $injector.get('Pass');
    unregisteredPass = new Pass(unregisteredPassData);
    $scope = $rootScope;

    $state = $injector.get('$state');
    Passholder = $injector.get('Passholder');
    passholderService = $injector.get('passholderService');
    counterService = $injector.get('counterService');

    controller = $controller('RegistrationModalController', {
      pass: unregisteredPass,
      $state: $state,
      Passholder: Passholder,
      passholderService: passholderService,
      $modalInstance: modalInstance,
      counterService: counterService
    });
  }));

  it('should have a pass object', function () {
    expect(controller.pass).toEqual(unregisteredPass);
    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.price).toEqual(0);
  });
});
