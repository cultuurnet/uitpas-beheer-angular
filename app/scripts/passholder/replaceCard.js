'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderReplaceCardController
 * @description
 * # PassholdereditController
 * Controller of the uitpasbeheerApp
 */
angular.module('uitpasbeheerApp')
  .controller('PassholderReplaceCardController', PassholderReplaceCardController);

/* @ngInject */
function PassholderReplaceCardController ($scope, passholder, pass, $modalInstance, passholderService, counterService, isJavaFXBrowser) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = angular.copy(passholder);
  controller.formSubmitBusy = false;
  controller.isJavaFXBrowser = isJavaFXBrowser;
  controller.asyncError = null;
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
  controller.reasons = {
    'REMOVAL': 'Verhuis',
    'LOSS_THEFT': 'Kaart verloren of gestolen',
    'LOSS_KANSENSTATUUT': 'Verlies kansenstatuut',
    'OBTAIN_KANSENSTATUUT': 'Kansenstatuut verkrijgen'
  };

  controller.cancelModal = function() {
    $modalInstance.dismiss();
  };

  $scope.$watch(function () {return $scope.passholderNewCard.UiTPASNumber.$valid;}, function (nv, ov) {
    if (nv !== ov && nv === true) {
      var setNewPassAndReasonOptions = function (newPass) {
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
      };

      passholderService.findPass(controller.card.id).then(setNewPassAndReasonOptions);
    }
  });

  // Get price for new UitPAS
  controller.getPassPrice = function(form){
    if (!controller.newPass) {
      return;
    }
    if (!controller.card.reason) {
      return;
    }
    controller.gettingPrice = true;
    counterService.getRegistrationPriceInfo(controller.newPass, passholder, controller.card.voucherNumber, controller.card.reason)
    .then(function(res){
      var newcard = res.data;
      controller.price = newcard.price / 100;
      if (controller.card.reason === 'OBTAIN_KANSENSTATUUT' && !newcard.kansenStatuut) {
        form.UiTPASNumber.$setValidity('notKansStatuut', false);
        //form.UiTPASNumber.$error.notKansStatuut = true;
        //form.UiTPASNumber.$invalid = true;
      } else {
        form.UiTPASNumber.$setValidity('notKansStatuut', true);
      }
      if (controller.card.reason === 'LOSS_KANSENSTATUUT' && newcard.kansenStatuut) {
        form.UiTPASNumber.$setValidity('isKansStatuut', false);
        //form.UiTPASNumber.$error.isKansStatuut = true;
        //form.UiTPASNumber.$invalid = true;
      } else {
        form.UiTPASNumber.$setValidity('isKansStatuut', true);
      }
      if (form.voucherNumber) {
        form.voucherNumber.$invalid = false;
        if (newcard.voucherType && newcard.voucherType.name) {
          controller.voucherType = newcard.voucherType.name;
        }
      }
      controller.gettingPrice = false;
    }, function(errorResponse) {
        console.log(errorResponse);
      if (errorResponse.data.code === 'PARSE_INVALID_VOUCHERNUMBER') {
        form.voucherNumber.$setValidity('invalidVoucher', false);
        //form.voucher.$invalid = true;
        // TODO: doesn't work, it doesn't mark the field as invalid
      } else {
        form.voucherNumber.$setValidity('invalidVoucher', true);
      }
      controller.gettingPrice = false;
    });
  };
}
