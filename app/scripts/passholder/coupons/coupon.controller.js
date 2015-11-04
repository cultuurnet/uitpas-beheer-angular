'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.coupons.controller:CouponDetailController
 * @description
 * # PassholderDetailController
 * Controller of the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .controller('CouponDetailController', CouponDetailController);

/* @ngInject */
function CouponDetailController (coupon, $scope, $modalInstance) {
  $scope.coupon = coupon;

  $scope.cancel = function () {
    $modalInstance.dismiss('canceled');
  };
}