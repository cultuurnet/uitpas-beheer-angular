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
  var cardSystemId = pass.cardSystem.id;
  var existingKansenstatuut = passholder.getKansenstatuutByCardSystemID(cardSystemId);
  controller.kansenstatuut = {
    endDate: existingKansenstatuut ? existingKansenstatuut.endDate : null
  };
  // reasons
  var reasons = {
    'REMOVAL': {
      description: 'Verhuis',
      code: 'REMOVAL'
    },
    'LOSS_THEFT': {
      description: 'Kaart verloren of gestolen',
      code: 'LOSS_THEFT'
    },
    'LOSS_KANSENSTATUUT': {
      description: 'Verlies kansenstatuut',
      code: 'LOSS_KANSENSTATUUT'
    },
    'OBTAIN_KANSENSTATUUT': {
      description: 'Kansenstatuut verkrijgen',
      code: 'OBTAIN_KANSENSTATUUT'
    }
  };
  controller.reasons = {};
  controller.voucherModelOptions = {
    debounce: { 'default': 500, 'blur': 0 }
  };
  var scanListener;

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  controller.refreshNewPassInfo = function () {
    var updatePassAndRefreshOptions = function (newPass) {
      controller.newPass = newPass;
      controller.refreshReasonOptions();
    };

    passholderService.findPass(controller.card.id).then(updatePassAndRefreshOptions);
  };

  controller.refreshReasonOptions = function () {
    var newOptions = [];
    var newPass = controller.newPass;
    var oldPass = controller.pass;
    var sameKansenstatuut = (oldPass.isKansenstatuut() === newPass.isKansenstatuut());

    newOptions.push(reasons.LOSS_THEFT);
    newOptions.push(reasons.REMOVAL);

    if (!sameKansenstatuut) {
      var reason = oldPass.isKansenstatuut() ? reasons.LOSS_KANSENSTATUUT : reasons.OBTAIN_KANSENSTATUUT;
      newOptions.push(reason);
      // when a change in kansenstatuut is detected, automatically select it as the reason and update price
      controller.card.reason = reason.code;
      controller.updatePriceInfo(controller.form);
    }

    controller.reasons = newOptions;
  };

  $scope.$watch(function () {return controller.form.UiTPASNumber.$valid;}, function (nv, ov) {
    if (nv !== ov && nv === true) {
      controller.refreshNewPassInfo();
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
