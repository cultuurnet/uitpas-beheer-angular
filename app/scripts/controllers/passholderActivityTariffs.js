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
  controller.selectedTariff = null;
  controller.formSubmitBusy = false;
  controller.formSubmitError = false;

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  controller.submitForm = function (passholder, activity, passholderActivityTariffsForm) {
    controller.formSubmitBusy = true;
    var tariff = getTariffFromForm(passholderActivityTariffsForm);

    var tariffClaimedSuccessfully = function () {
      tariff.assigned = true;
      controller.formSubmitBusy = false;
      $modalInstance.close('fred');
    };

    var tariffNotClaimed= function (error) {
      controller.formSubmitError = error;
      tariff.assignError = true;
      controller.formSubmitBusy = false;
    };


    activityService.claimTariff(passholder, activity, tariff).then(
      tariffClaimedSuccessfully,
      tariffNotClaimed
    );
  };

  function getTariffFromForm(passholderActivityTariffsForm) {
    var splitTariffValue = passholderActivityTariffsForm.tariff.$viewValue.split('-');
    var tariffValue = {
      type: splitTariffValue[0],
      id: splitTariffValue[1]
    };

    splitTariffValue = splitTariffValue.slice(2);
    tariffValue.price = splitTariffValue.join('-');

    return tariffValue;
  }
}
