'use strict';

describe('Controller: PassholderActivityTariffsController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var $scope, $httpBackend, $q, $controller, activityService, modalInstance, TicketSaleAPIError;

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
          prices: [
            {priceClass: 'Default prijsklasse', price: 1.5, type: 'KANSENTARIEF'}
          ]
        }
      ]
    }
  }
  };

  var passholder = { passNumber: '01234567891234', points: 123 };

  beforeEach(inject(function ($injector, $rootScope){
    $controller = $injector.get('$controller');

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
    TicketSaleAPIError = {
      ORANGE_API_ERROR: {
        message: 'Orange API Error',
        step: 'orangeStep'
      }
    };
  }));

  function getControllerForPassholder(passholder) {
    var controller = $controller('PassholderActivityTariffsController', {
      passholder: passholder,
      activity: activity,
      $uibModalInstance: modalInstance,
      activityService: activityService,
      $rootScope: $scope,
      TicketSaleAPIError: TicketSaleAPIError
    });

    return controller;
  }

  it('should should have certain paramaters at initialisation', function () {
    var controller = getControllerForPassholder(passholder);
    expect(controller.passholder).toEqual(passholder);
    expect(controller.activity).toEqual(activity);
  });

  it('can dismiss the modal', function () {
    var controller = getControllerForPassholder(passholder);
    controller.cancelModal();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('can get the size of an object', function () {
    var controller = getControllerForPassholder(passholder);

    expect(controller.sizeOff(passholder)).toBe(2);
  });

  it('can submit the activity tariffs form', function () {
    var controller = getControllerForPassholder(passholder);
    var deferredClaim = $q.defer();
    var claimPromise = deferredClaim.promise;

    controller.selectedTariff = {
      type: 'COUPON',
      id: 123,
      price: 1235,
      priceClass: 'Basisprijs'
    };

    spyOn(activityService, 'claimTariff').and.returnValue(claimPromise);
    spyOn($scope, '$emit');

    controller.claimTariff(passholder, activity);

    expect(controller.formSubmitBusy).toBeTruthy();

    deferredClaim.resolve({claim: 'claim'});
    $scope.$digest();

    expect($scope.$emit).toHaveBeenCalled();
    expect(controller.formSubmitBusy).toBeFalsy();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('can handle errors during form submit', function () {
    var controller = getControllerForPassholder(passholder);
    var deferredClaim = $q.defer();
    var claimPromise = deferredClaim.promise;

    controller.selectedTariff = {
      type: 'COUPON',
      id: 123,
      price: 1235,
      priceClass: 'Basisprijs'
    };
    var serviceError = {
      code: 'TARIFF_NOT_CLAIMED',
      title: 'Tarief niet toegekend',
      message: 'Het geselecteerde tarief voor activiteit "ACTIVITY" kon niet worden toegekend.'
    };

    spyOn(activityService, 'claimTariff').and.returnValue(claimPromise);
    spyOn($scope, '$emit');

    controller.claimTariff(passholder, activity);

    expect(controller.formSubmitBusy).toBeTruthy();

    deferredClaim.reject(serviceError);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.asyncError).toEqual(serviceError);
    expect($scope.$emit).not.toHaveBeenCalled();
    expect(modalInstance.close).not.toHaveBeenCalled();
  });

  it('it should keep track of the total ticket price when buying multiple group tickets', function (){
    var group = {availableTickets: 10};
    var controller = getControllerForPassholder(group);

    expect(controller.groupSale.maxTickets).toEqual(10);
    expect(controller.groupSale.getTotalPrice()).toEqual(1.5);

    controller.groupSale.tickets = 5;
    expect(controller.groupSale.getTotalPrice()).toEqual(7.5);
  });

  it('it displays a user friendly error message when the API returns a known error', function () {
    var controller = getControllerForPassholder(passholder);
    var ticketSaleError = {
      code: 'ORANGE_API_ERROR',
      message: 'I\'m a funky API error with technical details. Don\'t show me to noobs.'
    };
    var expectedAsyncError = {
      cleanMessage: 'Orange API Error',
      code: 'ORANGE_API_ERROR',
      message: 'I\'m a funky API error with technical details. Don\'t show me to noobs.'
    };

    controller.handleAsyncError(ticketSaleError);
    expect(controller.asyncError).toEqual(expectedAsyncError);

    controller.clearAsyncError();
    expect(controller.asyncError).toEqual(false);
  });
});
