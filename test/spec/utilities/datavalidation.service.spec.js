'use strict';

describe('Service: dataValidation', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
    var $window = { location: { href: '' } };
    $provide.value('$window', $window);
  }));

  // Instantiate service.
  var dataValidation, $httpBackend, $window;

  beforeEach(inject(function ($injector, _dataValidation_) {
    $httpBackend = $injector.get('$httpBackend');
    $window = $injector.get('$window');
    dataValidation = _dataValidation_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('validates an email', function() {
    $httpBackend
      .expectGET(apiUrl + 'datavalidation/email')
      .respond(200, {
        grade: 'F',
        status: 'ok'
      });

    dataValidation.validateEmail();

    $httpBackend.flush();
  });
});
