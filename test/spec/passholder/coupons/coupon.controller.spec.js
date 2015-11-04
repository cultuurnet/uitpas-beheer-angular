'use strict';

describe('Controller: CouponDetailController', function () {
  // load the controller's module
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(spyCoupon());

  var couponDetailController, coupon, $controller, $modalInstance;

  function spyCoupon() {
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['dismiss']);
  }

  couponDetailController = getController();
  coupon = {
    id: '0',
      name: 'Cultuurbon',
      description: 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
      date: '2015-12-26',
      remainingTotal: 4
  };

  function getController() {
    return $controller('CouponDetailController', {
      coupon: coupon,
      $modalInstance: $modalInstance
    });
  }

  it('should display a coupon object', function () {
    expect(couponDetailController.coupon).toEqual(coupon);
    expect(couponDetailController).toEqual('asdfadsf');
  });

});