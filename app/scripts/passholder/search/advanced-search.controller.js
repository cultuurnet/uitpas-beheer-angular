'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.search.controller:PassholderAdvancedSearchController
 * @description
 * # PassholderAdvancedSearchController
 * Controller of the ubr.passholder.search module.
 */
angular
  .module('ubr.passholder.search')
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
