'use strict';

/**
 * @ngdoc function
 * @name ubr.kansenstatuut.controller:PassholderKansenStatuutController
 * @description
 * # PassholderKansenStatuutController
 * Controller of ubr.kansenstatuut
 */
angular
  .module('ubr.kansenstatuut')
  .controller('PassholderKansenStatuutController', PassholderKansenStatuutController);

/* @ngInject */
function PassholderKansenStatuutController (passholder, activeCounter, cardSystemId, $modalInstance, passholderService, $scope) {
  /*jshint validthis: true */
  var controller = this;

  controller.updatePending = false;
  controller.passholder = passholder;
  controller.activeCounter = activeCounter;
  controller.cardSystemid = cardSystemId;
  controller.kansenstatuut = angular.copy(passholder.getKansenstatuutByCardSystemID(cardSystemId));
  controller.asyncError = null;

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  controller.counterCanAlterKansenStatuut = function (kansenStatuut) {
    var isEligible = false;

    if (controller.activeCounter.cardSystems[kansenStatuut.cardSystem.id]) {
      var cardSystemPermissions = controller.activeCounter.cardSystems[kansenStatuut.cardSystem.id].permissions;

      // Check if active counter and card system is allowed to assign kansenstatuut passes
      if (cardSystemPermissions.indexOf('kansenstatuut toekennen') !== -1) {
        isEligible = true;
      }
    }

    return isEligible;
  };

  function clearAsyncError (newVal, oldVal) {
    if (oldVal && oldVal && newVal !== oldVal) {
      controller.asyncError = null;
    }
  }

  $scope.$watch(function () {
    return controller.kansenstatuut ? controller.kansenstatuut.endDate : null;
  }, clearAsyncError);

  controller.updateKansenstatuut = function (editForm) {
    var stopEditing = function() {
      $modalInstance.close();
    };

    var showUpdateErrors = function (errorResponse) {
      controller.asyncError = {
        message: errorResponse.data.message
      };
    };

    var unlockForm = function () {
      controller.updatePending = false;
    };

    if (editForm.endDate.$valid) {
      controller.updatePending = true;
      var kansenstatuut = controller.kansenstatuut;
      var endDate = kansenstatuut.endDate;

      passholderService
        .renewKansenstatuut(passholder, kansenstatuut, endDate)
        .then(stopEditing, showUpdateErrors)
        .finally(unlockForm);
    }
  };
}
