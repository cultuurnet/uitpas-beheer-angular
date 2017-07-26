'use strict';

describe('Controller: RegistrationModalController', function () {

  beforeEach(module('ubr.registration'));
  beforeEach(module('uitpasbeheerAppViews'));

  var controller, Pass, unregisteredPass, $state, Passholder, passholderService, $scope, $controller, modalInstance,
      counterService, $q, RegistrationAPIError, $rootScope, eIDService, Counter, activeCounter;

  var unregisteredPassData = {
    'uitPas': {
      number: '0930000422202',
      kansenStatuut: false,
      status: 'ACTIVE',
      type: 'CARD'
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector) {
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    $rootScope = $injector.get('$rootScope');

    $controller = $injector.get('$controller');
    Pass = $injector.get('Pass');
    unregisteredPass = new Pass(unregisteredPassData);
    $scope = $rootScope.$new();
    $q = $injector.get('$q');
    Counter = $injector.get('Counter');
    activeCounter = new Counter({
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

    $state = {
      current: {
        stepNumber: 1
      },
      go: jasmine.createSpy('go')
    };
    Passholder = $injector.get('Passholder');
    passholderService = $injector.get('passholderService');
    counterService = $injector.get('counterService');

    RegistrationAPIError = {
      ORANGE_API_ERROR: {
        message: 'Orange API Error',
        step: 'orangeStep'
      }
    };

    eIDService = jasmine.createSpyObj('eIDService', ['getDataFromEID']);

    controller = $controller('RegistrationModalController', {
      pass: unregisteredPass,
      $state: $state,
      Passholder: Passholder,
      passholderService: passholderService,
      $uibModalInstance: modalInstance,
      counterService: counterService,
      RegistrationAPIError: RegistrationAPIError,
      $rootScope: $rootScope,
      $scope: $scope,
      $q: $q,
      eIDService: eIDService,
      isJavaFXBrowser: true,
      activeCounter: activeCounter
    });

    spyOn(controller, 'getStepNumber').and.callThrough();
  }));

  it('should have a pass object', function () {
    expect(controller.pass).toEqual(unregisteredPass);
    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.price).toEqual(-1);
  });

  it('should submit the personal data form', function () {
    controller.personalDataForm = {
      '$valid': true,
      inszNumber: {
        $invalid: false,
        $error: {
          inUse: false
        }
      },
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    var deferredPass = $q.defer();
    var passPromise = deferredPass.promise;

    spyOn(passholderService, 'findPass').and.returnValue(passPromise);
    // when submitting personal data the base price should be updated
    spyOn(controller, 'refreshUnreducedPriceInfo').and.returnValue($q.when('priceRefreshed'));

    controller.submitPersonalDataForm();

    deferredPass.reject();
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(passholderService.findPass).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('counter.main.register.form.contactData');
    expect(controller.refreshUnreducedPriceInfo).toHaveBeenCalled();
  });

  it('should not submit the personal data form when there are errors', function () {
    controller.personalDataForm = {
      $valid: false,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };
    spyOn(passholderService, 'findPassholder');

    controller.submitPersonalDataForm();

    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(passholderService.findPassholder).not.toHaveBeenCalled();
    expect($state.go).not.toHaveBeenCalledWith();
  });

  it('should set error feedback in the personal data form', function () {
    var formStub = {
      '$valid': true,
      inszNumber: {
        $invalid: false,
        $error: {
          inUse: false
        },
        $setValidity: function() {
          this.$invalid = true;
          this.$error.inUse = true;
        }
      },
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    var deferredPass = $q.defer();
    var passPromise = deferredPass.promise;

    spyOn(passholderService, 'findPass').and.returnValue(passPromise);

    controller.personalDataForm = formStub;
    controller.submitPersonalDataForm(formStub);

    var testPass = {
      passholder: {
        data: 'test',
        isRegisteredInCardSystem: function() {
          return true;
        }
      },
    };
    deferredPass.resolve(testPass);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(passholderService.findPass).toHaveBeenCalled();
    expect(controller.existingPass).toEqual(testPass);
    expect(controller.isMemberOfCurrentBalie).toEqual(true);
    expect(formStub.inszNumber.$error.inUse).toBeTruthy();
    expect(formStub.inszNumber.$invalid).toBeTruthy();
  });

  it('should submit the contact data form', function () {
    var formStub= {
      $valid: true,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    controller.submitContactDataForm(formStub);
    $scope.$digest();

    expect($state.go).toHaveBeenCalledWith('counter.main.register.form.price');
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should remove the email value when marked as excluded', function () {
    var expectedPassholderData = angular.copy(controller.passholder);
    expectedPassholderData.contact.email = '';
    controller.passholder.contact.email = 'some@email.be';

    spyOn(passholderService, 'register').and.returnValue($q.resolve('passholder registered'));

    controller.excludeEmail = true;
    controller.submitRegistration();

    expect(passholderService.register).toHaveBeenCalledWith(unregisteredPass, expectedPassholderData, '', undefined);
  });

  it('should include the email address when not marked as excluded', function () {
    var expectedPassholderData = angular.copy(controller.passholder);
    expectedPassholderData.contact.email = 'include@email.me';
    controller.passholder.contact.email = 'include@email.me';

    spyOn(passholderService, 'register').and.returnValue($q.resolve('passholder registered'));

    controller.excludeEmail = false;
    controller.submitRegistration();

    expect(passholderService.register).toHaveBeenCalledWith(unregisteredPass, expectedPassholderData, '', undefined);
  });

  it('should not submit the contact data form when there are errors', function () {
    var formStub= {
      $valid: false,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    controller.submitContactDataForm(formStub);
    $scope.$digest();

    expect($state.go).not.toHaveBeenCalled();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should submit the price form', function () {
    var formStub= {
      $valid: true,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    spyOn(controller, 'submitRegistration');

    controller.submitPriceForm(formStub);
    $scope.$digest();

    expect(controller.submitRegistration).toHaveBeenCalled();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should not submit the price form when there are errors', function () {
    var formStub= {
      $valid: false,
      '$setSubmitted': jasmine.createSpy('$setSubmitted')
    };

    spyOn(controller, 'submitRegistration');

    controller.submitPriceForm(formStub);
    $scope.$digest();

    expect(controller.submitRegistration).not.toHaveBeenCalled();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should refresh the unreduced price info', function () {
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

    spyOn(counterService, 'getRegistrationPriceInfo').and.returnValue(priceInfoPromise);

    controller.refreshUnreducedPriceInfo();

    deferredPriceInfo.resolve(returnedPriceInfo);
    $scope.$digest();

    expect(counterService.getRegistrationPriceInfo).toHaveBeenCalled();
    expect(controller.unreducedPrice).toEqual('5,25');
  });

  it('should submit the registration', function () {
    var deferredRegistration = $q.defer();
    var registrationPromise = deferredRegistration.promise;
    var returnedPassholder = new Passholder();

    spyOn(passholderService, 'register').and.returnValue(registrationPromise);

    controller.submitRegistration();

    deferredRegistration.resolve(returnedPassholder);

    $scope.$digest();

    expect(passholderService.register).toHaveBeenCalled();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('should redirect if the submit of the registration fails', function () {
    var deferredRegistration = $q.defer();
    var registrationPromise = deferredRegistration.promise;
    var returnedError = {
      code: 'ERROR',
      readableCode: '',
      message: 'Clean URL CALLED www.blah.blah/blah'
    };

    spyOn(passholderService, 'register').and.returnValue(registrationPromise);

    controller.submitRegistration();

    deferredRegistration.reject(returnedError);

    $scope.$digest();

    expect(passholderService.register).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('counter.main.register.form.personalData');
    expect(controller.asyncError.cleanMessage).toEqual('Clean ');
  });

  it('should map a known API error to a readable error and registration step', function () {
    var deferredRegistration = $q.defer();
    var registrationPromise = deferredRegistration.promise;
    var registrationError = {
      code: 'ORANGE_API_ERROR',
      message: 'I\'m a funky API error with technical details. Don\'t show me to noobs.'
    };
    var expectedAsyncError = {
      cleanMessage: 'Orange API Error',
      code: 'ORANGE_API_ERROR',
      message: 'I\'m a funky API error with technical details. Don\'t show me to noobs.'
    };

    spyOn(passholderService, 'register').and.returnValue(registrationPromise);

    controller.submitRegistration();

    deferredRegistration.reject(registrationError);

    $scope.$digest();

    expect(passholderService.register).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('counter.main.register.form.orangeStep');
    expect(controller.asyncError).toEqual(expectedAsyncError);
  });

  it('can cancel the registration', function () {
    controller.cancelRegistration();
    expect(modalInstance.dismiss).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('counter.main.register');
  });

  it('can go to a profile', function () {
    controller.viewProfile('test');
    expect(modalInstance.dismiss).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder', {identification: 'test'});
  });

  it('can start an upgrade', function() {
    controller.existingPass = 'existing';
    controller.upgradeCard('testnumber', 'testsystem');

    expect(modalInstance.dismiss).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder.upgrade.newCard', {
      pass: 'existing',
      identification: 'testnumber',
      cardSystem: 'testsystem'
    });
  });

  it('should reset the right async error when a relevant field changes', function () {
    spyOn(controller, 'clearAsyncError');

    controller.emailChanged();
    expect(controller.clearAsyncError.calls.first().args[0]).toEqual('EMAIL_ALREADY_USED');
    expect(controller.clearAsyncError.calls.mostRecent().args[0]).toEqual('EMAIL_ADDRESS_INVALID');


    controller.postalCodeChanged();
    expect(controller.clearAsyncError.calls.mostRecent().args[0]).toEqual('PARSE_INVALID_POSTAL_CODE');
  });

  it('should clear the async error by error code', function () {
    controller.asyncError = {
      code: 'SOME_ASYNC_ERROR',
      message: 'Something went horribly wrong, run for cover.'
    };

    controller.clearAsyncError('SOME_ASYNC_ERROR');

    expect(controller.asyncError).toBeUndefined();
  });

  it('should always show form field errors when the form was already stepped to', function () {
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

  describe('When scanning an eID', function () {

    it('should fetch data from the reader', function () {
      controller.getDataFromEID();

      expect(eIDService.getDataFromEID).toHaveBeenCalled();
    });

    it('should update the registration info', function () {
      var eIDData = {
        name: {
          first: 'Dirk',
          last: 'Dirkly'
        }
      };

      var deferredPass = $q.defer();
      var passPromise = deferredPass.promise;
      spyOn(passholderService, 'findPass').and.returnValue(passPromise);

      $rootScope.$emit('eIDDataReceived', eIDData);
      expect(controller.eIDError).toBeFalsy();
      expect(controller.passholder.name.first).toEqual('Dirk');
      expect(controller.passholder.name.last).toEqual('Dirkly');
    });

    it('should display an error when something goes wrong', function () {
      var expectedErrorMessage = 'De e-id kon niet gelezen worden. Controleer of de kaart goed in de lezer zit, of de lezer correct aangesloten is aan de pc.';

      $rootScope.$emit('eIDErrorReceived');

      expect(controller.eIDError).toEqual(expectedErrorMessage);
    });

    it('should update the picture attached to the registration', function () {
      // base64 encoded picture data
      var pictureData = 'asdf546456afds546fads645afds654afds456afds654fds';

      $rootScope.$emit('eIDPhotoReceived', pictureData);

      expect(controller.passholder.picture).toEqual(pictureData);
    });
  });
});
