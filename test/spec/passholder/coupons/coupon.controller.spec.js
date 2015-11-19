'use strict';

describe('Controller: CouponDetailController', function () {
  var couponDetailController, coupon, $controller, $uibModalInstance, $scope, Coupon;

  // load the controller's module
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(inject(function (_$controller_, $rootScope, $injector) {
    $controller = _$controller_;
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['dismiss']);
    $scope = $rootScope.$new();
    Coupon = $injector.get('Coupon');
    coupon = new Coupon({
      id: '0',
      name: 'Cultuurbon',
      description: 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
      date: '2015-12-26',
      remainingTotal: 4
    });

    couponDetailController = getController();
  }));

  function getController() {
    return $controller('CouponDetailController', {
      coupon: coupon,
      $uibModalInstance: $uibModalInstance,
      $scope: $scope
    });
  }

  it('should display a coupon object', function () {
    expect(couponDetailController.coupon).toEqual(coupon);
  });

  it('can close the modal', function () {
    couponDetailController.cancel();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });
});
