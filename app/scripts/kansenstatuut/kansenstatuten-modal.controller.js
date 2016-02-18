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
function KansenstatutenModalController (passholder, activeCounter, cardSystemId, $uibModalInstance, $rootScope, passholderService, $scope) {
  /*jshint validthis: true */
  var controller = this;

  controller.updatePending = false;
  controller.passholder = passholder;
  controller.activeCounter = activeCounter;
  controller.cardSystemid = cardSystemId;

  controller.cancelModal = function () {
    $uibModalInstance.dismiss();
  };

  controller.counterCanAlterKansenStatuut = function (kansenStatuut) {
    return controller.activeCounter.isAuthorisedRegistrationCounter(kansenStatuut.cardSystem.id);
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
  var refreshPassHolderOnSchoolUpdatedListener = $rootScope.$on('schoolUpdated', refreshPassholder);

  $scope.$on('$destroy', refreshPassHolderOnKansenStatuutRenewalListener);
  $scope.$on('$destroy', refreshPassHolderOnRemarksUpdatedListener);
  $scope.$on('$destroy', refreshPassHolderOnSchoolUpdatedListener);
}
