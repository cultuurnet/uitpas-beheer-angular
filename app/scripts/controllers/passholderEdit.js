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
  controller.formErrors = {
    inzNumber: false,
    name: false,
    firstName: false,
    dateOfBirth: false,
    placeOfBirth: false,
    gender: false,
    nationality: false,
    street: false,
    postalCode: false,
    city: false
  };

  controller.submitForm = function() {

    $modalInstance.close('close this with yes');
  };

  controller.cancelModal = function() {
    $modalInstance.dismiss('cancel');
  };
}
