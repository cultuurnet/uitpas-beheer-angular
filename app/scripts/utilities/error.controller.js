'use strict';

/**
 * @ngdoc function
 * @name ubr.utilities.controller:ErrorController
 * @description
 * # ErrorController
 * Controller of the ubr.utilities module.
 */
angular
  .module('ubr.utilities')
  .controller('ErrorController', ErrorController);

/* @ngInject */
function ErrorController ($stateParams) {
  var controller = this;

  controller.title = $stateParams.title;
  controller.description = $stateParams.description;
  controller.type = $stateParams.type;
}
