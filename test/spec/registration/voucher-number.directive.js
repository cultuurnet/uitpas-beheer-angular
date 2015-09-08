'use strict';

describe('Directive: Voucher number', function () {

  var scope, registrationController, $q, counterService, voucherInputElement;

  var priceInfo = {
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

  beforeEach(module('ubr.registration', function ($provide) {
    counterService = jasmine.createSpyObj('counterService', ['getRegistrationPriceInfo']);
    $provide.provider('counterService', {
      $get: function () {
        return counterService;
      }
    });
  }));

  beforeEach(inject(function ($injector, $rootScope, $compile){
    $q = $injector.get('$q');
    scope = $rootScope.$new();
    scope.registrationForm = {};

    registrationController = {
      price: 0
    };
    registrationController.handleAsyncError = jasmine.createSpy('handleAsyncError');
    registrationController.clearAsyncError = jasmine.createSpy('clearAsyncError');
    scope.prc = registrationController;
    scope.voucherNumber = 'green-voucher';

    voucherInputElement = angular.element('<input name="voucherNumber" ng-change="refreshPriceInfo()" type="text" ng-model="voucherNumber" ubr-voucher-number>');

    $compile(voucherInputElement)(scope);
    scope.$digest();
  }));

  it('should provide error info when trying to use an invalid voucher', function () {
    var deferredPriceInfo = $q.defer();
    var priceInfoPromise = deferredPriceInfo.promise;
    var returnedError = {
      code: 'INVALID_VOUCHER_STATUS'
    };

    counterService.getRegistrationPriceInfo.and.returnValue(priceInfoPromise);

    voucherInputElement.val('yellow-voucher').trigger('input');
    scope.$apply();

    deferredPriceInfo.reject(returnedError);
    scope.$digest();

    var ngModelController = voucherInputElement.controller('ngModel');

    expect(counterService.getRegistrationPriceInfo).toHaveBeenCalled();
    expect(ngModelController.$error.redeemable).toBeTruthy();
    expect(ngModelController.$error.voucher).toBeTruthy();
    expect(ngModelController.$touched).toBeTruthy();
  });

  it('should provide error info when something goes wrong while retrieving the registration price', function () {
    var deferredPriceInfo = $q.defer();
    var priceInfoPromise = deferredPriceInfo.promise;
    var returnedError = {
      code: 'SOME_API_ERROR'
    };

    counterService.getRegistrationPriceInfo.and.returnValue(priceInfoPromise);

    voucherInputElement.val('yellow-voucher').trigger('input');
    scope.$apply();

    deferredPriceInfo.reject(returnedError);
    scope.$digest();

    var ngModelController = voucherInputElement.controller('ngModel');

    expect(counterService.getRegistrationPriceInfo).toHaveBeenCalled();
    expect(registrationController.handleAsyncError).toHaveBeenCalled();
    expect(ngModelController.$error.voucher).toBeTruthy();
    expect(ngModelController.$touched).toBeTruthy();
  });

  it('should refresh the price info', function () {
    var deferredPriceInfo = $q.defer();
    var priceInfoPromise = deferredPriceInfo.promise;

    counterService.getRegistrationPriceInfo.and.returnValue(priceInfoPromise);

    voucherInputElement.val('yellow-voucher').trigger('input');
    scope.$apply();

    deferredPriceInfo.resolve(priceInfo);
    scope.$digest();

    var ngModelController = voucherInputElement.controller('ngModel');

    expect(counterService.getRegistrationPriceInfo).toHaveBeenCalled();
    expect(ngModelController.$error.voucher).toBeFalsy();
  });

  it('should refresh the price info to the priceInfo.price if no voucherNumber is present', function () {
    var deferredPriceInfo = $q.defer();
    var priceInfoPromise = deferredPriceInfo.promise;

    counterService.getRegistrationPriceInfo.and.returnValue(priceInfoPromise);

    voucherInputElement.val('').trigger('input');
    scope.$apply();

    deferredPriceInfo.resolve(priceInfo);
    scope.$digest();

    var ngModelController = voucherInputElement.controller('ngModel');

    expect(counterService.getRegistrationPriceInfo).toHaveBeenCalled();
    expect(ngModelController.$error.voucher).toBeFalsy();
    expect(registrationController.unreducedPrice).toEqual('5,25');
  });
});

