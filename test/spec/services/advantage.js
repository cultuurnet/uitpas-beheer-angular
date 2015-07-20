'use strict';

describe('Service: advantage', function () {

  // load the service's module
  beforeEach(module('uitpasbeheerApp'));

  // instantiate service
  var advantage;
  beforeEach(inject(function (_advantage_) {
    advantage = _advantage_;
  }));

  it('should do something', function () {
    expect(!!advantage).toBe(true);
  });

});
