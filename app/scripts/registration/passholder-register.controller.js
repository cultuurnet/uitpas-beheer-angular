'use strict';

/**
 * @ngdoc function
 * @name ubr.registration.controller:PassholderRegisterController
 * @description
 * # PassholderRegisterController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('ubr.registration')
  .controller('PassholderRegisterController', PassholderRegisterController);

/* @ngInject */
function PassholderRegisterController (pass, $state, activeCounter) {
  /*jshint validthis: true */
  var controller = this;

  controller.pass = pass;

  controller.isCounterEligible = function () {
    var isEligible = false,
        counter = activeCounter,
        cardSystemPermissions = counter.cardSystems[pass.cardSystem.id].permissions;

    // Check if the card system is allowed to register at the active counter.
    if (cardSystemPermissions.indexOf('registratie') >= 0) {
      isEligible = true;
    }

    // Check if active counter and card system is allowed to assign kansenstatuut passes
    if (pass.isKansenstatuut() && cardSystemPermissions.indexOf('kansenstatuut toekennen') === -1) {
      isEligible = false;
    }

    return isEligible;
  };

  controller.kansenstatuut = {
    endDate: new Date(),
    remarks: '',
    includeRemarks: false
  };

  controller.startRegistration = function () {

    if (!controller.isCounterEligible()) {
      throw new Error('The active counter does not have the required permissions to register this UiTPAS.');
    }

    var registrationParameters = {
      kansenstatuut: false
    };

    if (pass.isKansenstatuut()) {
      registrationParameters.kansenstatuut = controller.kansenstatuut;
    }

    $state.go('counter.main.register.form.personalData', registrationParameters);
  };
}
