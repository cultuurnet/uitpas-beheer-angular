'use strict';

describe('Service: sharedDataService', function () {

  // load the service's module
  beforeEach(module('uitpasbeheerApp'));

  // Instantiate service.
  var sharedDataService;

  beforeEach(inject(function ($injector) {
    sharedDataService = $injector.get('sharedDataService');
  }));

  it('should should contain an empty object', function () {
    expect(sharedDataService.data).toEqual({});
  });

});
