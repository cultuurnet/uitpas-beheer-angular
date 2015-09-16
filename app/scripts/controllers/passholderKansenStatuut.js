'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderKansenStatuutController
 * @description
 * # PassholderKansenStatuutController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderKansenStatuutController', PassholderKansenStatuutController);

/* @ngInject */
function PassholderKansenStatuutController (passholder, activeCounter, $modalInstance) {
  /*jshint validthis: true */
  var controller = this;

  controller.formSubmitBusy = false;
  controller.passholder = passholder;
  controller.activeCounter = activeCounter;

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  controller.submitForm = function () {
    controller.formSubmitBusy = true;
//    $modalInstance.dismiss();
  };
}
