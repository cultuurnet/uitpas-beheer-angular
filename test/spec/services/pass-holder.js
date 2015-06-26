'use strict';

describe('Service: passHolderService', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  // Instantiate service.
  var passHolderService, $httpBackend, $q, $scope;

  beforeEach(inject(function ($injector, $rootScope) {
    $httpBackend = $injector.get('$httpBackend');
    passHolderService = $injector.get('passHolderService');
    $q = $injector.get('$q');
    $scope = $rootScope;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('returns a pass holder from the server and keeps it cached', function() {
    var uitpasNumber = 'this-is-a-number';
    var expectedPassHolder = {
      name: 'Foo',
      points: 0,
      uitIdUser: {
        id: 'passholder-id-123'
      }
    };

    // Mock an HTTP response.
    $httpBackend
      .expectPOST(apiUrl + 'passholder/find', {identification: uitpasNumber})
      .respond(200, JSON.stringify(expectedPassHolder));

    // Assertion method.
    var assertPassHolder = function(passHolder) {
      expect(passHolder).toEqual(expectedPassHolder);
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
    };

    // Request the pass holder data and assert it when its returned.
    passHolderService.find(uitpasNumber).then(assertPassHolder, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    // Request the pass holder data and assert it again, but this time without
    // mocking an HTTP request as the pass holder object should have been cached.
    passHolderService.find(uitpasNumber).then(assertPassHolder, failed);
  });
});
