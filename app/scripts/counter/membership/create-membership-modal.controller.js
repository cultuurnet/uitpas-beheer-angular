'use strict';

/**
 * @ngdoc function
 * @name ubr.counter.membership.controller:CreateMembershipModalController
 * @description
 * # CreateMembershipModalController
 * Controller of the ubr counter membership module.
 */
angular
  .module('ubr.counter.membership')
  .controller('CreateMembershipModalController', CreateMembershipModalController);

/* @ngInject */
function CreateMembershipModalController(counterService, $modalInstance) {
  /*jshint validthis: true */
  var controller = this;

  controller.email = '';
  controller.creationPending = false;

  controller.cancelCreation = function () {
    $modalInstance.dismiss();
  };

  controller.createMembership = function (form) {
    if (form.$invalid) {
      return;
    }
    controller.creationPending = true;

    var memberCreated = function(newMemberResponse){
      controller.creationPending = false;
      $modalInstance.close(newMemberResponse);
    };
    var handleError = function(response){
      if (response.code === 'UNKNOWN_USER') {
        controller.asyncError = {
          message: 'De gebruiker met email <em>' + controller.email + '</em> kan niet gevonden worden in het systeem.'
        };
      }
      else {
        controller.asyncError = {
          message: 'Er werd niemand gevonden met het e-mail adres <em>' + controller.email + '</em>.<br>Gelieve de persoon die je wenst toe te voegen te vragen om zich eerst te registeren op UiTinVlaanderen.be.'
        };
      }
      controller.creationPending = false;
    };

    counterService
      .createMembership(controller.email)
      .then(memberCreated, handleError);
  };
}
