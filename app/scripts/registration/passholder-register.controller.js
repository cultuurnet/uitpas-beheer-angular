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
function PassholderRegisterController (pass) {
  /*jshint validthis: true */
  var controller = this;

  controller.pass = pass;

  controller.kansenstatuut = {
    endDate: new Date(),
    remarks: '',
    includeRemarks: false
  };
}
