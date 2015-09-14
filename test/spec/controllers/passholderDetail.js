'use strict';

describe('Controller: PassholderDetailController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var detailController, $rootScope, advantage, $q, moment, $scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, _$rootScope_) {
    advantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 23,
      title: 'untitled'
    };

    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;

    $q = $injector.get('$q');
    moment = $injector.get('moment');

    detailController = $controller('PassholderDetailController', {
      passholder: { passNumber: '01234567891234', points: 123, name: {first: 'Fred'} },
      $rootScope: $rootScope,
      membershipService: {
        list: function () {
          var deferred = $q.defer();

          deferred.reject({});

          return deferred.promise;
        }
      },
      $scope: $scope,
      moment: moment
    });
  }));

  it('should update passholder points when an advantage is exchanged', function () {
    $rootScope.$emit('advantageExchanged', advantage);
    $rootScope.$digest();

    expect(detailController.passholder.points).toEqual(100);
  });

  it('should add activity points when checking in', function () {
    $rootScope.$emit('activityCheckedIn', { act: 'ivity', points: 27});
    $rootScope.$digest();

    expect(detailController.passholder.points).toEqual(150);
  });

  it('makes sure a passholder does not end up with negative points', function () {
    var expensiveAdvantage = advantage;
    expensiveAdvantage.points = 222;

    $rootScope.$emit('advantageExchanged', expensiveAdvantage);
    $rootScope.$digest();

    expect(detailController.passholder.points).toEqual(0);
  });

  it('should update the passholder in the sidebar after the passholder is edited', function () {
    $rootScope.$emit('passholderUpdated', { passNumber: '01234567891234', points: 123, name: {first: 'Karel'} });
    expect(detailController.passholder.name.first).toEqual('Karel');
  });
});
