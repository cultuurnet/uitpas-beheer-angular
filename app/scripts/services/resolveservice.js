'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.resolveService
 * @description
 * # resolveService
 * Service in the uitpasbeheerApp.
 */
angular
  .module('uitpasbeheerApp')
  .service('resolveService', resolveService);

/* @ngInject */
function resolveService($q) {
  /*jshint validthis: true */
  var service = this;

  service.resolveRejectedAs = function(promise, rejectedAs) {
    var deferred = $q.defer();

    promise.then(
      function(data) {
        deferred.resolve(data);
      },
      function() {
        deferred.resolve(rejectedAs);
      }
    );

    return deferred.promise;
  };
}
