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
function PassholderActivityTariffsController (passholder, activity, $modalInstance, activityService, $rootScope) {
  /*jshint validthis: true */
  var controller = this;

  controller.passholder = passholder;
  controller.activity = activity;
  controller.selectedTariff = null;
  controller.formSubmitBusy = false;
  controller.formSubmitError = false;
  controller.groupSale = passholder.hasOwnProperty('availableTickets') ? {
    tickets: 1,
    maxTickets: passholder.availableTickets,
    getTotalPrice: function () {
      var defaultPrice = 0;
      var selectedPrice = controller.selectedTariff ? controller.selectedTariff.price : null;
      var ticketPrice = selectedPrice ? selectedPrice : defaultPrice;
      var totalPrice = ticketPrice * this.tickets;

      return totalPrice;
    }
  } : null;

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  controller.claimTariff = function (passholder, activity) {
    var tariff = angular.copy(controller.selectedTariff);
    var ticketCount = controller.groupSale ? controller.groupSale.tickets : null;

    var tariffClaimedSuccessfully = function () {
      tariff.assigned = true;
      $rootScope.$emit('activityTariffClaimed', activity);
      controller.formSubmitBusy = false;
      $modalInstance.close();
    };

    var tariffNotClaimed = function (error) {
      controller.formSubmitError = error;
      tariff.assignError = true;
      controller.formSubmitBusy = false;
    };

    controller.formSubmitBusy = true;
    activityService
      .claimTariff(passholder, activity, tariff, ticketCount)
      .then(tariffClaimedSuccessfully, tariffNotClaimed);
  };
}
