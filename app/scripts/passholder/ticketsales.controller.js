'use strict';

/**
 * A ticket sale object.
 * @typedef {Object} TicketSale
 * @property {string}   id            - The ID of the ticket sale, eg: 30819.
 * @property {string}   creationDate  - The date when the sale occurred, eg: 2012-12-30.
 * @property {float}    price         - The price of the ticket as a float.
 * @property {string}   [eventTitle]  - The title of the event.
 * @property {Object}   [coupon]      - An optional coupon used when making the sale.
 *
 * Some additional properties used to track removal
 * @property {boolean}  [removing]        - Flag set when the sale is being removed.
 * @property {boolean}  [removingFailed]  - Flag set when removal of a sale has failed.
 */

/**
 * @ngdoc function
 * @name ubr.passholder.controller:TicketSalesController
 * @name tsc
 * @description
 * # TicketSalesController
 * Controller of the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .controller('TicketSalesController', TicketSalesController);

/**
 * @ngInject
 * @param {passholderService} passholderService
 * @param {Pass} pass
 * @param {Passholder} passholder
 * @param $modalInstance
 * @constructor
 */
function TicketSalesController (pass, passholder, $modalInstance, passholderService) {
  /*jshint validthis: true */
  var controller = this;
  controller.passholder = passholder;
  controller.ticketSalesLoading = true;
  /**
   * All the tickets sold to the given passholder.
   * @type {TicketSale[]}
   */
  controller.ticketSales = [];

  /**
   * @param {TicketSale[]} ticketSales
   */
  var displayTicketSales = function(ticketSales) {
    controller.ticketSales = ticketSales;
    controller.ticketSalesLoading = false;
  };

  var loadTicketSales = function() {
    controller.ticketSalesLoading = true;
    passholderService
      .getTicketSales(pass.number)
      .then(displayTicketSales);
  };

  loadTicketSales();

  controller.cancel = function () {
    $modalInstance.dismiss('canceled');
  };

  /**
   * Request to remove a ticket sale and update the list accordingly.
   * @param {TicketSale} ticketSale
   */
  controller.removeTicketSale = function (ticketSale) {
    ticketSale.removing = true;

    var displayRemoveError = function () {
      ticketSale.removing = false;
      ticketSale.removingFailed = true;
    };

    passholderService
      .removeTicketSale(passholder, ticketSale)
      .then(loadTicketSales, displayRemoveError);
  };
}
