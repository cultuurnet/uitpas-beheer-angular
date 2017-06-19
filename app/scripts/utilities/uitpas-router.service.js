'use strict';

/**
 * @ngdoc service
 * @name ubr.utilities.UiTPASRouter
 * @description
 * # UiTPAS router service
 * Service in the ubr.utilities module.
 */
angular
  .module('ubr.utilities')
  .service('UiTPASRouter', UiTPASRouterService);

/* @ngInject */
function UiTPASRouterService($rootScope, $state, passholderService) {

  /*jshint validthis: true */
  var service = this;
  /**
   * The last string that has been passed to identify.
   * @type {string}
   */
  var lastIdentification = '';

  /**
   * Get the last string that was searched. Useful to refill a search field after switching states.
   * @return {string}
   */
  service.getLastIdentification = function () {
    return lastIdentification;
  };

  /**
   * Navigate to a state based on an UiTPAS identity.
   *
   * @param {string} identification
   */
  service.go = function(identification) {

    $rootScope.appBusy = true;
    lastIdentification = identification;

    function redirectAccordingPassData(pass) {

        pass.status = 'new';
        pass.passholder = false;
        pass.group = false;

      if (pass.passholder) {
        displayPassholderDetails(pass);
      }
      else if (pass.group) {
        displayGroupDetails(pass.group);
      }
      else if (pass.status === 'DELETED') {
        $state.go('counter.main.error', {
          'title': 'Kaart verwijderd',
          'description': 'Deze kaart is verwijderd. Vraag de pashouder naar zijn nieuwe kaart',
          'code': 'PASS_DELETED'
        });
      }
      else {
        registerNewPassholder(pass);
      }
    }

    function displayGroupDetails() {
      $state.go('counter.main.group', {identification: identification});
    }

    function displayPassholderDetails(pass) {
      if (pass.number === $state.params.identification) {
        $state.reload('counter.main.passholder');
      }
      else {
        $state.go(
          'counter.main.passholder',
          {
            pass: pass,
            identification: pass.number
          }
        );
      }
    }

    function registerNewPassholder(pass) {
      if (pass.number === $state.params.identification) {
        $state.reload('counter.main.register');
      }
      else {
        $state.go(
          'counter.main.register',
          {
            pass: pass,
            identification: pass.number,
            type: pass.type
          }
        );
      }
    }

    function displayIdentificationError(error) {
      $state.go(
        'counter.main.error',
        {
          title: error.title,
          description: error.message,
          type: error.code
        },
        {
          reload: true
        }
      );
    }

    passholderService
      .findPass(identification)
      .then(redirectAccordingPassData, displayIdentificationError);
  };

  var scanListener;
  /**
   * Toggles redirects on or off or gets the current state when called without arguments
   *  You still have to set a redirectOnScan property with a value of true on your route for redirects to happen.
   *
   * @param {boolean} [flag]
   */
  service.redirectOnScanEnabled = function (flag) {
    if (typeof flag === 'undefined') {
      return typeof scanListener !== 'undefined';
    } else {
      if (flag && typeof scanListener === 'undefined') {
        scanListener = $rootScope.$on('nfcNumberReceived', redirectOnScan);
      } else if (!flag && scanListener instanceof Function){
        // call the scanListener to disable it then remove the callback to not trip the check above
        scanListener();
        scanListener = undefined;
      }
    }
  };

  function redirectOnScan(event, identification) {
    if ($state.current.redirectOnScan === true) {
      service.go(identification);
    }
  }
}
