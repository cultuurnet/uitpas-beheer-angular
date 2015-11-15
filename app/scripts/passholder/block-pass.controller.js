'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.controller:PassholderBlockPassController
 * @description
 * # PassholderBlockPassController
 * Controller of the ubr.passholder module.
 */
angular.module('ubr.passholder')
  .controller('PassholderBlockPassController', PassholderBlockPassController);

/* @ngInject */
function PassholderBlockPassController(pass, passholder, passholderService, $uibModalInstance, $q, $state) {
  /* jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.pass = angular.copy(pass);
  controller.passholder = angular.copy(passholder);
  controller.busyBlocking = false;
  controller.asyncError = false;

  var errors = {
    UNKNOWN_UITPASNUMBER: 'Dit uitpas nummer is onbekend.',
    PARSE_INVALID_UITPASNUMBER: 'Dit uitpas nummer is ongeldig.',
    INVALID_CARD_STATUS: 'Deze uitpas heeft een ongeldige status.',
    UNKNOWN: 'Er is een onbekende fout opgetreden.'
  };

  controller.block = function() {
    var deferred = $q.defer();
    var resolveBlockedPass = function (pass) {
      // Note that we do not reset controller.busyBlocking to false here.
      // Doing so would cause the buttons to block the passholder to appear
      // again in the view right before the modal closes.
      controller.asyncError = false;
      $uibModalInstance.close();
      deferred.resolve(pass);
    };
    var showBlockingError = function (errorCode) {
      controller.busyBlocking = false;
      controller.asyncError = errors[errorCode] || errors.UNKNOWN;
      deferred.reject();
    };

    if (!controller.busyBlocking) {
      controller.busyBlocking = true;
      passholderService
        .blockPass(pass.number)
        .then(resolveBlockedPass, showBlockingError);
    } else {
      deferred.reject('Busy blocking!');
    }

    return deferred.promise;
  };

  controller.blockAndRefresh = function() {
    var showBlockedPass = function (pass) {
      $state.go(
        'counter.main.passholder',
        {identification: pass.number},
        {reload: true}
      );
    };

    controller.block().then(showBlockedPass);
  };

  controller.blockAndReplace = function() {
    var showReplacePass = function (pass) {
      $state.go(
        'counter.main.passholder.replacePass',
        {
          identification: pass.number,
          justBlocked: true
        }
      );
    };

    controller.block().then(showReplacePass);
  };

  controller.cancelModal = function() {
    $uibModalInstance.dismiss();
  };
}
