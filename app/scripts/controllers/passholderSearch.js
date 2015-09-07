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

    function displayPassholderDetails(passholder) {
        $state.go(
        'counter.main.passholder',
        {
          passholder: passholder,
          identification: passholder.passNumber
        }
      );
    }

    function displayIdentificationError(error) {
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

    passholderService.find(identification)
      .then(displayPassholderDetails, displayIdentificationError);
  };

  controller.updatePassholderIdentificationFromNfc = function(event, nfcNumber) {
    controller.searchPassholder(nfcNumber);
  };

  $rootScope.$on('nfcNumberReceived', controller.updatePassholderIdentificationFromNfc);
}
