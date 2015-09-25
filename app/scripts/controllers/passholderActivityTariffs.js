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
function PassholderActivityTariffsController (
  passholder,
  activity,
  $modalInstance,
  activityService,
  $rootScope,
  TicketSaleAPIError
) {
  /*jshint validthis: true */
  var controller = this;

  controller.passholder = passholder;
  controller.activity = activity;
  controller.selectedTariff = null;
  controller.formSubmitBusy = false;
  controller.asyncError = false;
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

  function init() {
    var firstTariff = controller.activity.sales.tariffs.list[0];
    var defaultTariff = firstTariff.prices[0];
    controller.selectedTariff = defaultTariff;
  }
  init();

  controller.cancelModal = function () {
    $modalInstance.dismiss();
  };

  controller.clearAsyncError = function () {
    controller.asyncError = false;
  };

  controller.handleAsyncError = function (error) {
    var knownAPIError = TicketSaleAPIError[error.code];

    if (knownAPIError) {
      error.cleanMessage = knownAPIError.message;
    } else {
      error.cleanMessage = error.message.split('URL CALLED')[0];
    }

    controller.asyncError = error;
    controller.formSubmitBusy = false;
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
      controller.handleAsyncError(error);
      tariff.assignError = true;
    };

    controller.formSubmitBusy = true;
    activityService
      .claimTariff(passholder, activity, tariff, ticketCount)
      .then(tariffClaimedSuccessfully, tariffNotClaimed);
  };
}
