'use strict';

/**
 * @ngdoc function
 * @name ubr.registration.controller:RegistrationModalController
 * @description
 * # RegistrationModalController
 * UiTPASBeheer registration controller
 */
angular
  .module('ubr.registration')
  .controller('RegistrationModalController', RegistrationModalController);

/* @ngInject */
function RegistrationModalController (
  pass,
  $state,
  Passholder,
  passholderService,
  $modalInstance,
  counterService,
  $stateParams,
  RegistrationAPIError
) {
  /*jshint validthis: true */
  var controller = this;
  var kansenstatuutInfo = $stateParams.kansenstatuut;

  controller.pass = pass;
  controller.formSubmitBusy = false;
  // Price is set to minus one to indicate it has not yet been initialized
  controller.price = -1;
  controller.unreducedPrice = -1;
  controller.priceModelOptions = {
    debounce: {
      'default': 500,
      'blur': 0
    }
  };
  controller.voucherNumber = '';
  controller.asyncError = undefined;

  controller.passholder = new Passholder();

  controller.submitPersonalDataForm = function(personalDataForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if (personalDataForm.$valid) {
        var setInszNumberError = function () {
          personalDataForm.inszNumber.$setValidity('inUse', false);
          controller.formSubmitBusy = false;
        };

        var continueRegisterProcess = function () {
          $state.go('counter.main.register.form.contactData');
          controller.formSubmitBusy = false;
        };

        passholderService
          .findPassholder(personalDataForm.inszNumber.$viewValue)
          .then(setInszNumberError, continueRegisterProcess);
      } else {
        controller.formSubmitBusy = false;
      }
    }
  };

  controller.getStepNumber = function () {
    return $state.current.stepNumber;
  };

  controller.submitContactDataForm = function(contactDataForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if (contactDataForm.$valid) {
        $state.go('counter.main.register.form.price');
        controller.refreshUnreducedPriceInfo();
        controller.formSubmitBusy = false;
      } else {
        controller.formSubmitBusy = false;
      }
    }
  };

  controller.submitPriceForm = function(priceFormData) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if (priceFormData.$valid) {
        controller.submitRegistration();
        controller.formSubmitBusy = false;
      } else {
        controller.formSubmitBusy = false;
      }
    }
  };

  controller.refreshUnreducedPriceInfo = function () {
    var updateUnreducedPriceInfo = function (priceInfo) {
      var unreducedPrice = priceInfo.price;

      controller.unreducedPrice = unreducedPrice;

      if (controller.price === -1) {
        controller.price = unreducedPrice;
      }
    };

    counterService
      .getRegistrationPriceInfo(pass, controller.passholder)
      .then(updateUnreducedPriceInfo);
  };

  controller.refreshPriceInfo = function (voucherNumberFormState) {
    var updatePriceInfo = function (priceInfo) {
      voucherNumberFormState.$setValidity('validVoucher', true);

      controller.price = priceInfo.price;

      if (!controller.voucherNumber) {
        controller.unreducedPrice = priceInfo.price;
      }
    };

    var showError = function (error) {
      if (error.code === 'INVALID_VOUCHER_STATUS') {
        voucherNumberFormState.$setValidity('redeemable', false);
      }

      voucherNumberFormState.$setValidity('validVoucher', false);
      controller.price = controller.unreducedPrice;
    };

    controller.price = -1;
    counterService
      .getRegistrationPriceInfo(pass, controller.passholder, controller.voucherNumber)
      .then(updatePriceInfo, showError);
  };

  controller.submitRegistration = function () {

    var handleRegistrationErrors = function (error) {
      var knownAPIError = RegistrationAPIError[error.code];
      var step = 'personalData';

      if (knownAPIError) {
        error.cleanMessage = knownAPIError.message;
        step = knownAPIError.step;
      } else {
        error.cleanMessage = error.message.split('URL CALLED')[0];
      }

      controller.asyncError = error;
      controller.formSubmitBusy = false;
      $state.go('counter.main.register.form.' + step);
    };

    var showRegisteredPassholder = function (passholder) {
      $modalInstance.close(passholder);
    };

    controller.formSubmitBusy = true;
    passholderService
      .register(pass, controller.passholder, controller.voucherNumber, kansenstatuutInfo)
      .then(showRegisteredPassholder, handleRegistrationErrors);
  };

  controller.close = function () {
    $modalInstance.dismiss('registration modal closed');
  };
}
