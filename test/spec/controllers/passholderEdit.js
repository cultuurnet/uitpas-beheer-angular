'use strict';

describe('Controller: PassholderEditController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, modalInstance, passholderService, $q, $scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, $rootScope) {
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    passholderService = $injector.get('passholderService');
    $q = $injector.get('$q');
    $scope = $rootScope;

    controller = $controller('PassholderEditController', {
      passholder: { inszNumber: '07111571331' },
      identification: 123,
      $modalInstance: modalInstance,
      passholderService: passholderService
    });
  }));

  it('should disable the INSZ number field when a number is already present', function () {
    expect(controller.disableInszNumber).toBeTruthy();
  });

  it('should lock down the form while submitting', function () {
    controller.submitForm({}, {});
    expect(controller.formSubmitBusy).toBeTruthy();
  });

  it('should unlock the form after a submit is rejected', function () {
    var deferredUpdate = $q.defer();
    var updatePromise = deferredUpdate.promise;
    spyOn(passholderService, 'update').and.returnValue(updatePromise);

    controller.submitForm({}, { '$valid': true });
    expect(controller.formSubmitBusy).toBeTruthy();

    deferredUpdate.reject({
      apiError: {
        code: 'SOME_ERROR'
      }
    });
    $scope.$digest();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should close the edit modal after successfully updating a passholder', function () {
    var deferredUpdate = $q.defer();
    var updatePromise = deferredUpdate.promise;
    spyOn(passholderService, 'update').and.returnValue(updatePromise);

    controller.submitForm({}, { '$valid': true });

    deferredUpdate.resolve({
      pass: 'holder'
    });
    $scope.$digest();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('can dismiss a passholder edit modal', function () {
    controller.cancelModal();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('should handle a failed update because of an already used Insz number', function () {
    var deferredUpdate = $q.defer();
    var updatePromise = deferredUpdate.promise;
    spyOn(passholderService, 'update').and.returnValue(updatePromise);

    var formState = {
      '$valid': true,
      inszNumber: {
        $invalid: false,
        $error: {
          inUse: false
        }
      }
    };
    controller.submitForm({}, formState);

    deferredUpdate.reject({
      apiError: {
        code: 'INSZ_ALREADY_USED'
      }
    });
    $scope.$digest();
    var invalidInszNumberFormState = {
      $error: {
        inUse: true
      },
      $invalid: true
    };
    expect(formState.inszNumber).toEqual(invalidInszNumberFormState);
  });

  it('should handle a failed update because of an already used email address', function () {
    var deferredUpdate = $q.defer();
    var updatePromise = deferredUpdate.promise;
    spyOn(passholderService, 'update').and.returnValue(updatePromise);

    var formState = {
      '$valid': true,
      email: {
        $invalid: false,
        $error: {
          inUse: false
        }
      }
    };
    controller.submitForm({}, formState);

    deferredUpdate.reject({
      apiError: {
        code: 'EMAIL_ALREADY_USED'
      }
    });
    $scope.$digest();
    var invalidEmailFormState = {
      $error: {
        inUse: true
      },
      $invalid: true
    };
    expect(formState.email).toEqual(invalidEmailFormState);
  });

  it('should set an alert when the update fails because an action is not allowed', function () {
    var deferredUpdate = $q.defer();
    var updatePromise = deferredUpdate.promise;
    spyOn(passholderService, 'update').and.returnValue(updatePromise);

    var formState = {
      '$valid': true
    };
    controller.submitForm({}, formState);

    deferredUpdate.reject({
      apiError: {
        code: 'ACTION_NOT_ALLOWED'
      }
    });
    $scope.$digest();
    var actionNotAllowedAlert = {
      message: 'Actie niet toegestaan.',
      type: 'danger'
    };
    expect(controller.formAlert).toEqual(actionNotAllowedAlert);
  });
});
