'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderReplacePassController
 * @description
 * # PassholderReplacePassController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderReplacePassController', PassholderReplacePassController);

/* @ngInject */
function PassholderReplacePassController (
  $scope,
  passholder,
  pass,
  $modalInstance,
  passholderService,
  counterService,
  isJavaFXBrowser,
  $rootScope
) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = angular.copy(passholder);
  controller.pass = pass;
  controller.formSubmitBusy = false;
  controller.isJavaFXBrowser = isJavaFXBrowser;
  controller.price = -1;
  controller.card = {
    id: null,
    reason: null,
    voucherNumber: null
  };
  controller.newPass = {};
  // for ubr-datepicker
  controller.kansenstatuut = {
    endDate: null
  };
  // reasons
  var setReasons = function () {
    return {
      'REMOVAL': 'Verhuis',
      'LOSS_THEFT': 'Kaart verloren of gestolen',
      'LOSS_KANSENSTATUUT': 'Verlies kansenstatuut',
      'OBTAIN_KANSENSTATUUT': 'Kansenstatuut verkrijgen'
    };
  };
  controller.reasons = {};
  controller.voucherModelOptions = {
    debounce: { 'default': 500, 'blur': 0 }
  };
  var scanListener;

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  $scope.$watch(function () {return controller.form.UiTPASNumber.$valid;}, function (nv, ov) {
    if (nv !== ov && nv === true) {
      var setNewPassAndReasonOptions = function (newPass) {
        controller.reasons = setReasons();
        controller.newPass = newPass;

        // Remove options based on the new pass.
        if (newPass.isKansenstatuut()) {
          delete controller.reasons.LOSS_KANSENSTATUUT;
        }
        else {
          delete controller.reasons.OBTAIN_KANSENSTATUUT;
        }

        // Remove options based on the previous pass.
        if (pass.isKansenstatuut()) {
          delete controller.reasons.OBTAIN_KANSENSTATUUT;
        }
        else {
          delete controller.reasons.LOSS_KANSENSTATUUT;
        }

        if (pass.isKansenstatuut() !== newPass.isKansenstatuut()) {
          delete controller.reasons.REMOVAL;
          delete controller.reasons.LOSS_THEFT;
          controller.card.reason = Object.keys(controller.reasons)[0];
          controller.updatePriceInfo(controller.form);
        }
      };

      passholderService.findPass(controller.card.id).then(setNewPassAndReasonOptions);
    }
  });

  controller.updatePriceInfo = function (form){
    var errors =  {
      PARSE_INVALID_VOUCHERNUMBER: 'invalidVoucherNumber',
      UNKNOWN_VOUCHER: 'unknownVoucherNumber',
      BALIE_NOT_AUTHORIZED: 'balieNotAuthorized',
      INVALID_VOUCHER_STATUS: 'invalidVoucherStatus'
    };

    var clearErrors = function () {
      angular.forEach(errors, function(error) {
        form.voucherNumber.$setValidity(error, true);
      });
    };

    var showPriceInfo = function (priceInfo) {
      controller.price = priceInfo.price;
    };

    var showNoPriceInfo = function (errorResponse) {
      var errors =  {
        PARSE_INVALID_VOUCHERNUMBER: 'invalidVoucherNumber',
        UNKNOWN_VOUCHER: 'unknownVoucherNumber',
        BALIE_NOT_AUTHORIZED: 'balieNotAuthorized',
        INVALID_VOUCHER_STATUS: 'invalidVoucherStatus'
      };

      var error = errors[errorResponse.code];
      form.voucherNumber.$setValidity(error, false);
    };

    if (controller.card.reason) {
      controller.price = -1;
      clearErrors();

      counterService
        .getRegistrationPriceInfo(controller.newPass, passholder, controller.card.voucherNumber, controller.card.reason)
        .then(showPriceInfo, showNoPriceInfo);
    }
  };

  controller.submitForm = function () {
    controller.formSubmitBusy = true;

    // Check if an endDate is provided when obtaining a kansenstatuut.
    if (controller.card.reason === 'OBTAIN_KANSENSTATUUT' && !controller.kansenstatuut.endDate) {
      controller.formAlert = {
        message: 'Een geldigheidsdatum is verplicht bij het toekennen van een kansenstatuut.',
        type: 'danger'
      };
      controller.formSubmitBusy = false;
      return;
    }

    // Copy the kansenstatuut endDate if both old and new pass are kansenstatuut.
    if (controller.newPass.isKansenstatuut() && pass.isKansenstatuut()) {
      var currentKansenstatuut = passholder.getKansenstatuutByCardSystemID(controller.newPass.cardSystem.id);
      controller.kansenstatuut.endDate = currentKansenstatuut.endDate;
    }

    var redirectToPassholder = function (newPass) {
      $modalInstance.close(newPass.number);
    };

    var setErrors = function () {
      controller.formSubmitBusy = false;
    };

    passholderService
      .newPass(controller.newPass, controller.passholder.uid, controller.card.reason, controller.kansenstatuut.endDate, controller.card.voucherNumber)
      .then(redirectToPassholder, setErrors);
  };

  controller.passScanned = function(event, identification) {
    controller.card.id = identification;
    $scope.$apply();
  };

  controller.listenForScannedPass = function () {
    if (!scanListener) {
      scanListener = $rootScope.$on('nfcNumberReceived', controller.passScanned);
      $scope.$on('$destroy', scanListener);
    }
  };

  controller.listenForScannedPass();
}
