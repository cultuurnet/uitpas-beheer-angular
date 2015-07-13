'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderDetailController
 * @description
 * # PassholderController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderDetailController', PassholderDetailController);

/* @ngInject */
function PassholderDetailController (passholder) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = passholder;
}
