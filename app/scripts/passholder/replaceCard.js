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
function PassholderReplaceCardController (passholder, identification, $modalInstance, passholderService, eIDService, isJavaFXBrowser) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = angular.copy(passholder);
  controller.formSubmitBusy = false;
  controller.isJavaFXBrowser = isJavaFXBrowser;
  controller.asyncError = null;

  // check if passholder has kansenStatuut
  controller.hasKansenStatuut = passholder.kansenStatuten.length > 0;
  // @TODO: is this really necessary?
  if (controller.hasKansenStatuut){
    controller.hasKansenStatuut = passholder.kansenStatuten.filter(function(kansenStatuut){
      return kansenStatuut.status === 'ACTIVE';
    }).length > 0;
  }

  // reasons
  controller.reasons = [
    {
      code: 'REMOVAL',
      description: 'Verhuis'
    },
    {
      code: 'LOSS_THEFT',
      description: 'Kaart verloren of gestolen'
    },
    {
      code: controller.hasKansenStatuut ? 'LOSS_KANSENSTATUUT' : 'OBTAIN_KANSENSTATUUT',
      description: controller.hasKansenStatuut ? 'Verlies kansenstatuut' : 'Kansenstatuut verkrijgen'
    }
  ];

  // for ubr-datepicker
  controller.kansenstatuut = {endDate: null};

  controller.cancelModal = function() {
    $modalInstance.dismiss();
  };

  // check new UitPAS number on blur to make sure it's in the local stock
  controller.checkUiTPAS = function(form){
    var number = controller.card.id;
    passholderService.findPass(number).then(function(pass){
      if(pass.isLocalStock()) {
        controller.newPass = pass;
        form.UitpasNr.$error = {};
        form.UitpasNr.$invalid = false;
        form.UitpasNr.$valid = true;
        controller.getPassPrice(form);
      }
      else {
        form.UitpasNr.$error.isInUse = true;
        form.UitpasNr.$invalid = true;
      }
    }, function(response){
      if (response.code === 'PASSHOLDER_NOT_FOUND') {
        form.UitpasNr.$error.isNotFound = true;
        form.UitpasNr.$invalid = true;
      }
    });
  };

  // Get price for new UitPAS
  controller.getPassPrice = function(form){
    if (!controller.newPass) {
      return;
    }
    if (!controller.card.reason) {
      return;
    }
    controller.gettingPrice = true;
    controller.newPass.getPrice(controller.card.reason, passholder, controller.card.voucher)
    .then(function(res){
      var newcard = res.data;
      controller.price = newcard.price / 100;
      if (controller.card.reason === 'OBTAIN_KANSENSTATUUT' && !newcard.kansenStatuut) {
        form.UitpasNr.$error.notKansStatuut = true;
        form.UitpasNr.$invalid = true;
      }
      if (controller.card.reason === 'LOSS_KANSENSTATUUT' && newcard.kansenStatuut) {
        form.UitpasNr.$error.isKansStatuut = true;
        form.UitpasNr.$invalid = true;
      }
      if (form.voucher) {
        form.voucher.$invalid = false;
        if (newcard.voucherType && newcard.voucherType.name) {
          controller.voucherType = newcard.voucherType.name;
        }
      }
      controller.gettingPrice = false;
    }, function(errorResponse) {
      if (errorResponse.data.code === 'PARSE_INVALID_VOUCHERNUMBER') {
        form.voucher.$invalid = true;
        // TODO: doesn't work, it doesn't mark the field as invalid
      }
      controller.gettingPrice = false;
    });
  };

  controller.submitForm = function(form) {
    if (controller.formSubmitBusy) {
      return;
    }
    controller.formSubmitBusy = true;
    form.$setSubmitted();
    if(!form.$valid) {
      return;
    }

    // @TODO: make this work
    var updateFailed = function(errorResponse) {
      var errorCode = errorResponse.apiError.code;
      // clear any previous async errors
      controller.asyncError = null;

      // @TODO: check the possible errorcodes
      if (errorCode === 'errorcode') {
        form.veld.$error.isUsed = true;
        form.veld.$invalid = true;
      }
    };
    var updateOk = function(updatedPassholder) { // jshint ignore:line
    };
    // @TODO: create the updatePass-method
    passholderService
      .updatePass(controller.newPass, identification)
      .then(updateOk, updateFailed);

    controller.formSubmitBusy = false;
  };
}
