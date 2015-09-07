'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderEditController
 * @description
 * # PassholdereditController
 * Controller of the uitpasbeheerApp
 */
angular.module('uitpasbeheerApp')
  .controller('PassholderEditController', PassholderEditController);

/* @ngInject */
function PassholderEditController (passholder, identification, $modalInstance, passholderService, eIdService, isJavaFXBrowser) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = angular.copy(passholder);
  controller.disableInszNumber = (passholder.inszNumber) ? true : false;
  controller.formSubmitBusy = false;
  controller.formAlert = undefined;
  controller.eIdData = {};
  controller.eIdError = false;
  controller.isJavaFXBrowser = isJavaFXBrowser;

  controller.submitForm = function(passholder, editForm) {
    if (!controller.formSubmitBusy) {
      controller.formSubmitBusy = true;
      if(editForm.$valid) {
        var updateOk = function() {
          $modalInstance.close();
        };
        var updateFailed = function(e) {
          if (e.apiError.code === 'INSZ_ALREADY_USED') {
            editForm.inszNumber.$error.inUse = true;
            editForm.inszNumber.$invalid = true;
          }
          if (e.apiError.code === 'EMAIL_ALREADY_USED') {
            editForm.email.$error.inUse = true;
            editForm.email.$invalid = true;
          }
          if (e.apiError.code === 'ACTION_NOT_ALLOWED') {
            controller.formAlert = {
              message: 'Actie niet toegestaan.',
              type: 'danger'
            };
          } else {
            controller.formAlert = undefined;
          }
          controller.formSubmitBusy = false;
        };

        passholderService
          .update(passholder, identification)
          .then(updateOk, updateFailed);
      }
    } else {
      controller.formSubmitBusy = false;
    }
  };

  controller.getDataFromEId = function() {
    var gotEIdData = function(eIdData) {
      controller.eIdData = eIdData;
      if (controller.disableInszNumber && controller.passholder.inszNumber !== eIdData.inszNumber) {
        controller.eIdError = 'Het rijksregisternummer van de e-id verschilt van het rijksregisternummer dat beschikbaar is in de UiTPAS databank.';
      } else {
        angular.merge(controller.passholder, eIdData);
        controller.eIdError = false;
      }
    };

    var failedGettingEIdData = function(error) {
      controller.eIdError = error;
      controller.eIdData = {};
    };

    eIdService.getDataFromEId().then(gotEIdData, failedGettingEIdData);
  };

  controller.cancelModal = function() {
    $modalInstance.dismiss();
  };
}
