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
function CreateMembershipModalController(counterService, $modalInstance) {
  /*jshint validthis: true */
  var controller = this;

  controller.email = '';
  controller.creationPending = false;

  controller.cancelCreation = function () {
    $modalInstance.dismiss('registration modal closed');
  };

  controller.createMembership = function (form) {
    if (form.$invalid) {
      // @TODO: this shouldn't be set
      form.$submitted = true;
      return;
    }
    controller.creationPending = true;
    counterService
      .createMembership(controller.email)
      .then(memberCreated, handleError);
  };

  var memberCreated = function(response){
    controller.creationPending = false;
    $modalInstance.dismiss('new member added');
    console.log(response);
    // @TODO: new member is added, update members-overview page
  };
  var handleError = function(response){
    controller.creationPending = false;
    console.log(response);
    // @TODO: handle errors
  };
}
