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
  var passholderService, $httpBackend, $q, $scope, Passholder, Pass;

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

  it('returns a pass from the server and keeps it cached', function() {
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

  it('throws an error when the request returns an error', function() {
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

  it('should persist and cache passholders', function (done) {
    var uitpasNumber = '0930000422202';
    var passholderPostData = identityData.passHolder;
    passholderPostData.name.last = 'New last name';
    passholderPostData.address.city = 'Leuven';

    var expectedPassholder = identityData;
    expectedPassholder.passHolder.name.last = 'New last name';
    expectedPassholder.passHolder.address.city = 'Leuven';
    var pass = new Pass(expectedPassholder);

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber, passholderPostData)
      .respond(200, JSON.stringify(passholderPostData));

    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(200, expectedPassholder);

    var assertCachedAndPersisted = function (response) {
      expect(passholderService.findPass).toHaveBeenCalled();
      expect(response).toEqual(pass.passholder);
      done();
    };
    spyOn(passholderService, 'findPass').and.callThrough();

    passholderService.update(passholderPostData, uitpasNumber).then(assertCachedAndPersisted);
    $httpBackend.flush();
  });

  it('throws an error when the passholder can\'t be updated on the server', function (done) {
    var uitpasNumber = '0930000422202';
    var passholderPostData = identityData.passHolder;

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
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber, passholderPostData)
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
    var deferredPassholder = $q.defer();
    var passholderPromise = deferredPassholder.promise;

    var passholder = new Passholder(identityData.passHolder);
    var advantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 2,
      title: 'untitled'
    };

    spyOn(passholderService, 'findPass').and.returnValue(passholderPromise);
    deferredPassholder.resolve(passholder);

    passholderService.updatePoints('advantageExchanged', advantage, identityData.uitPas.number);

    expect(passholderService.findPass).toHaveBeenCalled();
  });
});
