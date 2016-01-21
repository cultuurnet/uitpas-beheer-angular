'use strict';

describe('Controller: Card Upgrade Modal', function () {

  var $controller, controller, $scope, $rootScope, counterService, passholderService, $state, $q, Pass, pass,
    $uibModalInstance, RegistrationAPIError, Counter, activeCounter, moment, cardSystem;

  beforeEach(module('ubr.passholder.cardUpgrade'));
  beforeEach(module('uitpasbeheerApp', function($provide) {
    passholderService = jasmine.createSpyObj('passholderService', ['register', 'getLastIdentification']);
    $provide.provider('passholderService', {
      $get: function () {
        return passholderService;
      }
    });

    counterService = jasmine.createSpyObj('counterService', ['getRegistrationPriceInfo']);
    $provide.provider('counterService', {
      $get: function () {
        return counterService;
      }
    });
  }));

  beforeEach(inject(function (_$controller_, $injector, _$rootScope_) {
    Pass = $injector.get('Pass');
    pass = new Pass();
    Counter = $injector.get('Counter');
    activeCounter = new Counter();
    cardSystem = {
      id: 1
    };

    $q = $injector.get('$q');
    $state = $injector.get('$state');
    moment = $injector.get('moment');
    RegistrationAPIError = $injector.get('RegistrationAPIError');
    $state.current = {
      stepNumber: 1
    };
    spyOn($state, 'go');

    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    controller = getController();
  }));

  function getController() {
    return $controller('UpgradeModalController', {
      pass: pass,
      $state: $state,
      passholderService: passholderService,
      $uibModalInstance: $uibModalInstance,
      counterService: counterService,
      RegistrationAPIError: RegistrationAPIError,
      $rootScope: $rootScope,
      $scope: $scope,
      $q: $q,
      activeCounter: activeCounter,
      moment: moment,
      cardSystem: cardSystem
    });
  }

  it('can determine which modal flow to used based on card system', function () {

  });
});
