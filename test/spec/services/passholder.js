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
  var passholderService, $httpBackend, $q, $scope;

  beforeEach(inject(function ($injector, $rootScope) {
    $httpBackend = $injector.get('$httpBackend');
    passholderService = $injector.get('passholderService');
    $q = $injector.get('$q');
    $scope = $rootScope;
  }));

  it('returns a passholder from the server and keeps it cached', function() {
    var uitpasNumber = 'this-is-a-number';
    var passholderData = {
      name: 'Foo',
      points: 0,
      uitIdUser: {
        id: 'passholder-id-123'
      },
      dateOfBirth: 1214524800
    };
    var expectedPassholder = {
      name: 'Foo',
      points: 0,
      uitIdUser: {
        id: 'passholder-id-123'
      },
      dateOfBirth: new Date(1214524800000)
    };

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'passholders/' + uitpasNumber)
      .respond(200, JSON.stringify(passholderData));

    // Assertion method.
    var assertPassholder = function(passholder) {
      expect(passholder).toEqual(expectedPassholder);
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
    };

    // Request the passholder data and assert it when its returned.
    passholderService.find(uitpasNumber).then(assertPassholder, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    // Request the passholder data and assert it again, but this time without
    // mocking an HTTP request as the passholder object should have been cached.
    passholderService.find(uitpasNumber).then(assertPassholder, failed);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('throws an error when an invalid passholder is returned', function() {
    var uitpasNumber = 'this-is-a-number';
    var expectedPassholder = {
      name: 'Foo',
      points: 0
    };

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'passholders/' + uitpasNumber)
      .respond(200, JSON.stringify(expectedPassholder));

    var failed = function(error) {
      expect(error.code).toBe('PASSHOLDER_NOT_IDENTIFIED');
    };

    // Request the passholder data and assert it when its returned.
    passholderService.find(uitpasNumber).catch(failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

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
      .expectGET(apiUrl + 'passholders/' + uitpasNumber)
      .respond(404, JSON.stringify(expectedError));

    var failed = function(error) {
      expect(error).toEqual({ code: 'PASSHOLDER_NOT_FOUND', title: 'Not found', message: 'Passholder not found for identification number: this-is-a-number' });
    };

    // Request the passholder data and assert it when its returned.
    passholderService.find(uitpasNumber).catch(failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should persist and cache passholders', function (done) {
    var passholderData = {
      name: 'Foo',
      points: 0,
      uitIdUser: {
        id: 'J0HND03'
      },
      dateOfBirth: new Date(1214524800000)
    };
    var deferredPassholder = $q.defer();
    var passholderPromise = deferredPassholder.promise;

    var assertCachedAndPersisted = function () {
      expect(passholderService.updatePassholderOnServer)
        .toHaveBeenCalledWith(passholderData, 'some-identification');

      expect(passholderService.updatePassholderInCache)
        .toHaveBeenCalledWith(passholderData, 'some-identification', 'J0HND03');

      done();
    };

    spyOn(passholderService, 'updatePassholderOnServer').and.returnValue(passholderPromise);
    spyOn(passholderService, 'updatePassholderInCache');

    passholderService.update(passholderData, 'some-identification').then(assertCachedAndPersisted);

    deferredPassholder.resolve(passholderData);
    $scope.$digest();
  })
});
