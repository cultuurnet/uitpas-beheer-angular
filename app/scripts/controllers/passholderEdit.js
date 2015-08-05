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
          controller.formSubmitBusy = false;
        };

        passholderService.update(passholder, identification).then(updateOk, updateFailed);
      }
    } else {
      controller.formSubmitBusy = false;
    }
  };

  controller.cancelModal = function() {
    $modalInstance.dismiss();
  };

  controller.validateInszNumber = (function() {
    // examples: 930518-223-61, 93051822361, 930518 223 61, 930518.223.61
    var regex = /([\d]{6})[-.\s]?([\d]{3})[-.\s]?([\d]{2}$)/;

    return {
      test: function(value) {
        var inszIsValid = false;
        var regexResult = regex.exec(value);
        if (regexResult) {
          var rest = (regexResult[1] + regexResult[2]) % 97;
          inszIsValid = (String(97 - rest) === regexResult[3]);
        }
        else {
          inszIsValid = false;
        }
        return inszIsValid;
      }
    };
  })();
}
