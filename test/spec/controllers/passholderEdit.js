'use strict';

describe('Controller: PassholderEditController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, modalInstance, passholderService, $q, $scope, eIDService, $rootScope, isJavaFXBrowser;
  var eIDRawData = {
    name: {
      first: 'Alberto',
      last: 'Contador'
    },
    inszNumber: '720923-383-17',
    birth: {
      date: new Date('1972-09-23'),
      place: 'Madrid'
    },
    gender: 'MALE',
    nationality: 'Spaans',
    address: {
      street: 'Calle Alava',
      postalCode: '28017',
      city: 'Madrid'
    }
  };
  var eIDRawPhoto = 'base64PictureString';

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, _$rootScope_) {
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    isJavaFXBrowser = false;
    passholderService = $injector.get('passholderService');
    eIDService = $injector.get('eIDService');
    $q = $injector.get('$q');
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;

    controller = $controller('PassholderEditController', {
      passholder: { inszNumber: '07111571331' },
      identification: 123,
      $modalInstance: modalInstance,
      passholderService: passholderService,
      eIDService: eIDService,
      isJavaFXBrowser: isJavaFXBrowser,
      $rootScope: $rootScope,
      $scope: $scope
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

  it('should call the eIDService to get the eID data', function () {
    spyOn(eIDService, 'getDataFromEID');
    controller.getDataFromEID();
    expect(eIDService.getDataFromEID).toHaveBeenCalled();
  });

  it('should react to receiving the eID data', function () {
    $rootScope.$emit('eIDDataReceived', eIDRawData);
    expect(controller.eIDData).toEqual(eIDRawData);
    expect(controller.passholder).not.toEqual(eIDRawData);

    eIDRawData.inszNumber = '07111571331';
    $rootScope.$emit('eIDDataReceived', eIDRawData);
    expect(controller.eIDData).toEqual(eIDRawData);
    expect(controller.passholder).toEqual(eIDRawData);
  });

  it('should react to receiving the eID photo', function () {
    $rootScope.$emit('eIDPhotoReceived', eIDRawPhoto);
    expect(controller.eIDData.picture).toEqual(eIDRawPhoto);
    expect(controller.passholder.picture).toEqual(eIDRawPhoto);
  });

  it('should react to an eID read error', function () {
    $rootScope.$emit('eIDErrorReceived', '');
    expect(controller.eIDError).toEqual('De eID kon niet gelezen worden. Controleer of de kaart goed in de lezer zit, of de lezer correct aangesloten is aan de pc.');
  });
});
