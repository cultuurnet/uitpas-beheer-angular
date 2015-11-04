'use strict';

describe('Controller: PassholderDetailController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var detailController, $rootScope, advantage, $q, moment, $scope, passholderService, deferredPassholder;

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

    passholderService = $injector.get('passholderService');


    detailController = $controller('PassholderDetailController', {
      pass: { passholder: { passNumber: '01234567891234', points: 123, name: {first: 'Fred'} } },
      $rootScope: $rootScope,
      membershipService: {
        list: function () {
          var deferred = $q.defer();

          deferred.reject({});

          return deferred.promise;
        }
      },
      $scope: $scope,
      moment: moment,
      passholderService: passholderService,
      activeCounter: {}
    });

    deferredPassholder = $q.defer();
    deferredPassholder.resolve(angular.copy(detailController.passholder));

    spyOn(passholderService, 'findPassholder').and.returnValue(
      deferredPassholder.promise
    );
  }));

  it('should update passholder points when an advantage is exchanged', function () {
    $rootScope.$emit('advantageExchanged', advantage, detailController.passholder.passNumber);
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

  it('should get a list of coupons for the passholder', function () {
    var expectedCoupons = [
      {
        'id': '0',
        'name': 'Cultuurbon',
        'conditions': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
        'date': '2015-12-26',
        'remainingTotal': 4
      },
      {
        'id': '1',
        'name': 'Cultuurbon2',
        'conditions': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
        'date': '2015-11-26',
        'remainingTotal': 5
      },
      {
        'id': '2',
        'name': 'Cultuurbon3',
        'conditions': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
        'date': '2016-01-26',
        'remainingTotal': 3
      }
    ];
    jasmine.spyOn(passholderService, 'getCoupons').and.returnValue($q.resolve(expectedCoupons));
    expect(detailController.coupons).toEqual(expectedCoupons);
    expect(detailController.couponsLoading).toEqual(false);
  });
});
