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
function PassholderEditController (passholder, $modalInstance) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = passholder;
  controller.passholder.dob = new Date(passholder.dateOfBirth);

  controller.submitForm = function(passholder, editForm) {
    if(editForm.$valid) {
      $modalInstance.close('close this with yes');
    }
  };

  controller.cancelModal = function() {
    $modalInstance.dismiss('cancel');
  };
}
