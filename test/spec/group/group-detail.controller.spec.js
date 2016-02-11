'use strict';

describe('Controller: GroupDetailController', function () {

  var $q, passholderServiceMock;
  var apiUrl = 'http://example.com/';
  var controller, $scope, $controller, $state, $rootScope, $injector, $location;

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
    });
  });

  it('should set the group variable in the scope', function () {
    var group = {};
    var controller = $controller('GroupDetailController', {
      group: group
    });
    expect(controller.group).toBe(group);
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
