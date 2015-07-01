'use strict';

describe('Controller: AppController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var $controller, appController, $scope, $location, uitid, $q;

  beforeEach(inject(function($injector, $rootScope) {
    $controller = $injector.get('$controller');
    $scope = $rootScope;
    $location = $injector.get('$location');
    uitid = $injector.get('uitid');
    $q = $injector.get('$q');
  }));

  beforeEach(function () {
    spyOn(uitid, 'getUser').and.callFake(function () {
      return {
        then: function (callback) {
          return callback({some: 'user'});
        }
      };
    });

    appController = $controller(
      'AppController', {
        $scope: $scope,
        $location: $location,
        uitid: uitid
      }
    );
  });

  it('can login a user', function () {
    var redirectUrl = 'http://some.url';
    spyOn($location, 'absUrl').and.returnValue(redirectUrl);
    spyOn(uitid, 'login');
    appController.login();
    expect(uitid.login).toHaveBeenCalledWith(redirectUrl);
  });

  it('makes sure the user is authenticated when changing state', function (done) {
    var stateChangeEvent = jasmine.createSpyObj('stateChagenEvent', ['preventDefault']);
    var deferredLoginStatus = $q.defer();
    var loginStatusPromise = deferredLoginStatus.promise;
    var finished = function () {
      expect(uitid.login).not.toHaveBeenCalled();
      done();
    };
    spyOn(uitid, 'getLoginStatus').and.returnValue(loginStatusPromise);
    spyOn(uitid, 'login');
    appController.authenticateStateChange(stateChangeEvent);
    expect(uitid.getLoginStatus).toHaveBeenCalled();

    loginStatusPromise.finally(finished);
    deferredLoginStatus.resolve(true);
    $scope.$digest();
  });

  it('logs in the user when doing an unauthenticated state change', function (done) {
    var stateChangeEvent = jasmine.createSpyObj('stateChangeEvent', ['preventDefault']);
    var deferredLoginStatus = $q.defer();
    var loginStatusPromise = deferredLoginStatus.promise;
    var finished = function () {
      expect(uitid.login).toHaveBeenCalled();
      expect(stateChangeEvent.preventDefault).toHaveBeenCalled();
      done();
    };
    spyOn(uitid, 'getLoginStatus').and.returnValue(loginStatusPromise);
    spyOn(uitid, 'login');
    appController.authenticateStateChange(stateChangeEvent);
    expect(uitid.getLoginStatus).toHaveBeenCalled();

    loginStatusPromise.finally(finished);
    deferredLoginStatus.resolve(false);
    $scope.$digest();
  });

});
