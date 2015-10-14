'use strict';

describe('Controller: PassholderRegisterController', function () {

  beforeEach(module('ubr.registration'));

  var registerController, $scope, Pass, unregisteredPass, $state, $controller, permissionError, Counter;

  function getUnregisteredPassData () {
    var unregisteredPassData = {
      'uitPas': {
        number: '0930000422202',
        kansenStatuut: false,
        status: 'ACTIVE',
        type: 'CARD',
        cardSystem: {
          name: 'UiTPAS Regio Aalst',
          id: '1'
        }
      }
    };

    return new Pass(unregisteredPassData);
  }

  function getCounter() {
    var counterData = new Counter({
      'id': '452',
      'consumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'name': 'Vierdewereldgroep Mensen voor Mensen',
      'role': 'admin',
      'actorId': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'cardSystems': {
        '1': {
          'permissions': ['registratie', 'kansenstatuut toekennen'],
          'groups': ['Geauthorizeerde registratie balies'],
          'id': 1,
          'name': 'UiTPAS Regio Aalst',
          'distributionKeys': []
        }
      },
      'permissions': ['registratie', 'kansenstatuut toekennen'],
      'groups': ['Geauthorizeerde registratie balies']
    });

    return angular.copy(counterData);
  }

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, $rootScope) {
    $controller = $injector.get('$controller');
    Pass = $injector.get('Pass');
    $state = jasmine.createSpyObj('$state', ['go']);

    unregisteredPass = getUnregisteredPassData();
    $scope = $rootScope;
    permissionError = Error('The active counter does not have the required permissions to register this UiTPAS.');
    Counter = $injector.get('Counter');
  }));

  it('should have a pass object', function () {
    registerController = $controller('PassholderRegisterController', {
      pass: unregisteredPass,
      $state: $state,
      activeCounter: getCounter()
    });

    expect(registerController.pass).toEqual(unregisteredPass);
  });

  it('should allow a counter with the right permissions to start registering a pass with kansenstatuut', function () {
    var kansenstatuutPass = getUnregisteredPassData();
    kansenstatuutPass.kansenStatuut = true;

    registerController = $controller('PassholderRegisterController', {
      pass: kansenstatuutPass,
      $state: $state,
      activeCounter: getCounter()
    });

    registerController.startRegistration();

    expect(registerController.isCounterEligible()).toBeTruthy();
    expect($state.go).toHaveBeenCalled();
  });

  it('should allow a counter to start registering a normal pass with the right permissions', function () {
    var normalPass = getUnregisteredPassData();
    normalPass.kansenStatuut = false;

    var counter = getCounter();
    counter.cardSystems[1].permissions = ['registratie'];

    registerController = $controller('PassholderRegisterController', {
      pass: normalPass,
      $state: $state,
      activeCounter: counter
    });

    registerController.startRegistration();

    expect(registerController.isCounterEligible()).toBeTruthy();
    expect($state.go).toHaveBeenCalled();
  });

  it('should not allow a counter to register a kansenstatuut pass without kansenstatuut permissions', function () {
    var kansenstatuutPass = getUnregisteredPassData();
    kansenstatuutPass.kansenStatuut = true;

    var counter = getCounter();
    counter.cardSystems[1].permissions = ['registratie'];

    registerController = $controller('PassholderRegisterController', {
      pass: kansenstatuutPass,
      $state: $state,
      activeCounter: counter
    });

    expect(registerController.isCounterEligible()).toBeFalsy();
    expect(registerController.startRegistration).toThrow(permissionError);
    expect($state.go).not.toHaveBeenCalled();
  });
});
