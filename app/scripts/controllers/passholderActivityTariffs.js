'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderActivityTariffsController
 * @description
 * # ActivityTariffsController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderActivityTariffsController', PassholderActivityTariffsController);

/* @ngInject */
function PassholderActivityTariffsController (passholder, activity, $modalInstance, activityService) {
  /*jshint validthis: true */
  var controller = this;

  controller.passholder = passholder;
  controller.activity = activity;
  controller.formSubmitBusy = false;

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  controller.submitForm = function (passholder, activity, passholderActivityTariffsForm) {
    controller.formSubmitBusy = true;
    var tariff = getTariffFromForm(passholderActivityTariffsForm);

    var tariffClaimedSuccessfully = function () {
      tariff.assigned = true;
    };

    var tariffNotClaimed= function (error) {
      tariff.assignError = error;
    };

    activityService.claimTariff(passholder, activity, tariff).then(
      tariffClaimedSuccessfully,
      tariffNotClaimed
    );

    console.log(passholderActivityTariffsForm);
  };

  function getTariffFromForm(passholderActivityTariffsForm) {
    console.log(passholderActivityTariffsForm);
    return 'tariff';
  }
}
