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
  console.log(activity, 'the activity in patCtrl');

  controller.passholder = passholder;
  controller.activity = activity;
  controller.formSubmitBusy = false;

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  controller.submitForm = function (passholder, activity, passholderActivityTariffsForm) {
    controller.formSubmitBusy = true;
    var tariff = getTariffFromForm(passholderActivityTariffsForm);
    activityService.claimTariff(passholder, activity, tariff);
    console.log(passholderActivityTariffsForm);
  };

  function getTariffFromForm(passholderActivityTariffsForm) {
    console.log(passholderActivityTariffsForm);
    return 'tariff';
  }
}
