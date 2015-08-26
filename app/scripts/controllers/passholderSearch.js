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

    function redirectAccordingPassData(pass) {
      if (pass.passholder) {
        displayPassholderDetails(pass.passholder);
      }
      else {
        registerNewPassholder(pass);
      }
    }

    function displayPassholderDetails(passholder) {
      $state.go(
        'counter.main.passholder',
        {
          passholder: passholder,
          identification: passholder.passNumber
        }
      );
    }

    function registerNewPassholder(pass) {
      $state.go(
        'counter.main.register',
        {
          pass: pass,
          identification: pass.number,
          type: pass.type
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

    passholderService.findPass(identification)
      .then(redirectAccordingPassData, displayIdentificationError);
  };
}
