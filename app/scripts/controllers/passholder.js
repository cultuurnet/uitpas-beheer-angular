'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderController
 * @description
 * # PassholderController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderController', PassholderController);

/* @ngInject */
function PassholderController ($rootScope, passholderService, sharedDataService, $state) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.shared = sharedDataService;
  controller.shared.data.passholder = {};
  controller.shared.data.passholderIdentification = '';
  controller.shared.data.passholderNotFound = false;

  controller.searchPassholder = function() {
    $rootScope.appBusy = true;

    passholderService.find(controller.shared.data.passholderIdentification).then(
      // Go to the passholder detail page if a passholder is found.
      angular.bind(controller, function() {
        $state.go('counter.passholder', {identification: controller.shared.data.passholderIdentification});
      }),
      // Show an error message if the passholder identification is invalid.
      angular.bind(controller, function() {
        controller.shared.data.passholder = undefined;
        controller.shared.data.passholderNotFound = true;
        $rootScope.appBusy = false;
      })
    );
  };

  // Show an error message if the user is redirected from an invalid passholder.
  if ($state.is('counter.main') && $state.params.passholdernotfound) {
    controller.shared.data.passholderNotFound = true;
    controller.shared.data.passholderIdentification = $state.params.identification;
  }

  // Search for a passholder with the identification in the path.
  if ($state.is('counter.passholder')) {
    $rootScope.appBusy = true;
    passholderService.find($state.params.identification).then(
      // Show the passholder info if a passholder is found.
      angular.bind(controller, function (passholder) {
        controller.shared.data.passholder = passholder;
        controller.shared.data.passholderNotFound = false;
        $rootScope.appBusy = false;
      }),
      // Redirect the user to the search page if no passholder is found.
      angular.bind(controller, function () {
        $state.go('counter.main', {passholdernotfound: true, identification: $state.params.identification});
      })
    );
  }
}
