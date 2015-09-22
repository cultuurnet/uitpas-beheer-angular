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
function KansenstatutenModalController (passholder, activeCounter, cardSystemId, $modalInstance) {
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
}
