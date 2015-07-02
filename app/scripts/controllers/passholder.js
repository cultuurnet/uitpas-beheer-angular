'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderController
 * @description
 * # PassholderController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderController', PassholderController);

/* @ngInject */
function PassholderController ($rootScope, passholderService, sharedDataService, $state, $stateParams) {
  /*jshint validthis: true */
  var pc = this;

  pc.shared = sharedDataService;
  pc.shared.data.passholder = {};

  $rootScope.appReady = false;
  passholderService.find($stateParams.identification).then(
    angular.bind(pc, function(passholder) {
      pc.shared.data.passholder = passholder;
      pc.shared.data.passholderNotFound = false;
      $rootScope.appReady = true;
    }),
    angular.bind(pc, function() {
      $state.go('main');
    })
  );
}
