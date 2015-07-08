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

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('returns a passholder from the server and keeps it cached', function() {
    var uitpasNumber = 'this-is-a-number';
    var expectedPassholder = {
      name: 'Foo',
      points: 0,
      uitIdUser: {
        id: 'passholder-id-123'
      }
    };

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'passholders?identification=' + uitpasNumber)
      .respond(200, JSON.stringify(expectedPassholder));

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
  });
});
