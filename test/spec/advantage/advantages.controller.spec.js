'use strict';

describe('Controller: PassholderAdvantagesController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var advantageController, scope, advantage, advantageService, $q, $rootScope, Activity;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector) {
    advantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 2,
      title: 'untitled'
    };

    $rootScope = $injector.get('$rootScope');

    scope = $rootScope.$new();

    advantageService = $injector.get('advantageService');
    $q = $injector.get('$q');
    Activity = $injector.get('Activity');

    advantageController = $controller('PassholderAdvantageController', {
      passholder: { passNumber: '01234567891234' },
      advantages: [advantage],
      advantageService: advantageService,
      '$rootScope': $rootScope,
      '$scope': scope
    });
  }));

  it('should lock an advantage before exchanging it', function () {
    advantageController.exchangeAdvantage(advantage);
    expect(advantageController.advantages[0].exchanging).toBeTruthy();
  });

  it('should unlock and advantage after it failed to exchange', function () {
    var deferredExchange = $q.defer();
    spyOn(advantageService, 'exchange').and.returnValue(deferredExchange.promise);

    advantageController.exchangeAdvantage(advantage);
    deferredExchange.reject();
    scope.$digest();

    expect(advantageController.advantages[0].exchanging).toBeFalsy();
    expect(advantageController.advantages[0].confirmingExchange).toBeFalsy();
  });

  it('should update an advantage after it is exchanged', function () {
    var deferredExchange = $q.defer();
    var updatedAdvantage = {
      exchangeable: false,
      id: 'advantage-id',
      points: 2,
      title: 'untitled'
    };
    spyOn(advantageService, 'exchange').and.returnValue(deferredExchange.promise);

    advantageController.exchangeAdvantage(advantage);
    deferredExchange.resolve(updatedAdvantage);
    scope.$digest();

    expect(advantageController.advantages[0]).toEqual(updatedAdvantage);
  });

  it('should unlock an unlimited advantage after updating', function () {
    var deferredExchange = $q.defer();
    var updatedAdvantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 2,
      title: 'untitled'
    };
    spyOn(advantageService, 'exchange').and.returnValue(deferredExchange.promise);

    advantageController.exchangeAdvantage(advantage);
    deferredExchange.resolve(updatedAdvantage);
    scope.$digest();

    expect(advantageController.advantages[0].exchanging).toBe(false);
  });

  it('should set a variable for insufficient points after updating', function () {
    advantageController.availablePoints = 1;
    var deferredExchange = $q.defer();
    var updatedAdvantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 2,
      title: 'untitled'
    };
    spyOn(advantageService, 'exchange').and.returnValue(deferredExchange.promise);

    advantageController.exchangeAdvantage(advantage);
    deferredExchange.resolve(updatedAdvantage);
    scope.$digest();

    expect(advantageController.advantages[0].insufficientPoints).toBeTruthy();
  });

  it('should confirm advantage exchanges', function () {
    advantageController.initiateExchange(advantage);
    expect(advantageController.advantages[0].confirmingExchange).toBeTruthy();

    advantageController.cancelExchange(advantage);
    expect(advantageController.advantages[0].confirmingExchange).toBeFalsy();
  });

  it('should update the available point when a checkin occurs', function () {
    advantageController.availablePoints = 3;
    var checkedInActivity = {
      points: 1
    };
    spyOn(advantageService, 'list').and.returnValue($q.resolve([]));

    $rootScope.$emit('activityCheckedIn', checkedInActivity);
    scope.$digest();

    expect(advantageController.availablePoints).toEqual(4);
    expect(advantageService.list).toHaveBeenCalled();
  });

  it('should mark advantages with insufficient points when updating advantage exchangeability', function () {
    var mockAdvantages = [
      { points: 0, insufficientPoints: false},
      { points: 1, insufficientPoints: false},
      { points: 2, insufficientPoints: false}
    ];
    var expectedAdvantages = [
      { points: 0, insufficientPoints: false},
      { points: 1, insufficientPoints: false},
      { points: 2, insufficientPoints: true}
    ];
    advantageController.availablePoints = 2;
    advantageController.advantages = mockAdvantages;

    advantageController.updateExchangeability(1);
    expect(advantageController.advantages).toEqual(expectedAdvantages);
  });
});
