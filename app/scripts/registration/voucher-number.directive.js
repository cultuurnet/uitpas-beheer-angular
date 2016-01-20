'use strict';

/**
 * @ngdoc directive
 * @name ubr.registration.directive:ubrVoucherNumber
 * @description
 * # ubrVoucherNumber
 */
angular
  .module('ubr.registration')
  .directive('ubrVoucherNumber', ubrVoucherNumber);

/* @ngInject */
function ubrVoucherNumber(counterService, $timeout) {
  return {
    restrict: 'A',
    require: ['?^^RegistrationModalController', 'ngModel'],
    scope: {
      pass: '=passToCheck',
      parentController: '=currentController'
    },
    link: link
  };

  function link(scope, element, attrs, controllers) {
    var modelController = controllers[1];
    // can't seem to access the registration controller using require so this is a workaround
    var reason = 'FIRST_CARD';
    var passToCheck = scope.parentController.pass;

    if (scope.parentController.upgradeData) {
      reason = scope.parentController.upgradeData.upgradeReason;
      if (scope.parentController.upgradeData.withNewCard === 'NEW_CARD') {
        passToCheck = scope.parentController.upgradeData.passToCheck;
      }
    }

    scope.refreshPriceInfo = function () {
      var voucherNumber = modelController.$viewValue;

      var updatePriceInfo = function (priceInfo) {
        modelController.$setValidity('voucher', true);

        scope.parentController.price = priceInfo.price;

        if (!voucherNumber) {
          scope.parentController.unreducedPrice = priceInfo.price;
        }
      };

      var showError = function (error) {
        if (error.code === 'INVALID_VOUCHER_STATUS') {
          modelController.$setValidity('redeemable', false);
        } else {
          scope.parentController.handleAsyncError(error);
        }

        modelController.$setValidity('voucher', false);
        scope.parentController.price = scope.parentController.unreducedPrice;
        modelController.$setTouched();
      };

      scope.parentController.clearAsyncError('PARSE_INVALID_VOUCHERNUMBER');
      scope.parentController.clearAsyncError('UNKNOWN_VOUCHER');
      scope.parentController.price = -1;
      counterService
        .getRegistrationPriceInfo(passToCheck, scope.parentController.passholder, voucherNumber, reason)
        .then(updatePriceInfo, showError);
    };

    // the view model does not seem to be available when linking
    // we have to introduce a timeout and give it time to update be refreshing price info
    $timeout(scope.refreshPriceInfo);
  }
}
