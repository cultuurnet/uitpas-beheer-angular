'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.controller:CheckinAdvantagesController
 * @name cac
 * @description
 * # CheckinAdvantagesController
 * Controller of the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .controller('CheckinsController', CheckinsController);

/**
 * @ngInject
 * @param {passholderService} passholderService
 * @param {Pass} pass
 * @param {Passholder} passholder
 * @param $uibModalInstance
 * @constructor
 */
function CheckinsController (pass, passholder, $uibModalInstance, passholderService, $rootScope) {
  /*jshint validthis: true */
  var controller = this;
  controller.passholder = passholder;
  controller.checkinsLoading = true;
  /**
   * All the tickets sold to the given passholder.
   * @type {TicketSale[]}
   */
  controller.checkins = [];

  /**
   * @param {TicketSale[]} ticketSales
   */
  var displayCheckins = function(checkins) {
    controller.checkins = checkins;
    controller.checkinsLoading = false;
  };

  var loadCheckins = function() {
    controller.checkinsLoading = true;
    passholderService
      //.getCheckins(pass.number)
      .getCheckins()
      .then(displayCheckins);
  };

  loadCheckins();

  controller.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}
