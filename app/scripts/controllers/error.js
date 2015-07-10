'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:ErrorController
 * @description
 * # ErrorController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('ErrorController', ErrorController);

/* @ngInject */
function ErrorController ($scope, $stateParams) {
  var controller = this;

  controller.title = $stateParams.title;
  controller.description = $stateParams.description;
}
