'use strict';

describe('Controller: PassholderController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var rootScope, $controller, passholderService, sharedDataService, $state, $stateParams;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, $rootScope) {
    rootScope = $rootScope;
    $controller = $injector.get('$controller');
    passholderService = $injector.get('passholderService');
    sharedDataService = $injector.get('sharedDataService');
    $state = $injector.get('$state');
    $stateParams = $injector.get('$stateParams');
  }));

  beforeEach(function () {
    PassholderController = $controller(
      'PassholderController', {
        $rootScope: rootScope,
        passholderService: passholderService,
        sharedDataService:  sharedDataService,
        $state: $state,
        $stateParams: $stateParams
      }
    );
  });

  it('should have a shared data variable', function () {
    console.log(PassholderController);
    expect(PassholderController.shared.data.passholder).toEqual({});
  });
});
