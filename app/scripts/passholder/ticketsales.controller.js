'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.controller:TicketSalesController
 * @description
 * # TicketSalesController
 * Controller of the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .controller('TicketSalesController', TicketSalesController);

/* @ngInject */
function TicketSalesController (pass, passholder, $modalInstance, passholderService) {
  /*jshint validthis: true */
  var controller = this;
  controller.passholder = passholder;

  var displayTicketSales = function(ticketSales) {
    controller.ticketSales = ticketSales;
  };

  var loadTicketSales = function() {
    passholderService
      .getTicketSales(pass.number)
      .then(displayTicketSales);
  };

  loadTicketSales();

  controller.cancel = function () {
    $modalInstance.dismiss('canceled');
  };
}