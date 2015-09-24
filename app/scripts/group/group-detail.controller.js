'use strict';

/**
 * @ngdoc function
 * @name ubr.group.controller:GroupDetailController
 * @description
 * # GroupDetailController
 * Controller of the ubr group module.
 */
angular
  .module('ubr.group')
  .controller('GroupDetailController', GroupDetailController);

/* @ngInject */
function GroupDetailController (group, $rootScope, $scope) {
  /*jshint validthis: true */
  var controller = this;

  controller.group = group;
  controller.availableTickets = group.availableTickets;

  function updateAvailableTickets(event, ticketSale) {
    var newTicketCount = controller.availableTickets - ticketSale.ticketCount;

    if (newTicketCount < 0) {
      newTicketCount = 0;
    }

    controller.availableTickets = newTicketCount;
  }

  var ticketsSoldListener = $rootScope.$on('ticketsSold', updateAvailableTickets);

  $scope.$on('$destroy', ticketsSoldListener);
}
