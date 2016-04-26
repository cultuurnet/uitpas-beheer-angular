'use strict';

describe('Controller: GroupDetailController', function () {

  var passholderServiceMock;
  var apiUrl = 'http://example.com/';
  var $controller, $state, $rootScope, $injector, $location, $q;

  var identification = 1234567;
  var response = {};

  // load the controller's module
  beforeEach(module('uitpasbeheerAppViews'));
  beforeEach(module('ui.router'));
  beforeEach(function() {
    module('ubr.group', function($provide) {
      $provide.constant('appConfig', {
        apiUrl: apiUrl
      });
      $provide.value('passholderService', passholderServiceMock = {});
    });

    inject(function (_$controller_, _$injector_, _$rootScope_, _$state_, _$location_) {
      $rootScope = _$rootScope_;
      $injector = _$injector_;
      $controller = _$controller_;
      $state = _$state_;
      $location = _$location_;
      $q = _$injector_.get('$q');
    });
  });

  it('should initialise all the variables in the scope', function () {
    var group = {
      passNumber: '0930000809812'
    };
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
    passholderServiceMock.getCoupons = jasmine.createSpy('getCoupons').and.returnValue($q.resolve(expectedCoupons));

    var controller = $controller('GroupDetailController', {
      group: group,
      couponsLoading: false
    });
    $rootScope.$digest();
    expect(controller.group).toBe(group);
    expect(passholderServiceMock.getCoupons).toHaveBeenCalledWith(group.passNumber);
    expect(controller.coupons).toEqual(expectedCoupons);
    expect(controller.couponsLoading).toEqual(false);
  });

  it('should load the passholders data', function () {
    passholderServiceMock.findPass = jasmine.createSpy('findPass').and.returnValue(response);
    var stateParams = {
      identification: identification,
      passholder: {},
      activity: {}
    };
    $state.go('counter.main.group.activityTariffs', stateParams);
    $rootScope.$digest();
    expect(passholderServiceMock.findPass).toHaveBeenCalledWith(identification);
  });
});
