'use strict';

/**
 * @ngdoc function
 * @name ubr.search.controller:PassholderAdvancedSearchController
 * @description
 * # PassholderAdvancedSearchController
 * Controller of the ubr.search module.
 */
angular
  .module('ubr.search')
  .controller('PassholderAdvancedSearchController', PassholderAdvancedSearchController);

/* @ngInject */
function PassholderAdvancedSearchController () {
  /*jshint validthis: true */
  var controller = this;
  controller.invalidNumbers = [];
  controller.formSubmitBusy = false;
  controller.passNumbers = '';

  controller.submitPassholderNumbersForm = function (form) {
    console.log(form);
  };
}
