'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:MainController
 * @description
 * # MainController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('MainController', mainController);

/* @ngInject */
function mainController () {
  /*jshint validthis: true */
  this.hello = 'world';
}
