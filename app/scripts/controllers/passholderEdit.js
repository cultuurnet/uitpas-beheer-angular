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
  controller.passholder = passholder;
  controller.disableInszNumber = (passholder.inszNumber) ? true : false;

  controller.submitForm = function(passholder, editForm) {
    if(editForm.$valid) {
      var updateOk = function(updatedPassholder) {
        controller.passholder = updatedPassholder;
        $modalInstance.close();
      };
      var updateFailed = function(e) {
        $modalInstance.close(e);
      };

      passholderService.update(passholder, identification).then(updateOk, updateFailed);
    }
  };

  controller.cancelModal = function() {
    $modalInstance.dismiss();
  };

  controller.validateInszNumber = (function() {
    // examples: 930518-223-61, 93051822361, 930518 223 61
    var regex = /([\d]{6})[-\s]?([\d]{3})[-\s]?([\d]{2}$)/;

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
