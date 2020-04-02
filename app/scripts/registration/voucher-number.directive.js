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
function ubrVoucherNumber(counterService) {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      pass: '=passToCheck',
      parentController: '=currentController',
      cardSystemId: '=?ubrCardSystem'
    },
    link: link
  };

  function link(scope, element, attrs, modelController) {
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

      if (reason === 'CARD_UPGRADE') {
        counterService
          .getUpgradePriceInfo(scope.cardSystemId, scope.parentController.passholder, voucherNumber)
          .then(updatePriceInfo, showError);
      }
      else {
        counterService
          .getRegistrationPriceInfo(passToCheck, scope.parentController.passholder, voucherNumber, reason, scope.parentController.registerForeign)
          .then(updatePriceInfo, showError);
      }
    };

    // Listen to the model changes and refresh the price info
    modelController.$viewChangeListeners.push(function(){
      scope.refreshPriceInfo();
    });

    scope.refreshPriceInfo();
  }
}
