'use strict';

describe('Service: counterService', function () {

  var apiUrl = 'http://example.com/';

  // load the service's module
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  // instantiate service
  var counterService, scope, $cookies, $httpBackend, $q;

  var fakeCookieKey = function (cookieKey) {
    spyOn(counterService, 'determineLastActiveCookieKey').and.callFake(function() {
      return {
        then: function(callback) { return callback(cookieKey); }
      };
    });
  };

  var counters = {
    '1149': {
      'id': '1149',
      'consumerKey': '9d466f7f88231cf298d5cb5dd23d55af',
      'name': 'KSA-VKSJ Denderhoutem',
      'role': 'member',
      'actorId': 'c1372ef5-65db-4f95-aa2f-478fb5b58258',
      'cardSystems': {
        '1': {
          'permissions': [],
          'groups': ['Checkin and Ticket balies'],
          'id': 1,
          'name': 'UiTPAS Regio Aalst',
          'distributionKeys': []
        }
      },
      'permissions': [],
      'groups': ['Checkin and Ticket balies']
    }
  };

  beforeEach(inject(function ($injector, $rootScope) {
    counterService = $injector.get('counterService');
    scope = $rootScope;
    $cookies = $injector.get('$cookies');
    $httpBackend = $injector.get('$httpBackend');
    $q = $injector.get('$q');
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

  it('returns a list of counters for the active user', function (done) {
    var checkCachedList = function (list) {
      expect(list).toEqual(counters);
      done();
    };

    var checkRequestedList = function (list) {
      expect(list).toEqual(counters);
      counterService.getList().then(checkCachedList);
    };

    $httpBackend
      .expectGET(apiUrl + 'counter/list')
      .respond(200, JSON.stringify(counters));

    counterService.getList().then(checkRequestedList);
    $httpBackend.flush();
  });

  function fakeCounters(counters) {
    spyOn(counterService, 'getList').and.callFake(function () {
      return {
        then: function(callback) { return callback(counters); }
      };
    });
  }

  it('automatically activates a counter when the user only has one', function (done) {
    var deferredRequest = $q.defer();
    var counterRequest = deferredRequest.promise;
    fakeCounters(counters);
    spyOn(counterService, 'getActiveFromServer').and.returnValue(counterRequest);
    spyOn(counterService, 'setActive');

    var activeCounterFetchedFromAPI = function (counter) {
      var expectedCounter = counters['1149'];
      expect(counter).toEqual(expectedCounter);
      expect(counterService.setActive).toHaveBeenCalledWith(expectedCounter);
      counterService.active = counter;
      expect(counterService.getActiveFromServer).toHaveBeenCalled();

      // the active counter should now resolve immediately
      counterService.getActive().then(function(counter) {
        expect(counter).toEqual(expectedCounter);
        expect(counterService.setActive.calls.count()).toEqual(1);
        expect(counterService.getActiveFromServer.calls.count()).toEqual(1);
      });
    };

    var failed = jasmine.createSpy('failed');

    var finished = function () {
      expect(failed).not.toHaveBeenCalled();
      done();
    };

    counterService.getActive().then(activeCounterFetchedFromAPI, failed).finally(finished);
    deferredRequest.reject();
    scope.$digest();
  });

  it('does not promise an active counter when the user has more than one', function (done) {
    var deferredRequest = $q.defer();
    var counterRequest = deferredRequest.promise;
    var multipleCounters = {};
    var success = jasmine.createSpy('success');
    var failed = function(reason) {
      expect(reason).toBe('can\'t activate only counter when there are none or multiple');
    };
    var finished = function () {
      expect(counterService.setActive).not.toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
      done();
    };
    multipleCounters['1149'] = counters['1149'];
    multipleCounters['1234'] = counters['1149'];
    fakeCounters(multipleCounters);
    spyOn(counterService, 'getActiveFromServer').and.returnValue(counterRequest);
    spyOn(counterService, 'setActive');

    counterService.getActive().then(success, failed).finally(finished);

    deferredRequest.reject();
    scope.$digest();
  });
});
