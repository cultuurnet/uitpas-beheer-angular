'use strict';

describe('Controller: PassholderRegisterController', function () {

  beforeEach(module('ubr.registration'));
  beforeEach(module('uitpasbeheerAppViews'));

  var controller, Pass, unregisteredPass, $state, Passholder, passholderService, $scope, $controller, modalInstance, counterService, $q;

  var unregisteredPassData = {
    'uitPas': {
      number: '0930000422202',
      kansenStatuut: false,
      status: 'ACTIVE',
      type: 'CARD'
    }
  };

  var formStub = {
    '$valid': true
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
    $q = $injector.get('$q');

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
    expect(controller.price).toEqual(-1);
  });

  it('should submit the personal data form', function () {
    formStub.inszNumber = {
      $invalid: false,
        $error: {
        inUse: false
      }
    };

    var deferredPassholder = $q.defer();
    var passholderPromise = deferredPassholder.promise;

    spyOn(passholderService, 'findPassholder').and.returnValue(passholderPromise);
    spyOn($state, 'go');

    controller.submitPersonalDataForm(formStub);

    deferredPassholder.reject();
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(passholderService.findPassholder).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('counter.main.register.form.contactData');
  });

  it('should set error feedback in the personal data form', function () {
    formStub.inszNumber = {
      $invalid: false,
      $error: {
        inUse: false
      },
      $setValidity: function() {
        this.$invalid = true;
        this.$error.inUse = true;
      }
    };

    var deferredPassholder = $q.defer();
    var passholderPromise = deferredPassholder.promise;

    spyOn(passholderService, 'findPassholder').and.returnValue(passholderPromise);
    spyOn($state, 'go');

    controller.submitPersonalDataForm(formStub);

    deferredPassholder.resolve(new Passholder());
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(passholderService.findPassholder).toHaveBeenCalled();
    expect($state.go).not.toHaveBeenCalled();
    expect(formStub.inszNumber.$error.inUse).toBeTruthy();
    expect(formStub.inszNumber.$invalid).toBeTruthy();
  });

  it('can dismiss the modal', function () {
    controller.close();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });
});
