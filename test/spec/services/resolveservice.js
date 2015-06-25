'use strict';

describe('Service: resolveService', function () {

  // load the service's module
  beforeEach(module('uitpasbeheerApp'));

  // instantiate service
  var resolveService;
  beforeEach(inject(function (_resolveService_) {
    resolveService = _resolveService_;
  }));

  it('should do something', function () {
    expect(!!resolveService).toBe(true);
  });

});
