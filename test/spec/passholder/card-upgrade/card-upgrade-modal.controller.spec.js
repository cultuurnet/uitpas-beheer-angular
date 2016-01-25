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

  var jsonUitpasBase = {
    'number': '0930000422202',
    'kansenStatuut': false,
    'status': 'ACTIVE',
    'type': 'CARD',
    cardSystem: {
      name: 'UiTPAS Regio Aalst',
      id: '1'
    }
  };

  var jsonPassholderBase = {
    'name': {
      'first': 'Victor',
      'last': 'DHooghe'
    },
    'address': {
      'street': 'Baanweg 60',
      'postalCode': '9308',
      'city': 'Aalst'
    },
    'birth': {
      'date': '2007-11-15',
      'place': 'Aalst'
    },
    'gender': 'MALE',
    'nationality': 'belg',
    'privacy': {
      'email': false,
      'sms': false
    },
    'contact': {
      'email': 'email@email.com'
    },
    kansenStatuten: [{
      status: 'ACTIVE',
      endDate: '2015-12-06',
      cardSystem: {
        name: 'UiTPAS Regio Aalst',
        id: '1'
      }
    }],
    'points': 309,
    'remarks': 'remarks',
    'uid': 'e1e2b335-e756-4e72-bb0f-3d163a583b35',
    'uitpassen': [
      {
        'number': '0930000422202',
        'kansenStatuut': false,
        'status': 'ACTIVE',
        'type': 'CARD',
        'cardSystem': {
          name: 'UiTPAS Regio Aalst',
          id: '1'
        }
      }
    ]
  };

  function getJsonPassWithPassholder() {
    return {
      'uitPas': angular.copy(jsonUitpasBase),
      'passHolder': angular.copy(jsonPassholderBase)
    };
  }

  var jsonCounter = {
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
  };

  function getJsonCounter(){
    return angular.copy(jsonCounter);
  }

  beforeEach(inject(function (_$controller_, $injector, _$rootScope_) {
    Pass = $injector.get('Pass');
    pass = new Pass(getJsonPassWithPassholder());
    Counter = $injector.get('Counter');
    activeCounter = new Counter(getJsonCounter());
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
    $uibModalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

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
    expect(controller.modalFlow).toBe('AUTHORIZED_COUNTER');

    controller.showModalFlowForCardSystem(100);
    expect(controller.modalFlow).toBe('UNAUTHORIZED_COUNTER');
    expect(controller.upgradeData.withNewCard).toBe('NEW_CARD');
  });

  it('can dismiss the modal', function () {
    controller.close();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });

  it('can submit the kansenstatuut form', function () {

  });

  it('should not submit the kansenstatuut form when there are errors', function () {

  });

  it('should should set error feedback in the kansenstatuut form', function () {

  });

  it('can submit the new card form', function () {

  });

  it('should not submit the new card form when there are errors', function () {

  });

  it('should should set error feedback in the new card form', function () {

  });

  it('can submit the price form', function () {

  });

  it('should not submit the price form when there are errors', function () {

  });

  it('should should set error feedback in the price form', function () {

  });
});
