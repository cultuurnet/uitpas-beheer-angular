'use strict';

describe('Controller: ErrorController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, $stateParams;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, _$stateParams_) {
    $stateParams = _$stateParams_;
    $stateParams.title = 'Error title';
    $stateParams.description = 'Error description';

    controller = $controller('ErrorController', {
      $stateParams: $stateParams
    });
  }));

  it('sets values on creation', function () {
    expect(controller.title).toBe('Error title');
    expect(controller.description).toBe('Error description');
  });
});
