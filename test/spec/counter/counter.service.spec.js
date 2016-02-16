'use strict';

describe('Service: counterService', function () {

  var apiUrl = 'http://example.com/';

  beforeEach(module('ubr.utilities'));

  // load the service's module
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  // instantiate service
  var counterService, scope, $cookies, $httpBackend, $q, uitid, Pass, Passholder, Counter, Role;

  var fakeCookieKey = function (cookieKey) {
    spyOn(counterService, 'determineLastActiveCookieKey').and.returnValue($q.resolve(cookieKey));
  };

  function fakeCounters(counters) {
    spyOn(counterService, 'getList').and.returnValue($q.resolve(counters));
  }

  var counters = {
    '1149': {
      'actorId': 'c1372ef5-65db-4f95-aa2f-478fb5b58258',
      'consumerKey': '9d466f7f88231cf298d5cb5dd23d55af',
      'id': '1149',
      'name': 'KSA-VKSJ Denderhoutem',
      'role': 'member',
      'permissions': [],
      'groups': ['Checkin and Ticket balies'],
      'cardSystems': {
        '1': {
          'distributionKeys': [],
          'groups': ['Checkin and Ticket balies'],
          'name': 'UiTPAS Regio Aalst',
          'permissions': [],
          'id': 1
        }
      }
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
    Counter = $injector.get('Counter');
    Role = $injector.get('Role');
  }));

  it('should remember the last active counter', function (done) {
    var cookieKey = 'lastActiveCounter-xyz';
    var counterId = 'counter-xyz';

    var failed = jasmine.createSpy('failed');

    var assertCounter = function (counter) {
      expect(counter).toBe(counterId);
      expect(counterService.determineLastActiveCookieKey).toHaveBeenCalled();
      expect($cookies.get).toHaveBeenCalledWith(cookieKey);
      expect($cookies.put).toHaveBeenCalledWith(cookieKey, counterId);
      done();
    };

    fakeCookieKey(cookieKey);
    spyOn($cookies, 'get').and.callThrough();
    spyOn($cookies, 'put').and.callThrough();

    // Set the last active counter id
    var activeCounterSet = counterService.setLastActiveId(counterId);

    // Try to retrieve the last counter id
    var counterRetrieved = activeCounterSet.then(counterService.getLastActiveId, failed);
    counterRetrieved.then(assertCounter);
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
    var counterObjects = {
      '1149': new Counter(counters[1149])
    };

    var checkCachedList = function (list) {
      expect(list).toEqual(counterObjects);
      done();
    };

    var checkRequestedList = function (list) {
      expect(list).toEqual(counterObjects);
      counterService.getList().then(checkCachedList);
    };

    $httpBackend
      .expectGET(apiUrl + 'counters')
      .respond(200, JSON.stringify(counters));

    counterService.getList().then(checkRequestedList);
    $httpBackend.flush();
  });

  it('rejects when it can not get a list of counters', function (done) {
    var checkRequestedListFailed = function (error) {
      expect(error).toEqual('unable to retrieve counters for active user');
      done();
    };

    $httpBackend
      .expectGET(apiUrl + 'counters')
      .respond(404);

    counterService.getList().catch(checkRequestedListFailed);
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
      done();
    };

    counterService.getActive().then(activeCounterFetchedFromAPI);
    deferredRequest.reject();
    scope.$digest();
  });

  it('does not promise an active counter when the user has more than one', function (done) {
    var deferredRequest = $q.defer();
    var counterRequest = deferredRequest.promise;
    var multipleCounters = {};
    var success = jasmine.createSpy('success');
    var assertFailure = function(reason) {
      expect(reason).toBe('can\'t activate only counter when there are none or multiple');
      expect(counterService.setActive).not.toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
      done();
    };

    multipleCounters['1149'] = counters['1149'];
    multipleCounters['1234'] = counters['1149'];
    fakeCounters(multipleCounters);
    spyOn(counterService, 'getActiveFromServer').and.returnValue(counterRequest);
    spyOn(counterService, 'setActive');

    counterService.getActive().catch(assertFailure);
    deferredRequest.reject();
    scope.$digest();
  });

  it('can get the active counter from the server', function (done) {
    var activeCounter = new Counter(counters[1149]);
    $httpBackend
      .expectGET(apiUrl + 'counters/active')
      .respond(200, activeCounter);

    var activeCounterPersisted = function (activeCounterFromServer) {
      expect(activeCounterFromServer).toEqual(activeCounter);
      done();
    };

    counterService.getActiveFromServer().then(activeCounterPersisted);
    $httpBackend.flush();
  });

  it('rejects when it can not get the active counter from the server', function (done) {
    $httpBackend
      .expectGET(apiUrl + 'counters/active')
      .respond(404);

    var activeCounterNotPersisted = function () {
      done();
    };

    counterService.getActiveFromServer().catch(activeCounterNotPersisted);
    $httpBackend.flush();
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

  it('rejects when it can not set the active counter on the server', function (done) {
    var counterId = 10;
    $httpBackend
      .expectPOST(apiUrl + 'counters/active', {id: counterId})
      .respond(404);

    var activeCounterNotPersisted = function () {
      done();
    };

    counterService.setActiveOnServer(counterId).catch(activeCounterNotPersisted);
    $httpBackend.flush();
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
  });

  it('can get the price for a registration with voucher number', function (done) {
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
    var voucherNumber = 'voucher number';
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
      .expectGET(apiUrl + 'uitpas/' + pass.number + '/price?date_of_birth=1983-02-03&postal_code=3000&reason=FIRST_CARD&voucher_number=voucher+number')
      .respond(200, pricePromise);

    counterService.getRegistrationPriceInfo(pass, passholder, voucherNumber, reason).then(assertPriceInfo);

    deferredRequest.resolve(priceResponse);

    $httpBackend.flush();
  });

  it('can get the price for a registration with limited information', function (done) {
    var pass = new Pass({
      uitPas: {
        number: '123456789'
      }
    });
    var passholder = new Passholder();

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
      .expectGET(apiUrl + 'uitpas/' + pass.number + '/price?reason=FIRST_CARD')
      .respond(200, pricePromise);

    counterService
      .getRegistrationPriceInfo(pass, passholder)
      .then(assertPriceInfo);

    deferredRequest.resolve(priceResponse);

    $httpBackend.flush();
  });

  it('can return error information when it can notget the price for a registration', function (done) {
    var pass = new Pass({
      uitPas: {
        number: '123456789'
      }
    });
    var passholder = new Passholder();

    var errorResponse = {
      code: 'NOT_AUTHORIZED'
    };

    var assertError = function() {
      done();
    };

    $httpBackend
      .expectGET(apiUrl + 'uitpas/' + pass.number + '/price?reason=FIRST_CARD')
      .respond(403, $q.reject(errorResponse));

    counterService
      .getRegistrationPriceInfo(pass, passholder)
      .catch(assertError);


    $httpBackend.flush();
  });

  it('can get the price for an upgrade', function (done) {
    var cardSystemId = 1;
    var passholder = new Passholder({
      birth: {
        date: '1983-02-03'
      },
      address: {
        postalCode: 3000
      }
    });
    var voucherNumber = 'this-is-a-coupon';

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
      .expectGET(apiUrl + 'cardsystem/' + cardSystemId + '/price?date_of_birth=1983-02-03&postal_code=3000&voucher_number=this-is-a-coupon')
      .respond(200, $q.resolve(priceResponse));

    counterService.getUpgradePriceInfo(cardSystemId, passholder, voucherNumber).then(assertPriceInfo);

    $httpBackend.flush();
  });

  it('can get the price for an upgrade with limited information', function (done) {
    var cardSystemId = 1;
    var passholder = new Passholder();
    var voucherNumber = false;

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
      .expectGET(apiUrl + 'cardsystem/' + cardSystemId + '/price')
      .respond(200, $q.resolve(priceResponse));

    counterService.getUpgradePriceInfo(cardSystemId, passholder, voucherNumber).then(assertPriceInfo);

    $httpBackend.flush();
  });

  it('can return error information when it can not get the price for an upgrade', function (done) {
    var cardSystemId = 1;
    var passholder = new Passholder();
    var voucherNumber = false;

    var errorResponse = {
      code: 'NOT_AUTHORIZED'
    };

    var assertError = function() {
      done();
    };

    $httpBackend
      .expectGET(apiUrl + 'cardsystem/' + cardSystemId + '/price')
      .respond(403, $q.reject(errorResponse));

    counterService.getUpgradePriceInfo(cardSystemId, passholder, voucherNumber).catch(assertError);

    $httpBackend.flush();
  });

  it('can get memberships from the API', function(done) {
    var membershipsData = [
      {
        uid: 'dirk-dirkington',
        nick: 'Dirk Dirkington',
        role: 'ADMIN'
      },
      {
        uid: 'foo-bar',
        nick: 'Foo Bar',
        role: 'MEMBER'
      }
    ];

    var expectedMemberships = [
      {
        uid: 'dirk-dirkington',
        nick: 'Dirk Dirkington',
        role: Role.ADMIN
      },
      {
        uid: 'foo-bar',
        nick: 'Foo Bar',
        role: Role.MEMBER
      }
    ];

    $httpBackend
      .expectGET(apiUrl + 'counters/active/members')
      .respond(200, membershipsData);

    var assertMemberships = function (receivedMemberships) {
      expect(receivedMemberships).toEqual(expectedMemberships);
      done();
    };

    counterService
      .getMemberships()
      .then(assertMemberships);

    $httpBackend.flush();
  });

  it('can handle an error when it gets memberships from the API', function (done) {
    $httpBackend
      .expectGET(apiUrl + 'counters/active/members')
      .respond(400, {code: 'Wunderbar'});

    var assertError = function (error) {
      expect(error).toEqual({'code': 'Wunderbar'});
      done();
    };

    counterService
      .getMemberships()
      .catch(assertError);
    $httpBackend.flush();
  });

  it('can create a new membership', function (done) {
    var creationResponse = {
      uid: 'new-id-for-now-user',
      nick: 'e@mail',
      role: 'member'
    };
    $httpBackend
      .expectPOST(apiUrl + 'counters/active/members')
      .respond(200, creationResponse);

    var assertMemberResponse = function (member) {
      expect(member).toEqual(creationResponse);
      done();
    };

    counterService
      .createMembership(creationResponse.nick)
      .then(assertMemberResponse);
    $httpBackend.flush();
  });

  it('can handle an error when it creates an new membership', function(done) {
    $httpBackend
      .expectPOST(apiUrl + 'counters/active/members')
      .respond(400, 'error');

    var assertError = function (error) {
      expect(error).toBeDefined();
      done();
    };

    counterService
      .createMembership('e@mail')
      .catch(assertError);
    $httpBackend.flush();
  });

  it('can delete a membership', function (done) {
    var uid = 'new-id-for-now-user';
    $httpBackend
      .expectDELETE(apiUrl + 'counters/active/members/' + uid)
      .respond(200);

    var assertMemberDeleted = function () {
      done();
    };

    counterService
      .deleteMembership(uid)
      .then(assertMemberDeleted);
    $httpBackend.flush();
  });

  it('can handle an error when it deletes a membership', function(done) {
    var uid = 'new-id-for-now-user';
    $httpBackend
      .expectDELETE(apiUrl + 'counters/active/members/' + uid)
      .respond(400, 'error');

    var assertError = function (error) {
      expect(error).toBeDefined();
      done();
    };

    counterService
      .deleteMembership(uid)
      .catch(assertError);
    $httpBackend.flush();
  });

  it('can get a list of schools for the active counter', function (done) {
    var expectedSchools = [
      {
        name: 'School A',
        id: 'unique-id-a'
      },
      {
        name: 'School B',
        id: 'unique-id-b'
      }
    ];

    var assertSchools = function (schoolsFromAPI) {
      expect(schoolsFromAPI).toEqual(expectedSchools);
      done();
    };

    $httpBackend.expectGET(apiUrl + 'schools').respond(200, expectedSchools);

    counterService.getSchools().then(assertSchools);

    $httpBackend.flush();
  });
});
