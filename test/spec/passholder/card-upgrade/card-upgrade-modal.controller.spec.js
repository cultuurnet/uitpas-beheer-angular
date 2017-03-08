'use strict';

describe('Controller: Card Upgrade Modal', function () {

  var $controller, controller, $scope, $rootScope, counterService, passholderService, $state, $q, Pass, pass,
    $uibModalInstance, Counter, activeCounter, moment, cardSystem;

  beforeEach(module('ubr.passholder.cardUpgrade'));
  beforeEach(module('uitpasbeheerApp', function($provide) {
    passholderService = jasmine.createSpyObj(
      'passholderService',
      [
        'register',
        'getLastIdentification',
        'addCardSystem',
        'findPass'
      ]
    );
    $provide.provider('passholderService', {
      $get: function () {
        return passholderService;
      }
    });

    counterService = jasmine.createSpyObj('counterService', ['getRegistrationPriceInfo', 'getUpgradePriceInfo']);
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
    expect(controller.upgradeData.withNewCard).toBe('NO_NEW_CARD');
  });

  it('can dismiss the modal', function () {
    controller.close();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });

  it('should go to the new card form step when all fields are valid', function () {
    var formStub = {
      '$valid': true,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    spyOn(controller, 'refreshUnreducedPriceInfo').and.returnValue($q.when('priceRefreshed'));

    controller.submitKansenstatuutForm(formStub);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder.upgrade.newCard');
    expect(controller.refreshUnreducedPriceInfo).toHaveBeenCalled();
  });

  it('should force a new card when kansenstatuut is chosen', function () {
    var formStub = {
      '$valid': true,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };
    controller.upgradeData.withKansenstatuut = 'KANSENSTATUUT';
    var priceInfo = {
      price: 5
    };
    counterService.getUpgradePriceInfo.and.returnValue($q.when(priceInfo));

    controller.submitKansenstatuutForm(formStub);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder.upgrade.newCard');
    expect(controller.upgradeData.withNewCard).toBe('NEW_CARD');
  });

  it('should not submit the kansenstatuut form when there are errors', function () {
    var formStub= {
      $valid: false,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    controller.submitKansenstatuutForm(formStub);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect($state.go).not.toHaveBeenCalledWith();
  });

  it('should go to the price form step when all fields are valid with new card', function () {
    var formStub = {
      '$valid': true,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };
    controller.upgradeData.withNewCard = 'NEW_CARD';
    controller.upgradeData.uitpasNewNumber = 'new uitpas number';

    spyOn(controller, 'refreshUnreducedPriceInfo').and.returnValue($q.when('priceRefreshed'));

    controller.submitNewCardForm(formStub);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder.upgrade.price');
    expect(controller.refreshUnreducedPriceInfo).toHaveBeenCalled();
    expect(controller.upgradeData.upgradeReason).toBe('EXTRA_CARD');
    expect(controller.upgradeData.passToCheck.number).toBe('new uitpas number');
  });

  it('should go to the price form step when all fields are valid without new card', function () {
    var formStub = {
      '$valid': true,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };
    controller.upgradeData.withNewCard = 'NO_NEW_CARD';

    spyOn(controller, 'refreshUnreducedPriceInfo').and.returnValue($q.when('priceRefreshed'));

    controller.submitNewCardForm(formStub);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder.upgrade.price');
    expect(controller.refreshUnreducedPriceInfo).toHaveBeenCalled();
    expect(controller.upgradeData.upgradeReason).toBe('CARD_UPGRADE');
  });

  it('should not submit the new card form when there are errors', function () {
    var formStub= {
      $valid: false,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    controller.submitNewCardForm(formStub);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect($state.go).not.toHaveBeenCalledWith();
  });

  it('should start the upgrade process after the price step', function () {
    var formStub = {
      '$valid': true,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    spyOn(controller, 'submitUpgrade').and.returnValue($q.when('priceRefreshed'));

    controller.submitPriceForm(formStub);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.submitUpgrade).toHaveBeenCalled();
  });

  it('should not submit the price form when there are errors', function () {
    var formStub= {
      $valid: false,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    spyOn(controller, 'submitUpgrade').and.returnValue($q.when('priceRefreshed'));
    controller.submitPriceForm(formStub);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.submitUpgrade).not.toHaveBeenCalledWith();
  });

  it('should refresh the unreduced price info for an extra card', function () {
    var deferredPriceInfo = $q.defer();
    var priceInfoPromise = deferredPriceInfo.promise;
    var returnedPriceInfo = {
      price: '5,25',
      kansenStatuut: true,
      ageRange: {
        from: 15,
        to: 25
      },
      voucherType: {
        name: 'Party people',
        prefix: 'Pp'
      }
    };
    controller.upgradeData.upgradeReason = 'EXTRA_CARD';

    counterService.getRegistrationPriceInfo.and.returnValue(priceInfoPromise);

    controller.refreshUnreducedPriceInfo();

    deferredPriceInfo.resolve(returnedPriceInfo);
    $scope.$digest();

    expect(counterService.getRegistrationPriceInfo).toHaveBeenCalled();
    expect(controller.upgradeData.unreducedPrice).toEqual('5,25');
  });

  it('should refresh the unreduced price info without an extra card', function () {
    var deferredPriceInfo = $q.defer();
    var priceInfoPromise = deferredPriceInfo.promise;
    var returnedPriceInfo = {
      price: '5,25',
      kansenStatuut: true,
      ageRange: {
        from: 15,
        to: 25
      },
      voucherType: {
        name: 'Party people',
        prefix: 'Pp'
      }
    };
    controller.upgradeData.price = 1;

    counterService.getUpgradePriceInfo.and.returnValue(priceInfoPromise);

    controller.refreshUnreducedPriceInfo();

    deferredPriceInfo.resolve(returnedPriceInfo);
    $scope.$digest();

    expect(counterService.getUpgradePriceInfo).toHaveBeenCalled();
    expect(controller.upgradeData.unreducedPrice).toEqual('5,25');
  });

  it('should submit the upgrade', function () {
    passholderService.addCardSystem.and.returnValue($q.when());

    controller.submitUpgrade();
    $scope.$digest();

    expect($uibModalInstance.close).toHaveBeenCalled();
  });

  it('should submit the upgrade with kansenstatuut and new card', function () {
    passholderService.addCardSystem.and.returnValue($q.when());
    controller.upgradeData.withKansenstatuut = 'KANSENSTATUUT';
    controller.upgradeData.withNewCard = 'NEW_CARD';

    controller.submitUpgrade();
    $scope.$digest();

    expect($uibModalInstance.close).toHaveBeenCalled();
  });

  it('should handle errors if the submit of the upgrade fails', function () {
    var error = {
      code: 'FAIL',
      message: 'It failed because of an error.'
    };
    passholderService.addCardSystem.and.returnValue($q.reject(error));
    controller.upgradeData.withKansenstatuut = 'KANSENSTATUUT';
    controller.upgradeData.withNewCard = 'NEW_CARD';

    controller.submitUpgrade();
    $scope.$digest();

    expect(controller.asyncError).toEqual(error);
  });

  it('can clear async errors', function () {
    var error = {
      code: 'FAIL',
      message: 'It failed because of an error.'
    };
    controller.asyncError = error;
    controller.clearAsyncError('NOT_THERE');
    expect(controller.asyncError).toEqual(error);
    controller.clearAsyncError('FAIL');
    expect(controller.asyncError).toBeUndefined();
  });

  it('should update the furthest step when stepping away', function () {
    controller.furthestStep = 1;
    controller.updateFurthestStep(null, null, null, {stepNumber: 3});
    expect(controller.furthestStep).toEqual(3);

    // the furthest step should not be updated when navigating away from an earlier step
    controller.updateFurthestStep(null, null, null, {stepNumber: 2});
    expect(controller.furthestStep).toEqual(3);

    // do nothing when navigating from a state without steps
    controller.updateFurthestStep(null, null, null, {});
    expect(controller.furthestStep).toEqual(3);
  });

  it('should return the current step number', function () {
    var currentStepNumber = controller.getStepNumber();
    expect(currentStepNumber).toEqual(1);
  });

  it('should always show form field errors when the form was already stepped to', function () {
    spyOn(controller, 'getStepNumber');
    controller.furthestStep = 2;

    var blueForm = {
      $submitted: false,
      purpleField: {
        $touched: false,
        $dirty: false,
        $invalid: true
      }
    };

    controller.getStepNumber.and.returnValue(1);
    expect(controller.showFieldError(blueForm, 'purpleField')).toBeTruthy();

    controller.getStepNumber.and.returnValue(3);
    expect(controller.showFieldError(blueForm, 'purpleField')).toBeFalsy();
  });

  it('should not set the uitpas number from a scanned nfc pass when no new card is needed', function () {
    var newPass = {
      number: '0987654321012'
    };
    passholderService.findPass.and.returnValue($q.when(newPass));
    controller.passScanned(null, '043B83DA862680');
    $scope.$digest();

    expect(controller.upgradeData.uitpasNewNumber).toBe('');
  });

  it('should  set the uitpas number from a scanned nfc pass when a new card is needed', function () {
    var newPass = {
      number: '0987654321012'
    };
    controller.newCardForm = {
      uitpasNewNumber: {
        '$setDirty': jasmine.createSpy('$setDirty')
      }
    };
    controller.upgradeData.withNewCard = 'NEW_CARD';
    passholderService.findPass.and.returnValue($q.when(newPass));
    controller.passScanned(null, '043B83DA862680');
    $scope.$digest();

    expect(controller.upgradeData.uitpasNewNumber).toBe('0987654321012');
  });

  it('can warn the user that the uitpas can not be found after scanning an nfc pass', function () {
    passholderService.findPass.and.returnValue($q.reject());
    controller.passScanned(null, '043B83DA862680');
    $scope.$digest();

    expect(controller.formAlert.message).toBe('De gescande UiTPAS kan niet gevonden worden.');
    expect(controller.formAlert.type).toBe('danger');
  });
});
