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

  controller.isStudent = false;
  // Load schools for dropdown.
  controller.schools = [];
  controller.schoolsLoaded = false;
  counterService.getSchools()
  .then(
    function (schools) {
      controller.schools = schools;
      controller.school = schools[0];
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

  // TODO: get from permissions instead of groups
  controller.canRegisterForeign = function () {
    var hasPermission = activeCounter.groups.find(function(group){ return group === 'Mag pashouders uit buitenland registreren	';});
    return hasPermission !== undefined;
  };

  controller.kansenstatuut = {
    endDate: moment().month() < 5 ? 
        moment('30/04/' + moment().year(), 'DD/MM/YYYY') : 
        moment('30/04/' + (moment().year() + 1), 'DD/MM/YYYY'),
    remarks: '',
    includeRemarks: false
  };

  controller.startRegistration = function (registerForeign) {

    if (!controller.isCounterEligible()) {
      throw new Error('The active counter does not have the required permissions to register this UiTPAS.');
    }

    var registrationParameters = {
      kansenstatuut: false,
      registerForeign: registerForeign
    };

    if (pass.isKansenstatuut()) {
      registrationParameters.kansenstatuut = controller.kansenstatuut;
    }

    if (controller.isStudent) {
      registrationParameters.school = controller.school;
    }

    $state.go('counter.main.register.form.personalData', registrationParameters);
  };
}
