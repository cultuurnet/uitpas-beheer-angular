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
    link: link
  };

  function link(scope, element, attrs, controllers) {
    var modelController = controllers[1];
    // can't seem to access the registration controller using require so this is a workaround
    var registrationController = scope.prc;
    var reason = 'FIRST_CARD';

    if (scope.umc) {
      registrationController = scope.umc;
      // @todo figure out when which reason needs to be used.
      reason = 'CARD_UPGRADE';
      reason = 'EXTRA_CARD';
    }

    scope.refreshPriceInfo = function () {
      var voucherNumber = modelController.$viewValue;

      var updatePriceInfo = function (priceInfo) {
        modelController.$setValidity('voucher', true);

        registrationController.price = priceInfo.price;

        if (!voucherNumber) {
          registrationController.unreducedPrice = priceInfo.price;
        }
      };

      var showError = function (error) {
        if (error.code === 'INVALID_VOUCHER_STATUS') {
          modelController.$setValidity('redeemable', false);
        } else {
          registrationController.handleAsyncError(error);
        }

        modelController.$setValidity('voucher', false);
        registrationController.price = registrationController.unreducedPrice;
        modelController.$setTouched();
      };

      registrationController.clearAsyncError('PARSE_INVALID_VOUCHERNUMBER');
      registrationController.clearAsyncError('UNKNOWN_VOUCHER');
      registrationController.price = -1;
      counterService
        .getRegistrationPriceInfo(registrationController.pass, registrationController.passholder, voucherNumber, reason)
        .then(updatePriceInfo, showError);
    };

    // the view model does not seem to be available when linking
    // we have to introduce a timeout and give it time to update be refreshing price info
    $timeout(scope.refreshPriceInfo);
  }
}
