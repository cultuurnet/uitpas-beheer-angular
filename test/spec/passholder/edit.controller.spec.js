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

  var getSpyForm = function (formData) {
    var spyForm = {
      $valid: true,
      $setSubmitted: jasmine.createSpy('$setSubmitted')
    };

    if (formData) {
      angular.merge(spyForm, formData);
    }

    return spyForm;
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, _$rootScope_, Passholder) {
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
      passholder: new Passholder({ inszNumber: '07111571331' }),
      identification: '07111571331',
      $uibModalInstance: modalInstance,
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
    controller.submitForm(getSpyForm());
    expect(controller.formSubmitBusy).toBeTruthy();
  });

  it('should unlock the form after a submit is rejected', function () {
    var apiError = {
      apiError: {
        code: 'SOME_ERROR'
      }
    };
    spyOn(passholderService, 'update').and.returnValue($q.reject(apiError));

    controller.submitForm(getSpyForm());
    expect(controller.formSubmitBusy).toBeTruthy();

    $scope.$digest();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should remove the email address when marked as excluded', function () {
    controller.excludeEmail = true;
    controller.passholder.contact.email = 'some@email.be';
    var expectedPassholderData = angular.copy(controller.passholder);
    var formStub = getSpyForm({
      email: 'some@email.be'
    });

    expectedPassholderData.contact.email = '';

    spyOn(passholderService, 'update').and.returnValue($q.resolve('passholder updated'));

    controller.submitForm(formStub);
    $scope.$digest();

    expect(passholderService.update).toHaveBeenCalledWith(expectedPassholderData, '07111571331');
  });

  it('should close the edit modal after successfully updating a passholder', function () {
    var updatedPassholder = {
      pass: 'holder'
    };
    spyOn(passholderService, 'update').and.returnValue($q.resolve(updatedPassholder));

    controller.submitForm(getSpyForm());

    $scope.$digest();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('can dismiss a passholder edit modal', function () {
    controller.cancelModal();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('should handle a failed update because of an already used Insz number', function () {
    var apiError = {
      apiError: {
        code: 'INSZ_ALREADY_USED'
      }
    };
    spyOn(passholderService, 'update').and.returnValue($q.reject(apiError));

    var formState = {
      '$valid': true,
      inszNumber: {
        $invalid: false,
        $error: {
          inUse: false
        }
      },
      $setSubmitted: jasmine.createSpy('$setSubmitted')
    };
    controller.submitForm(formState);

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
    var apiError = {
      apiError: {
        code: 'EMAIL_ALREADY_USED'
      }
    };

    var formState = getSpyForm({
      '$valid': true,
      email: {
        $invalid: false,
        $error: {
          inUse: false
        }
      },
      $setSubmitted: jasmine.createSpy('$setSubmitted')
    });

    var invalidEmailFormState = {
      $error: {
        inUse: true
      },
      $invalid: true
    };

    spyOn(passholderService, 'update').and.returnValue($q.reject(apiError));

    controller.submitForm(formState);
    $scope.$digest();

    expect(formState.email).toEqual(invalidEmailFormState);
  });

  it('should set an alert when the update fails because an action is not allowed', function () {
    var apiError = {
      apiError: {
        code: 'ACTION_NOT_ALLOWED'
      }
    };

    var formState = {
      '$valid': true,
      $setSubmitted: jasmine.createSpy('$setSubmitted')
    };

    var actionNotAllowedError = {
      message: 'Actie niet toegestaan.',
      type: 'danger'
    };

    spyOn(passholderService, 'update').and.returnValue($q.reject(apiError));

    controller.submitForm(formState);
    $scope.$digest();

    expect(controller.asyncError).toEqual(actionNotAllowedError);
  });

  it('should show an error when an async email formatting error occurs', function () {
    var emailFormatError = $q.reject({
      apiError: {
        code: 'EMAIL_ADDRESS_INVALID'
      }
    });

    var form = getSpyForm({
      email: {
        $setValidity: jasmine.createSpy('$setValidity')
      }
    });

    spyOn(passholderService, 'update').and.returnValue(emailFormatError);

    controller.submitForm(form);
    $scope.$digest();

    expect(form.email.$setValidity).toHaveBeenCalled();
  });

  it('should call the eIDService to get the eID data', function () {
    spyOn(eIDService, 'getDataFromEID');
    controller.getDataFromEID();
    expect(eIDService.getDataFromEID).toHaveBeenCalled();
  });

  it('should react to receiving the eID data', function () {
    controller.passholder = { inszNumber: '07111571331' };
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

  it('should show an error when an async postal code formatting error occurs', function () {
    var postalCodeFormatError = $q.reject({
      apiError: {
        code: 'PARSE_INVALID_POSTAL_CODE'
      }
    });

    var form = getSpyForm({
      postalCode: {
        $error: {},
        $invalid: false,
        $setValidity: jasmine.createSpy('$setValidity')
      }
    });

    spyOn(passholderService, 'update').and.returnValue(postalCodeFormatError);

    controller.submitForm(form);
    $scope.$digest();

    expect(form.postalCode.$setValidity).toHaveBeenCalledWith('formatAsync', false);
  });

  it('can remove field async errors when the field value changes', function () {
    var form = getSpyForm({
      postalCode: {
        $setValidity: jasmine.createSpy('$setValidity')
      }
    });

    controller.removeAsyncError(form, 'postalCode');
    expect(form.postalCode.$setValidity).toHaveBeenCalledWith('formatAsync', true);
  });
});
