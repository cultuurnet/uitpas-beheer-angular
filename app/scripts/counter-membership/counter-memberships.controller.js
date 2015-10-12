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
function CounterMembershipsController(counterService, $state) {
  /*jshint validthis: true */
  var controller = this;

  controller.loadingMembers = true;
  controller.members = [];

  controller.init = function () {
    var showMembers = function (members) {
      controller.members = members;
      controller.loadingMembers = false;
    };

    counterService
      .getMemberships()
      .then(showMembers);
  };

  controller.createMembership = function () {
    $state.go('counter.memberships.create');
  };

  controller.initiateDelete = function(member){
    member.confirmingDelete = true;
  };

  controller.cancelDelete = function(member){
    member.confirmingDelete = false;
  };

  controller.deleteMember = function(member){
    member.deleting = true;
    counterService
      .deleteMembership(member.uid)
      .then(memberDeleted, handleError);
  };

  var memberDeleted = function(response){
    console.log(response);
  };
  var handleError = function(response){
    console.log(response);
  };

  controller.init();
}
