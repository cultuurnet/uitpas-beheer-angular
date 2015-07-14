'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderSearchController
 * @description
 * # PassholderSearchController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderSearchController', PassholderSearchController);

/* @ngInject */
function PassholderSearchController ($rootScope, passholderService, $state) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholderIdentification = '';
  controller.passholderNotFound = false;

  controller.searchPassholder = function(identification) {
    $rootScope.appBusy = true;

    passholderService.find(identification).then(
      // Go to the passholder detail page if a passholder is found.
      function (passholder) {
        $state.go(
          'counter.main.passholder',
          {
            passholder: passholder,
            identification: controller.passholderIdentification
          }
        );
      },
      // Show an error message if the passholder identification is invalid.
      function (error) {
        controller.passholderNotFound = true;
        $state.go(
          'counter.main.error',
          {
            title: error.title,
            description: error.message
          },
          {
            reload: true
          }
        );
      }
    );
  };
}
