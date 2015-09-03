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
function PassholderRegisterController (pass, $state) {
  /*jshint validthis: true */
  var controller = this;

  controller.pass = pass;

  controller.kansenstatuut = {
    endDate: new Date(),
    remarks: '',
    includeRemarks: false
  };

  controller.startRegistration = function () {
    var registrationParameters = {
      kansenstatuut: false
    };

    if (pass.isKansenstatuut()) {
      registrationParameters.kansenstatuut = controller.kansenstatuut;
    }

    $state.go('counter.main.register.form.personalData', registrationParameters);
  };
}
