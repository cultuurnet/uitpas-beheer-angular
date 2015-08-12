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
function PassholderEditController (passholder, identification, $modalInstance, passholderService) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = angular.copy(passholder);
  controller.disableInszNumber = (passholder.inszNumber) ? true : false;
  controller.formSubmitBusy = false;
  controller.formAlert = undefined;

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

  controller.cancelModal = function() {
    $modalInstance.dismiss();
  };
}
