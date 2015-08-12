'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderDetailController
 * @description
 * # PassholderDetailController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderDetailController', PassholderDetailController);

/* @ngInject */
function PassholderDetailController (passholder) {
  /*jshint validthis: true */
  var controller = this;

  controller.passholder = passholder;
}
