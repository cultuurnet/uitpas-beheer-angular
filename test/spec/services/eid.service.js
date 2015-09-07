'use strict';

describe('Service: eIdService', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  // Instantiate service.
  var service, $q, $scope;


  beforeEach(inject(function ($injector, $rootScope) {
    service = $injector.get('eIdService');
    $q = $injector.get('$q');
    $scope = $rootScope;
  }));

  it('should do something', function () {
    expect(!!service).toBe(true);
  });

});
