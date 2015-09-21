'use strict';

describe('Service: passholderService', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  // Instantiate service.
  var passholderService, $httpBackend, $q, $scope, Passholder, Pass, $cacheFactory;

  var identityData = {
    'uitPas': {
      'number': '0930000422202',
      'kansenStatuut': false,
      'status': 'ACTIVE'
    },
    'passHolder': {
      'name': {
        'first': 'Cassandra Ama',
        'last': 'Boadu'
      },
      'address': {
        'street': 'Steenweg op Aalst 94',
        'postalCode': '9308',
        'city': 'Aalst'
      },
      'birth': {
        'date': '2003-12-06',
        'place': 'Sint-Agatha-Berchem'
      },
      'gender': 'FEMALE',
      'nationality': 'Belg',
      'privacy': {
        'email': false,
        'sms': false
      },
      'kansenStatuten': [],
      'inszNumber': '930518-223-61',
      'points': 123
    }
  };

  beforeEach(inject(function ($injector, $rootScope) {
    $httpBackend = $injector.get('$httpBackend');
    passholderService = $injector.get('passholderService');
    $q = $injector.get('$q');
    $scope = $rootScope;
    Passholder = $injector.get('Passholder');
    Pass = $injector.get('Pass');
    $cacheFactory = $injector.get('$cacheFactory');
  }));

  it('returns a pass from the server and keeps it cached', function() {
    var uitpasNumber = '0930000422202';
    var expectedPass= new Pass(identityData);

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(200, JSON.stringify(identityData));

    // Assertion method.
    var assertPass = function(pass) {
      expect(pass).toEqual(expectedPass);
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
    };

    // Request the passholder data and assert it when its returned.
    passholderService.findPass(uitpasNumber).then(assertPass, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    // Request the passholder data and assert it again, but this time without
    // mocking an HTTP request as the passholder object should have been cached.
    passholderService.findPass(uitpasNumber).then(assertPass, failed);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('throws an error when the pass request returns an error', function() {
    var uitpasNumber = 'this-is-a-number';
    var expectedError = {
      type: 'error',
      exception: 'CultuurNet\\UiTPASBeheer\\PassHolder\\PassHolderNotFoundException',
      message: 'No passholder found with this identification.',
      code: 'PASSHOLDER_NOT_FOUND'
    };

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(404, JSON.stringify(expectedError));

    var failed = function(error) {
      expect(error).toEqual({ code: 'PASSHOLDER_NOT_FOUND', title: 'Not found', message: 'Passholder not found for identification number: this-is-a-number' });
    };

    // Request the passholder data and assert it when its returned.
    passholderService.findPass(uitpasNumber).catch(failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('returns a passholder from the server and keeps it cached', function() {
    var uitpasNumber = '0930000422202';
    var expectedPassholder = new Passholder(identityData.passHolder);
    expectedPassholder.passNumber = uitpasNumber;

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(200, JSON.stringify(identityData));

    // Assertion method.
    var assertPassholder = function(passholder) {
      expect(passholder).toEqual(expectedPassholder);
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
    };

    // Request the passholder data and assert it when its returned.
    passholderService.findPassholder(uitpasNumber).then(assertPassholder, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    // Request the passholder data and assert it again, but this time without
    // mocking an HTTP request as the passholder object should have been cached.
    passholderService.findPassholder(uitpasNumber).then(assertPassholder, failed);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('throws an error when the passholder request returns an error', function() {
    var uitpasNumber = 'this-is-a-number';
    var expectedError = {
      type: 'error',
      exception: 'CultuurNet\\UiTPASBeheer\\PassHolder\\PassHolderNotFoundException',
      message: 'No passholder found with this identification.',
      code: 'PASSHOLDER_NOT_FOUND'
    };

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(404, JSON.stringify(expectedError));

    var failed = function(error) {
      expect(error).toEqual({ code: 'PASSHOLDER_NOT_FOUND', title: 'Not found', message: 'Passholder not found for identification number: this-is-a-number' });
    };

    // Request the passholder data and assert it when its returned.
    passholderService.findPassholder(uitpasNumber).catch(failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should persist and cache passholders', function (done) {
    var uitpasNumber = '0930000422202';
    var pass = new Pass(identityData);
    var passholderPostData = pass.passholder;
    passholderPostData.name.last = 'New last name';
    passholderPostData.address.city = 'Leuven';

    var identityResponseData = angular.copy(identityData);
    identityResponseData.passHolder.name.last = 'New last name';
    identityResponseData.passHolder.address.city = 'Leuven';

    var expectedPassholderData = passholderPostData.serialize();

    $httpBackend
      .expectPATCH(apiUrl + 'passholders/' + uitpasNumber, expectedPassholderData)
      .respond(200, JSON.stringify(expectedPassholderData));

    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(200, JSON.stringify(identityResponseData));

    var assertCachedAndPersisted = function (response) {
      expect(passholderService.findPass).toHaveBeenCalled();

      expect(response).toEqual(passholderPostData);

      var passholderCache = $cacheFactory.get('passholderCache');
      var cachedPass = passholderCache.get(uitpasNumber);
      expect(cachedPass).toEqual(pass);
      done();
    };
    spyOn(passholderService, 'findPass').and.callThrough();

    passholderService.update(passholderPostData, uitpasNumber).then(assertCachedAndPersisted);
    $httpBackend.flush();
  });

  it('throws an error with additional info when the passholder can\'t be updated on the server', function (done) {
    var uitpasNumber = '0930000422202';
    var pass = new Pass(identityData);
    var passholderPostData = pass.passholder;

    var expectedAPIError = {
      code: 'Some error code'
    };

    var expectedInternalError = {
      code: 'PASSHOLDER_NOT_UPDATED_ON_SERVER',
      title: 'Passholder not updated on server',
      message: 'The passholder could not be updated on the server: Some error code',
      apiError: expectedAPIError
    };

    $httpBackend
      .expectPATCH(apiUrl + 'passholders/' + uitpasNumber, passholderPostData.serialize())
      .respond(403, JSON.stringify(expectedAPIError));

    var assertRejectedWithError = function (response) {
      expect(response).toEqual(expectedInternalError);
      done();
    };

    var assertNoSuccess = function () {
      expect(passholderService.findPass).not.toHaveBeenCalled();
      done();
    };

    passholderService.update(passholderPostData, uitpasNumber).then(assertNoSuccess, assertRejectedWithError);
    $httpBackend.flush();
  });

  it('throws an error without additional info when the passholder can\'t be updated on the server', function (done) {
    var uitpasNumber = '0930000422202';
    var pass = new Pass(identityData);
    var passholderPostData = pass.passholder;

    var expectedAPIError = {};

    var expectedInternalError = {
      code: 'PASSHOLDER_NOT_UPDATED_ON_SERVER',
      title: 'Passholder not updated on server',
      message: 'The passholder could not be updated on the server.',
      apiError: expectedAPIError
    };

    $httpBackend
      .expectPATCH(apiUrl + 'passholders/' + uitpasNumber, passholderPostData.serialize())
      .respond(403, JSON.stringify(expectedAPIError));

    var assertRejectedWithError = function (response) {
      expect(response).toEqual(expectedInternalError);
      done();
    };

    var assertNoSuccess = function () {
      expect(passholderService.findPass).not.toHaveBeenCalled();
      done();
    };

    passholderService.update(passholderPostData, uitpasNumber).then(assertNoSuccess, assertRejectedWithError);
    $httpBackend.flush();
  });

  it('should refetch and cache the passholder when an advantage is exchanged', function () {
    // Exhange an advantage with less points.
    var deferredPassholder = $q.defer();
    var passholderPromise = deferredPassholder.promise;

    var passholder = new Passholder(identityData.passHolder);
    var advantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 2,
      title: 'untitled'
    };

    spyOn(passholderService, 'findPassholder').and.returnValue(passholderPromise);
    passholderService.updatePoints('advantageExchanged', advantage, identityData.uitPas.number);

    deferredPassholder.resolve(passholder);
    $scope.$digest();

    expect(passholderService.findPassholder).toHaveBeenCalled();

    // Exhange an advantage with more points.
    advantage.points = 125;
    passholderService.updatePoints('advantageExchanged', advantage, identityData.uitPas.number);

    deferredPassholder.resolve(passholder);
    $scope.$digest();

    expect(passholderService.findPassholder).toHaveBeenCalled();
  });

  it('should register a passholder', function () {
    var pass = new Pass(identityData);

    var registration = {
      passHolder: pass.passholder.serialize()
    };

    $httpBackend
      .expectPUT(apiUrl + 'passholders/' + pass.number, registration)
      .respond(200);

    passholderService.register(pass, pass.passholder, false, false);
    $httpBackend.flush();
  });

  it('throws an error when it fails to register a passholder', function (done) {
    var pass = new Pass(identityData);

    var registration = {
      passHolder: pass.passholder.serialize()
    };

    var expectedError = {data: {code: 'ERROR'}};

    var assertRegistered = function (registrationResponse) {
      expect(registrationResponse).toBeUndefined();
      done();
    };

    var assertFail = function (error) {
      expect(error).toEqual(expectedError);
      done();
    };

    $httpBackend
      .expectPUT(apiUrl + 'passholders/' + pass.number, registration)
      .respond(404, expectedError);

    passholderService.register(pass, pass.passholder, false, false).then(
      assertRegistered,
      assertFail
    );
    $httpBackend.flush();
  });

  it('should register a passholder with a voucher and kansenStatuut', function () {
    identityData.uitPas.kansenStatuut = true;
    var pass = new Pass(identityData);
    var voucher = 'voucher';
    var kansenstatuutInfo = {
      endDate: new Date('2011-11-11'),
      remarks: 'remarks',
      includeRemarks: true
    };

    var registration = {
      passHolder: pass.passholder.serialize(),
      voucherNumber: voucher,
      kansenStatuut: {
        endDate: '2011-11-11',
        remarks: 'remarks'
      }
    };

    $httpBackend
      .expectPUT(apiUrl + 'passholders/' + pass.number, registration)
      .respond(200);

    passholderService.register(pass, pass.passholder, voucher, kansenstatuutInfo);
    $httpBackend.flush();
  });

  it('should not register a kansenstatuut pass when additional information is missing', function () {
    identityData.uitPas.kansenStatuut = true;
    var pass = new Pass(identityData);

    var registrationCall = function () {
      passholderService.register(pass, pass.passholder, null);
    };

    expect(registrationCall).toThrowError('Registration for a pass with kansenstatuut should provide additional info.');
  });
});
