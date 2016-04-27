'use strict';

/**
 * @name ubr
 *
 * This doc block prevents undefined errors in other name properties.
 */

/**
 * @ngdoc overview
 * @name ubr.coupon
 * @description
 * # ubr.coupon
 *
 * coupon module UiTPAS Beheer.
 */
angular
  .module('ubr.coupon', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  .config(function ($stateProvider) {

    /* @ngInject */
    var getCouponsFromStateParams = function($stateParams) {
      return $stateParams.coupon;
    };

    var couponModal = {
      params: {
        coupon: null
      },
      resolve: {
        coupon: getCouponsFromStateParams
      },
      /* @ngInject */
      onEnter: function(coupon, $state, $uibModal) {
        $uibModal
          .open({
            animation: true,
            templateUrl: 'views/coupon/modal-coupon.html',
            size: 'sm',
            resolve: {
              coupon: function() {
                return coupon;
              }
            },
            controller: 'CouponDetailController',
            controllerAs: 'cdc'
          })
          .result
          .finally(function() {
            $state.go('^');
          });
      }
    };

    $stateProvider
      .state('counter.main.group.coupon', angular.copy(couponModal))
      .state('counter.main.passholder.coupon', angular.copy(couponModal));
  });
