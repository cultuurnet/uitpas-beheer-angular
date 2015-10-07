'use strict';

/**
 * @ngdoc function
 * @name ubr.counter-membership.controller:CounterMembershipsController
 * @description
 * # CounterMembershipsController
 * Controller of the ubr counter membership module.
 */
angular
  .module('ubr.counter-membership')
  .controller('CounterMembershipsController', CounterMembershipsController);

/* @ngInject */
function CounterMembershipsController(CounterMembershipService) {
  /*jshint validthis: true */
  var controller = this;

  controller.loadingMembers = true;
  controller.members = [];

  controller.init = function () {
    var showMembers = function (members) {
      controller.members = members;
      controller.loadingMembers = false;
    };

    CounterMembershipService
      .getMemberships()
      .then(showMembers);
  };

  controller.init();
}
