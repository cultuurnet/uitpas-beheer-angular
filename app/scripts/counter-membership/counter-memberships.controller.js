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
function CounterMembershipsController(newMember, counterService, $state) {
  /*jshint validthis: true */
  var controller = this;
  controller.newMember = newMember;

  controller.loadingMembers = true;
  controller.members = [];
  controller.noMembersError = false;

  controller.loadMemberships = function () {
    var showMembers = function (members) {
      controller.members = members;
      controller.loadingMembers = false;
      controller.noMembersError = false;
    };

    var noMembersFound = function () {
      controller.loadingMembers = false;
      controller.noMembersError = true;
    };

    controller.loadingMembers = true;
    counterService
      .getMemberships()
      .then(showMembers, noMembersFound);
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
    member.confirmingDelete = false;

    var updateMemberships = function(){
      controller.deletedMember = angular.copy(member);
      controller.loadMemberships();
    };
    var displayError = function(){
      member.deleting = false;
      member.deleteError = true;
    };

    counterService
      .deleteMembership(member.uid)
      .then(updateMemberships, displayError);
  };

  controller.loadMemberships();
}
