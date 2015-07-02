'use strict';

describe('Service: counterService', function () {

  // load the service's module
  beforeEach(module('uitpasbeheerApp'));

  // instantiate service
  var counterService, scope, $cookies;

  var fakeCookieKey = function (cookieKey) {
    spyOn(counterService, 'determineLastActiveCookieKey').and.callFake(function() {
      return {
        then: function(callback) { return callback(cookieKey); }
      };
    });
  };

  beforeEach(inject(function ($injector, $rootScope) {
    counterService = $injector.get('counterService');
    scope = $rootScope;
    $cookies = $injector.get('$cookies');
  }));

  it('should remember the last active counter', function (done) {
    var cookieKey = 'lastActiveCounter-xyz';
    var counterId = 'counter-xyz';

    //var failed = function(reason) {
    //  expect(reason).toBe('there is no last active counter');
    //};

    var failed = jasmine.createSpy('failed');

    var assertCounter = function (counter) {
      expect(counter).toBe(counterId);
    };

    var finished = function () {
      expect(counterService.determineLastActiveCookieKey).toHaveBeenCalled();
      expect(failed).not.toHaveBeenCalled();
      expect($cookies.get).toHaveBeenCalledWith(cookieKey);
      done();
    };

    fakeCookieKey(cookieKey);
    spyOn($cookies, 'get').and.callThrough();
    spyOn($cookies, 'put').and.callThrough();

    // Set the last active counter id
    var activeCounterSet = counterService.setLastActiveId(counterId);
    expect($cookies.put).toHaveBeenCalledWith(cookieKey, counterId);

    // Try to retrieve the last counter id
    var counterRetrieved = activeCounterSet.then(counterService.getLastActiveId, failed);
    counterRetrieved.then(assertCounter, failed).finally(finished);
    scope.$digest();
  });

  it('can\'t remember the last active counter when there is none', function (done) {
    fakeCookieKey('some-cookie-key');
    spyOn($cookies, 'get').and.callThrough();

    var failed = function(reason) {
      expect(reason).toBe('there is no last active counter');
    };

    var success = jasmine.createSpy('success');

    var finished = function () {
      expect(success).not.toHaveBeenCalled();
      done();
    };

    var counterRetrieved = counterService.getLastActiveId();
    counterRetrieved.then(success, failed).finally(finished);
    scope.$digest();
  });

});
