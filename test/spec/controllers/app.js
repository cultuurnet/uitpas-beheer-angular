'use strict';

describe('Controller: AppController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var $controller, appController, $scope, $location, uitid, $q, counterService, $state;

  beforeEach(inject(function($injector, $rootScope) {
    $controller = $injector.get('$controller');
    $scope = $rootScope;
    $location = $injector.get('$location');
    uitid = $injector.get('uitid');
    $q = $injector.get('$q');
    counterService = $injector.get('counterService');
    $state = $injector.get('$state');
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
        uitid: uitid,
        counterService: counterService,
        $state: $state
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

  it('should redirect to the login page after logging out', function (done) {
    var deferredLogout = $q.defer();
    var logoutPromise = deferredLogout.promise;
    spyOn(uitid, 'logout').and.returnValue(logoutPromise);
    spyOn(appController, 'redirectToLogin');
    var loggedOut = function () {
      expect(appController.redirectToLogin).toHaveBeenCalled();
      done();
    };

    appController.logout();
    expect(uitid.logout).toHaveBeenCalled();

    logoutPromise.finally(loggedOut);
    deferredLogout.resolve();
    $scope.$digest();
  });

  it('should should stop being busy after the app state has changed', function () {
    $scope.appBusy = true;

    $scope.$broadcast('$stateChangeSuccess');
    expect($scope.appBusy).toBeFalsy();

    $scope.appBusy = true;

    $scope.$broadcast('$stateChangeError');
    expect($scope.appBusy).toBeFalsy();
  });

  it ('should set variables for error reporting when a state change error occurs', function () {
    spyOn($state, 'go');
    $scope.$broadcast('$stateChangeError', 'toState', 'toParams', 'fromState', 'fromParams', {
      code: 'PASSHOLDER_NOT_FOUND',
      title: 'Not found',
      message: 'Passholder not found for identification number: identification'
    });
    expect($state.go).toHaveBeenCalledWith('counter.main.error', { title: 'Not found', description: 'Passholder not found for identification number: identification' });
  });

  it('should set the right app state when redirecting to login', function () {
    spyOn($state, 'go').and.stub();
    appController.redirectToLogin();
    expect($state.go).toHaveBeenCalledWith('login');
  });

  it('should set the right app state when redirecting to counters', function () {
    spyOn($state, 'go').and.stub();
    appController.redirectToCounters();
    expect($state.go).toHaveBeenCalledWith('counters');
  });

  it('makes sure the user is authenticated when changing state', function (done) {
    var stateChangeEvent = jasmine.createSpyObj('stateChangeEvent', ['preventDefault']);
    var deferredLoginStatus = $q.defer();
    var loginStatusPromise = deferredLoginStatus.promise;
    var finished = function () {
      expect(uitid.login).not.toHaveBeenCalled();
      done();
    };
    spyOn(uitid, 'getLoginStatus').and.returnValue(loginStatusPromise);
    spyOn(uitid, 'login');
    $scope.$emit('$stateChangeStart', stateChangeEvent);
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
      expect(emitEvent.defaultPrevented).toBeTruthy();
      done();
    };
    spyOn(uitid, 'getLoginStatus').and.returnValue(loginStatusPromise);
    spyOn(uitid, 'login');
    var emitEvent = $scope.$emit('$stateChangeStart', stateChangeEvent);
    expect(uitid.getLoginStatus).toHaveBeenCalled();

    loginStatusPromise.finally(finished);
    deferredLoginStatus.resolve(false);
    $scope.$digest();
  });

  it('requires an active counter for the states that need one', function (done) {
    var toState = { requiresCounter: true };
    var deferredCounter = $q.defer();
    var counterPromise = deferredCounter.promise;
    var finished = function () {
      expect(counterService.getActive).toHaveBeenCalled();
      expect(stateChangeEvent.defaultPrevented).toBeTruthy();
      expect(appController.redirectToCounters).toHaveBeenCalled();
      done();
    };
    spyOn(counterService, 'getActive').and.returnValue(counterPromise);
    spyOn(appController, 'redirectToCounters').and.stub();
    var stateChangeEvent = $scope.$emit('$stateChangeStart', toState);

    deferredCounter.reject();
    counterPromise.finally(finished);
    $scope.$digest();
  });
});
