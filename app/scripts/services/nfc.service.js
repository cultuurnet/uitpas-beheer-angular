'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.nfcService
 * @description
 * # nfcService
 * Service in the uitpasbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .service('nfcService', nfcService);

/* @ngInject */
function nfcService($window, $rootScope) {
  /*jshint validthis: true */
  var service = this;

  service.init = function () {
    $window.readNfc = function(nfcNumber) {
      $rootScope.$emit('nfcNumberReceived', nfcNumber);
    };
  };

}
