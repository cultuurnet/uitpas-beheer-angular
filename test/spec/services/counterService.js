'use strict';

describe('Service: counterService', function () {

  // load the service's module
  beforeEach(module('uitpasbeheerApp'));

  // instantiate service
  var counterService;
  beforeEach(inject(function (_counterService_) {
    counterService = _counterService_;
  }));

  it('should do something', function () {
    expect(!!counterService).toBe(true);
  });

});
