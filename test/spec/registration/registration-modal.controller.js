'use strict';

describe('Controller: PassholderRegisterController', function () {

  beforeEach(module('ubr.registration'));
  beforeEach(module('uitpasbeheerAppViews'));

  var controller, Pass, unregisteredPass, $state, Passholder, passholderService, $scope, $controller, modalInstance,
      counterService, $q, RegistrationAPIError;

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
    $scope = $rootScope.$new();
    $q = $injector.get('$q');

    $state = jasmine.createSpyObj('$state', ['go']);
    Passholder = $injector.get('Passholder');
    passholderService = $injector.get('passholderService');
    counterService = $injector.get('counterService');

    RegistrationAPIError = {
      ORANGE_API_ERROR: {
        message: 'Orange API Error',
        step: 'orangeStep'
      }
    };

    controller = $controller('RegistrationModalController', {
      pass: unregisteredPass,
      $state: $state,
      Passholder: Passholder,
      passholderService: passholderService,
      $modalInstance: modalInstance,
      counterService: counterService,
      RegistrationAPIError: RegistrationAPIError,
      $rootScope: $rootScope,
      $scope: $scope
    });

    spyOn(controller, 'getStepNumber');
  }));

  it('should have a pass object', function () {
    expect(controller.pass).toEqual(unregisteredPass);
    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.price).toEqual(-1);
  });

  it('should submit the personal data form', function () {
    var formStub = {
      '$valid': true,
      inszNumber: {
        $invalid: false,
        $error: {
          inUse: false
        }
      }
    };

    var deferredPassholder = $q.defer();
    var passholderPromise = deferredPassholder.promise;

    spyOn(passholderService, 'findPassholder').and.returnValue(passholderPromise);
    // when submitting personal data the base price should be updated
    spyOn(controller, 'refreshUnreducedPriceInfo').and.returnValue($q.when('priceRefreshed'));

    controller.submitPersonalDataForm(formStub);

    deferredPassholder.reject();
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(passholderService.findPassholder).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('counter.main.register.form.contactData');
    expect(controller.refreshUnreducedPriceInfo).toHaveBeenCalled();
  });

  it('should not submit the personal data form when there are errors', function () {
    var formStub= {
      $valid: false
    };
    spyOn(passholderService, 'findPassholder');

    controller.submitPersonalDataForm(formStub);

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
      }
    };

    var deferredPassholder = $q.defer();
    var passholderPromise = deferredPassholder.promise;

    spyOn(passholderService, 'findPassholder').and.returnValue(passholderPromise);

    controller.submitPersonalDataForm(formStub);

    deferredPassholder.resolve(new Passholder());
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(passholderService.findPassholder).toHaveBeenCalled();
    expect($state.go).not.toHaveBeenCalled();
    expect(formStub.inszNumber.$error.inUse).toBeTruthy();
    expect(formStub.inszNumber.$invalid).toBeTruthy();
  });

  it('should submit the contact data form', function () {
    var formStub= {
      $valid: true
    };

    controller.submitContactDataForm(formStub);

    expect($state.go).toHaveBeenCalledWith('counter.main.register.form.price');
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should not submit the contact data form when there are errors', function () {
    var formStub= {
      $valid: false
    };

    controller.submitContactDataForm(formStub);

    expect($state.go).not.toHaveBeenCalled();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should submit the price form', function () {
    var formStub= {
      $valid: true
    };

    spyOn(controller, 'submitRegistration');

    controller.submitPriceForm(formStub);

    expect(controller.submitRegistration).toHaveBeenCalled();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should not submit the price form when there are errors', function () {
    var formStub= {
      $valid: false
    };

    spyOn(controller, 'submitRegistration');

    controller.submitPriceForm(formStub);

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

  it('can dismiss the modal', function () {
    controller.close();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });
});
