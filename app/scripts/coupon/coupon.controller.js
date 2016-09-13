'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.coupons.controller:CouponDetailController
 * @description
 * # PassholderDetailController
 * Controller of the ubr.passholder module.
 */
angular
  .module('ubr.coupon')
  .controller('CouponDetailController', CouponDetailController);

/* @ngInject */
function CouponDetailController (coupon, $uibModalInstance) {
  this.coupon = coupon;

  this.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}
