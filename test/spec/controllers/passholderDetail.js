'use strict';

describe('Controller: PassholderDetailController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller) {
    controller = $controller('PassholderDetailController', {
      passholder: { inszNumber: '07111571331' }
    });
  }));

  it('should should have a passholder object', function () {
    expect(controller.passholder).toBeDefined();
  });
});
