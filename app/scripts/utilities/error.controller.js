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
function ErrorController ($stateParams, errorClasses) {
  var controller = this;

  controller.title = $stateParams.title;
  controller.description = $stateParams.description;
  controller.code = $stateParams.code;
  controller.class = (errorClasses[$stateParams.code]) ? errorClasses[$stateParams.code].class : 'unknown-error';
}
