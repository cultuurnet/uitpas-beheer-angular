'use strict';

/**
 * @ngdoc function
 * @name ubr.counter-membership.controller:CreateMembershipModalController
 * @description
 * # CreateMembershipModalController
 * Controller of the ubr counter membership module.
 */
angular
  .module('ubr.counter-membership')
  .controller('CreateMembershipModalController', CreateMembershipModalController);

/* @ngInject */
function CreateMembershipModalController(CounterMembershipService, $modalInstance) {
  /*jshint validthis: true */
  var controller = this;

  controller.email = '';
  controller.creationPending = false;

  controller.cancelCreation = function () {
    $modalInstance.dismiss('registration modal closed');
  };

  controller.createMembership = function () {

    controller.creationPending = true;
    CounterMembershipService.createMembership();
  };
}
