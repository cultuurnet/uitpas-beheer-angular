'use strict';

describe('Directive: ubrUitpasNumberAsyncValidation', function () {

  var inputElement, scope, inputController, passholderService, $q, counterService;

  // load the directive's module
  beforeEach(module('uitpasbeheerApp', function ($provide) {
    passholderService = jasmine.createSpyObj('passholderService', ['findPass']);
    counterService = jasmine.createSpyObj('counterService', ['getActive']);

    $provide.provider('passholderService', {
      $get: function () {
        return passholderService;
      }
    });

    $provide.provider('counterService', {
      $get: function () {
        return counterService;
      }
    });
  }));

  beforeEach(inject(function ($rootScope, $compile, _$q_) {
    scope = $rootScope.$new();
    $q = _$q_;

    var uitpasNumberInputTemplate = '<input ubr-card-system="cardSystem.id" ubr-uitpas-number-async-validation name="uitpasNumber" type="text" ng-model="uitpasNumber">';
    inputElement = angular.element(uitpasNumberInputTemplate);

    scope.uitpasNumber = '';
    scope.cardSystem = {};
    $compile(inputElement)(scope);
    inputController = inputElement.controller('ngModel');
    counterService.getActive.and.returnValue($q.reject());
  }));

  it('should not trigger custom errors before enough characters of a pass are entered', function () {
    inputElement.val('123456789').trigger('input');
    scope.$apply();

    expect(passholderService.findPass).not.toHaveBeenCalled();
    expect(inputController.$error.notFound).toBeFalsy();
    expect(inputController.$error.notLocalStock).toBeFalsy();
  });

  it('should mark pass numbers as not found when they are not known by UiTPAS', function () {
    passholderService.findPass.and.returnValue($q.reject('not found!'));

    inputElement.val('13545WOTM878231321').trigger('input');
    scope.$apply();

    expect(passholderService.findPass).toHaveBeenCalledWith('13545WOTM878231321');
    expect(inputController.$error.notFound).toEqual(true);
  });

  it('should mark known pass numbers when they are not available for use', function () {
    var unavailablePass = {
      isLocalStock: function () {
        return false;
      }
    };
    passholderService.findPass.and.returnValue($q.resolve(unavailablePass));

    inputElement.val('13545WOTM878231321').trigger('input');
    scope.$apply();

    expect(passholderService.findPass).toHaveBeenCalledWith('13545WOTM878231321');
    expect(inputController.$error.notFound).toBeFalsy();
    expect(inputController.$error.notLocalStock).toEqual(true);
  });

  it('should consider a pass number valid when it is know by UiTPAS and is available for use', function () {
    var availablePass = {
      isLocalStock: function () {
        return true;
      }
    };
    passholderService.findPass.and.returnValue($q.resolve(availablePass));

    inputElement.val('1234567891234').trigger('input');
    scope.$apply();

    expect(passholderService.findPass).toHaveBeenCalledWith('1234567891234');
    expect(inputController.$error.notFound).toBeFalsy();
    expect(inputController.$error.notLocalStock).toBeFalsy();
  });

  it('should detect when the active counter is not allowed to register an UiTPAS', function () {
    var mismatchedPass = {
      cardSystem: {
        id: 'orange-card-system'
      },
      isLocalStock: function () {
        return true;
      }
    };
    var counter = {
      isRegistrationCounter: function () {
        return false;
      }
    };
    counterService.getActive.and.returnValue($q.resolve(counter));
    passholderService.findPass.and.returnValue($q.resolve(mismatchedPass));

    inputElement.val('1234567891234').trigger('input');
    scope.$apply();

    expect(passholderService.findPass).toHaveBeenCalledWith('1234567891234');
    expect(inputController.$error.unavailableForActiveCounter).toEqual(true);
  });

  it('should detect when the active counter is allowed to register an UiTPAS', function () {
    var mismatchedPass = {
      cardSystem: {
        id: 'orange-card-system'
      },
      isLocalStock: function () {
        return true;
      }
    };
    var counter = {
      isRegistrationCounter: function () {
        return true;
      }
    };
    counterService.getActive.and.returnValue($q.resolve(counter));
    passholderService.findPass.and.returnValue($q.resolve(mismatchedPass));

    inputElement.val('1234567891234').trigger('input');
    scope.$apply();

    expect(passholderService.findPass).toHaveBeenCalledWith('1234567891234');
    expect(inputController.$error.unavailableForActiveCounter).toBeFalsy();
  });

  it('should match card systems when a card system id is set', function () {
    var mismatchedPass = {
      cardSystem: {
        id: 'orange-card-system'
      },
      isLocalStock: function () {
        return true;
      }
    };
    passholderService.findPass.and.returnValue($q.resolve(mismatchedPass));

    scope.cardSystem.id = 'orange-card-system';
    scope.$apply();

    inputElement.val('2222222221234').trigger('input');
    scope.$apply();

    expect(inputController.$error.cardSystemMismatch).toBeFalsy();

    scope.cardSystem.id = 'green-card-system';
    scope.$apply();

    inputElement.val('2299222221234').trigger('input');
    scope.$apply();

    expect(inputController.$error.cardSystemMismatch).toEqual(true);
  });

});