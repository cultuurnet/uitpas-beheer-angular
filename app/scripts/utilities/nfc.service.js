'use strict';

/**
 * @ngdoc service
 * @name ubr.utilities.nfcService
 * @description
 * # nfcService
 * Service in the ubr.utilities module.
 */
angular.module('ubr.utilities')
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
