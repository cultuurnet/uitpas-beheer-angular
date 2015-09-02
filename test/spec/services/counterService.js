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
  var counterService, scope, $cookies, $httpBackend, $q, uitid, Pass, Passholder;

  var fakeCookieKey = function (cookieKey) {
    spyOn(counterService, 'determineLastActiveCookieKey').and.callFake(function() {
      return {
        then: function(callback) { return callback(cookieKey); }
      };
    });
  };

  function fakeCounters(counters) {
    spyOn(counterService, 'getList').and.callFake(function () {
      return {
        then: function(callback) { return callback(counters); }
      };
    });
  }

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
    Pass = $injector.get('Pass');
    Passholder = $injector.get('Passholder');
    uitid = $injector.get('uitid');
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
      .expectGET(apiUrl + 'counters')
      .respond(200, JSON.stringify(counters));

    counterService.getList().then(checkRequestedList);
    $httpBackend.flush();
  });

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

  it('can get the active counter', function () {
    var deferredRequest = $q.defer();
    var counterPromise = deferredRequest.promise;

    spyOn(counterService, 'getActiveFromServer').and.returnValue(counterPromise);

    counterService.getActive();

    deferredRequest.resolve(counters['1149']);
    scope.$digest();

    expect(counterService.active).toEqual(counters['1149']);
  });

  it('can set an active counter', function (done) {
    var counterToActivate = counters['1149'];

    var deferredToServer = $q.defer(); var setOnServer = deferredToServer.promise;
    spyOn(counterService, 'setActiveOnServer').and.returnValue(setOnServer);

    var deferredToClient = $q.defer(); var setOnClient = deferredToClient.promise;
    spyOn(counterService, 'setLastActiveId').and.returnValue(setOnClient);

    spyOn(scope, '$emit');

    var counterActivated = function () {
      expect(counterService.setActiveOnServer).toHaveBeenCalledWith('1149');
      expect(counterService.setLastActiveId).toHaveBeenCalledWith('1149');
      expect(counterService.active).toEqual(counterToActivate);
      expect(scope.$emit).toHaveBeenCalledWith('activeCounterChanged', counterToActivate);
      done();
    };

    counterService.setActive(counterToActivate)
      .then(counterActivated);
    deferredToServer.resolve();
    deferredToClient.resolve();
    scope.$digest();
  });

  it('rejects when it can not set the active counter id', function (done) {
    var counterToActivate = counters['1149'];

    var deferredToServer = $q.defer();
    var setOnServer = deferredToServer.promise;
    spyOn(counterService, 'setActiveOnServer').and.returnValue(setOnServer);

    var deferredToCookie = $q.defer();
    var setOnCookie = deferredToCookie.promise;
    spyOn(counterService, 'determineLastActiveCookieKey').and.returnValue(setOnCookie);

    spyOn(scope, '$emit');

    var counterActivated = function (response) {
      expect(response).toBeUndefined();
      done();
    };

    var counterNotActivated = function (error) {
      expect(error).toEqual('something went wrong while activating the counter');
      done();
    };

    counterService.setActive(counterToActivate)
      .then(counterActivated, counterNotActivated);

    deferredToServer.reject();
    deferredToCookie.reject();

    scope.$digest();
  });

  it('can persist the active counter', function (done) {
    var activeCounterId = '1149';
    $httpBackend
      .expectPOST(apiUrl + 'counters/active', {id: activeCounterId})
      .respond(200);

    var activeCounterPersisted = function () {
      done();
    };

    counterService.setActiveOnServer(activeCounterId).then(activeCounterPersisted);
    $httpBackend.flush();
  });

  it('can determine the last active cookie key', function (done) {
    var deferredUser = $q.defer();
    var userPromise = deferredUser.promise;
    var user = {
      id: '65'
    };

    spyOn(uitid, 'getUser').and.returnValue(userPromise);

    var assertCookieKey = function (cookieKey) {
      expect(cookieKey).toEqual('lastActiveCounter-65');
      done();
    };

    counterService
      .determineLastActiveCookieKey()
      .then(assertCookieKey);

    deferredUser.resolve(user);

    scope.$digest();
  });

  it('throws an error when it can not determine the last active cookie key', function (done) {
    var deferredUser = $q.defer();
    var userPromise = deferredUser.promise;

    spyOn(uitid, 'getUser').and.returnValue(userPromise);

    var assertNoCookieKey = function (cookieKey) {
      expect(cookieKey).toBeUndefined();
      done();
    };

    counterService
      .determineLastActiveCookieKey()
      .catch(assertNoCookieKey);

    deferredUser.reject();

    scope.$digest();
  });

  it('can get the price for a registration', function (done) {
    var pass = new Pass({
      uitPas: {
        number: '123456789'
      }
    });
    var passholder = new Passholder({
      birth: {
        date: '1983-02-03'
      },
      address: {
        postalCode: 3000
      }
    });
    var voucherNumber = false;
    var reason = false;

    var deferredRequest = $q.defer();
    var pricePromise = deferredRequest.promise;

    var priceResponse = {
      price: '5,25',
      kansenStatuut: true,
      ageRange: {
        from: 15,
        to: 25
      },
      voucherType: {
        name: 'Party people',
        prefix: 'Pp'
      }
    };

    var assertPriceInfo = function(response) {
      expect(response).toEqual(priceResponse);
      done();
    };

    $httpBackend
      .expectGET(apiUrl + 'uitpas/' + pass.number + '/price?date_of_birth=1983-02-03&postal_code=3000&reason=FIRST_CARD')
      .respond(200, pricePromise);

    counterService.getRegistrationPriceInfo(pass, passholder, voucherNumber, reason).then(assertPriceInfo);

    deferredRequest.resolve(priceResponse);

    $httpBackend.flush();

    // Do that again with a voucher number.
    voucherNumber = 'voucher number';
    counterService.getRegistrationPriceInfo(pass, passholder, voucherNumber, reason).then(assertPriceInfo);

    deferredRequest.resolve(priceResponse);

    $httpBackend.flush();
  });
});
