'use strict';

/**
 * @ngdoc function
 * @name ubr.group.controller:GroupDetailController
 * @description
 * # GroupDetailController
 * Controller of the ubr group module.
 */
angular
  .module('ubr.group')
  .controller('GroupDetailController', GroupDetailController);

/* @ngInject */
function GroupDetailController (pass, group, passholderService, $rootScope, $scope, moment) {
  /*jshint validthis: true */
  var controller = this;

  controller.pass = pass;
  controller.group = group;

  controller.couponsLoading = false;

  if (group.endDate && moment(group.endDate).isBefore(moment())) {
    controller.kansenStatuutStatus = 'EXPIRED';
  }

  var displayCoupons = function(coupons) {
    controller.coupons = coupons;
  };

  var loadCoupons = function() {
    controller.couponsLoading = true;

    function removeLoadingState() {
      controller.couponsLoading = false;
    }

    passholderService
      .getCoupons(group.passNumber)
      .then(displayCoupons)
      .finally(removeLoadingState);
  };

  loadCoupons();

  var cleanupActivityTariffClaimedWithCouponListener = $rootScope.$on('activityTariffClaimedWithCoupon', loadCoupons);

  $scope.$on('$destroy', cleanupActivityTariffClaimedWithCouponListener);
}
