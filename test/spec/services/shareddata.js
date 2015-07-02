'use strict';

describe('Service: sharedData', function () {

  // load the service's module
  beforeEach(module('uitpasbeheerApp'));

  // instantiate service
  var sharedData;
  beforeEach(inject(function (_sharedData_) {
    sharedData = _sharedData_;
  }));

  it('should do something', function () {
    expect(!!sharedData).toBe(true);
  });

});
