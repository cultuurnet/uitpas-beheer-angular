'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:MainController
 * @description
 * # MainController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('MainController', mainController);

/* @ngInject */
function mainController ($rootScope, passholderService, sharedDataService, $state) {
  /*jshint validthis: true */
  var main = this;

  main.shared = sharedDataService;
  main.shared.data.passholderIdentification = '';

  main.searchPassholder = function() {
    $rootScope.appReady = false;

    passholderService.find(main.shared.data.passholderIdentification).then(
      angular.bind(main, function(passholder) {
        $state.go('main.passholder', {identification: main.shared.data.passholderIdentification});
        main.shared.data.passholder = passholder;
        main.shared.data.passholderNotFound = false;
        $rootScope.appReady = true;
      }),
      angular.bind(main, function() {
        main.shared.data.passholder = undefined;
        main.shared.data.passholderNotFound = true;
        $rootScope.appReady = true;
      })
    );
  };
}
