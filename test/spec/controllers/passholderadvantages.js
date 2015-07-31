'use strict';

describe('Controller: PassholderAdvantagesController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var advantageController, scope, advantage, advantageService, $q;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $injector) {
    advantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 2,
      title: 'untitled'
    };

    scope = $rootScope.$new();

    advantageService = $injector.get('advantageService');
    $q = $injector.get('$q');

    advantageController = $controller('PassholderAdvantageController', {
      passholder: { passNumber: '01234567891234' },
      advantages: [advantage],
      advantageService: advantageService
    });
  }));

  it('should lock an advantage before exchanging it', function () {
    advantageController.exchangeAdvantage(advantage);
    expect(advantageController.advantages[0].locked).toBeTruthy();
  });

  it('should unlock and advantage after it failed to exchange', function () {
    var deferredExchange = $q.defer();
    spyOn(advantageService, 'exchange').and.returnValue(deferredExchange.promise);

    advantageController.exchangeAdvantage(advantage);
    deferredExchange.reject();
    scope.$digest();

    expect(advantageController.advantages[0].locked).toBeFalsy();
  });

  it('should update and advantage after it is exchanged', function () {
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

});
