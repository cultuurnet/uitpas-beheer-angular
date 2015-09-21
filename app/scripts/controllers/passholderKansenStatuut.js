'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderKansenStatuutController
 * @description
 * # PassholderKansenStatuutController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderKansenStatuutController', PassholderKansenStatuutController);

/* @ngInject */
function PassholderKansenStatuutController (passholder, activeCounter, cardSystemId, $modalInstance) {
  /*jshint validthis: true */
  var controller = this;

  controller.formSubmitBusy = false;
  controller.passholder = passholder;
  controller.activeCounter = activeCounter;
  controller.cardSystemid = cardSystemId;
  controller.kansenstatuut = passholder.getKansenstatuutByCardSystemID(cardSystemId);

  console.log(controller.kansenstatuut);

  console.log(passholder);

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
