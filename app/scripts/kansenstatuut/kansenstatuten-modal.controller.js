'use strict';

/**
 * @ngdoc function
 * @name ubr.kansenstatuut.controller:KansenstatutenModalController
 * @description
 * # KansenstatutenModalController
 * Controller of ubr.kansenstatuut
 */
angular
  .module('ubr.kansenstatuut')
  .controller('KansenstatutenModalController', KansenstatutenModalController);

/* @ngInject */
function KansenstatutenModalController (passholder, activeCounter, cardSystemId, $modalInstance, $rootScope, passholderService, $scope) {
  /*jshint validthis: true */
  var controller = this;

  controller.updatePending = false;
  controller.passholder = passholder;
  controller.activeCounter = activeCounter;
  controller.cardSystemid = cardSystemId;

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  controller.counterCanAlterKansenStatuut = function (kansenStatuut) {
    return controller.activeCounter.isAuthorisedRegistrationCounter(kansenStatuut);
  };

  function refreshPassholder () {
    passholderService.findPassholder(passholder.passNumber).then(
      function (passholder) {
        controller.passholder = passholder;
      }
    );
  }

  var refreshPassHolderOnKansenStatuutRenewalListener = $rootScope.$on('kansenStatuutRenewed', refreshPassholder);
  var refreshPassHolderOnRemarksUpdatedListener = $rootScope.$on('remarksUpdated', refreshPassholder);

  $scope.$on('$destroy', refreshPassHolderOnKansenStatuutRenewalListener);
  $scope.$on('$destroy', refreshPassHolderOnRemarksUpdatedListener);
}
