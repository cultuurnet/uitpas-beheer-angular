'use strict';

describe('Controller: PassholderDetailController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var detailController, scope, advantage;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    advantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 23,
      title: 'untitled'
    };

    scope = $rootScope.$new();

    detailController = $controller('PassholderDetailController', {
      passholder: { passNumber: '01234567891234', points: 123 },
      $rootScope: scope
    });
  }));

  it('should update passholder points when an advantage is exchanged', function () {
    scope.$emit('advantageExchanged', advantage);
    scope.$digest();

    expect(detailController.passholder.points).toEqual(100);
  });

  it('should add activity points when checking in', function () {
    scope.$emit('activityCheckedIn', { act: 'ivity', points: 27});
    scope.$digest();

    expect(detailController.passholder.points).toEqual(150);
  });

  it('makes sure a passholder does not end up with negative points', function () {
    var expensiveAdvantage = advantage;
    expensiveAdvantage.points = 222;

    scope.$emit('advantageExchanged', expensiveAdvantage);
    scope.$digest();

    expect(detailController.passholder.points).toEqual(0);
  });
});
