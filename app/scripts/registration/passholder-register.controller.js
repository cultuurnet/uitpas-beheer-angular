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
function PassholderRegisterController (pass, $state, activeCounter, moment, counterService) {
  /*jshint validthis: true */
  var controller = this;
  controller.pass = pass;

  // Load schools for dropdown.
  controller.schools = [];
  controller.schoolsLoaded = false;
  counterService.getSchools()
  .then(
    function (schools) {
      controller.schools = schools;
      controller.schoolsLoaded = true;
    }
  );

  controller.isCounterEligible = function () {
    // Check if the card system is allowed to register at the active counter.
    var isEligible = activeCounter.isRegistrationCounter(pass.cardSystem.id);

    // Check if active counter and card system is allowed to assign kansenstatuut passes
    if (pass.isKansenstatuut() && !activeCounter.isAuthorisedRegistrationCounter(pass.cardSystem.id)) {
      isEligible = false;
    }

    return isEligible;
  };

  controller.kansenstatuut = {
    endDate: moment().endOf('year').toDate(),
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
