'use strict';

describe('Controller: ErrorController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var $controller, $stateParams, controller;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, _$stateParams_) {
    $controller = $injector.get('$controller');

    $stateParams = _$stateParams_;
    $stateParams.title = 'Error title';
    $stateParams.description = 'Error description';
    $stateParams.code = 'PAGE_NOT_FOUND';

  }));

  function getController () {
    return $controller('ErrorController', {
      $stateParams: $stateParams
    });
  }

  it('sets values on creation', function () {
    controller = getController();
    expect(controller.title).toBe('Error title');
    expect(controller.description).toBe('Error description');
    expect(controller.code).toBe('PAGE_NOT_FOUND');
    expect(controller.class).toBe('page-not-found');
  });

  it('sets an class value for unknown error values on creation', function () {
    $stateParams.code = 'qsdfPAGE_NOT_FOUND';
    controller = getController();
    expect(controller.class).toBe('unknown-error');
  });
});
