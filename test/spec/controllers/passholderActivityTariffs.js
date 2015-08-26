'use strict';

describe('Controller: PassholderActivityTariffsController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var $scope, $httpBackend, $q, controller, activityService, modalInstance;

  var activity = {
    'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
    'title': 'Altijd open',
    'description': '',
    'when': '',
    'points': 182,
    'checkinConstraint': {
    'allowed': true,
      'startDate': new Date('2015-09-01T00:00:00+00:00'),
      'endDate': new Date('2015-09-01T23:59:59+00:00'),
      'reason': ''
  },
    free: true,
      sales: {
    maximumReached: false,
      differentiation: false,
      base: {
      'Default prijsklasse': 6
    },
    tariffs: {
      kansentariefAvailable: true,
        couponAvailable: false,
        lowestAvailable: 1.5,
        list: [
        {
          name: 'Kansentarief',
          type: 'KANSENTARIEF',
          maximumReached: false,
          prices: {
            'Default prijsklasse': 1.5
          }
        }
      ]
    }
  }
  };

  var passholder = { passNumber: '01234567891234', points: 123 };

  beforeEach(inject(function ($injector, $rootScope){
    var $controller = $injector.get('$controller');

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    $q = $injector.get('$q');
    activityService = $injector.get('activityService');
    $scope = $rootScope.$new();
    $httpBackend = $injector.get('$httpBackend');

    controller = $controller('PassholderActivityTariffsController', {
      passholder: passholder,
      activity: activity,
      $modalInstance: modalInstance,
      activityService: activityService,
      $rootScope: $scope
    });
  }));

  it('should should have certain paramaters at initialisation', function () {
    expect(controller.passholder).toEqual(passholder);
    expect(controller.activity).toEqual(activity);
  });

  it('can dismiss the modal', function () {
    controller.cancelModal();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('can get tariff information from the submitted form', function () {
    var tariffFormStubCoupon = {
      tariff: {
        $viewValue: 'COUPON-10-Prijs klasse'
      }
    };
    var expectedTariffInfoCoupon = {
      type: 'COUPON',
      id: '10',
      price: 'Prijs klasse'
    };
    var tariffFormStubKansenstatuut = {
      tariff: {
        $viewValue: 'KANSENSTATUUT--Prijs klasse-met-streep'
      }
    };
    var expectedTariffInfoKansenstatuut = {
      type: 'KANSENSTATUUT',
      id: '',
      price: 'Prijs klasse-met-streep'
    };

    expect(controller.getTariffFromForm(tariffFormStubCoupon)).toEqual(expectedTariffInfoCoupon);
    expect(controller.getTariffFromForm(tariffFormStubKansenstatuut)).toEqual(expectedTariffInfoKansenstatuut);
  });

  it('can submit the activity tariffs form', function () {
    var deferredClaim = $q.defer();
    var claimPromise = deferredClaim.promise;

    var tariffFormStub = {
      tariff: {
        $viewValue: 'COUPON-10-Prijs klasse'
      }
    };

    spyOn(activityService, 'claimTariff').and.returnValue(claimPromise);
    spyOn($scope, '$emit');

    controller.submitForm(passholder, activity, tariffFormStub);

    expect(controller.formSubmitBusy).toBeTruthy();

    deferredClaim.resolve({claim: 'claim'});
    $scope.$digest();

    expect($scope.$emit).toHaveBeenCalled();
    expect(controller.formSubmitBusy).toBeFalsy();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('can handle errors during form submit', function () {
    var deferredClaim = $q.defer();
    var claimPromise = deferredClaim.promise;

    var tariffFormStub = {
      tariff: {
        $viewValue: 'COUPON-10-Prijs klasse'
      }
    };
    var serviceError = {
      code: 'TARIFF_NOT_CLAIMED',
      title: 'Tarief niet toegekend',
      message: 'Het geselecteerde tarief voor activiteit "ACTIVITY" kon niet worden toegekend voor PASSHOLDER'
    };

    spyOn(activityService, 'claimTariff').and.returnValue(claimPromise);
    spyOn($scope, '$emit');

    controller.submitForm(passholder, activity, tariffFormStub);

    expect(controller.formSubmitBusy).toBeTruthy();

    deferredClaim.reject(serviceError);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.formSubmitError).toEqual(serviceError);
    expect($scope.$emit).not.toHaveBeenCalled();
    expect(modalInstance.close).not.toHaveBeenCalled();
  });
});