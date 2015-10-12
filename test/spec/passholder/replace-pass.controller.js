'use strict';

describe('Controller: PassholderReplacePassController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var $state, passholderService, $modalInstance, $scope, counterService, controller;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, $rootScope) {
    $state = jasmine.createSpyObj('$state', ['go']);
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
    passholderService = jasmine.createSpyObj('passholderService', ['blockPass']);
    counterService = jasmine.createSpyObj('counterService', ['getRegistrationPriceInfo']);
    //$q = $injector.get('$q');
    $scope = $rootScope.$new();

    controller = $controller('PassholderReplacePassController', {
      $scope: $scope,
      pass: { number: '182' },
      passholder: { passNumber: '182' },
      passholderService: passholderService,
      $modalInstance: $modalInstance,
      counterService: counterService,
      $rootScope: $rootScope
    });

    controller.form = {
      UiTPASNumber: {
        $valid: true
      },
      voucherNumber: {}
    };
  }));

  it('should auto-fill the UiTPAS number field when a pass is scanned', function () {
    controller.passScanned({}, '1234567891234');
    expect(controller.card.id).toEqual('1234567891234');
  });
});
