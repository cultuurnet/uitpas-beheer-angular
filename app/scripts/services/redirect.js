'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.redirect
 * @description
 * # redirect
 * Service in the uitpasbeheerApp.
 */
angular
  .module('uitpasbeheerApp')
  .service('redirect', redirectService);

/* @ngInject */
function redirectService($q, $location, uitid) {
  this.redirectIfLoggedIn = function(path) {
    return this.redirectOnStatus(true, path);
  };

  this.redirectIfAnonymous = function(path) {
    return this.redirectOnStatus(false, path);
  };

  this.redirectOnStatus = function(status, path) {
    var deferred = $q.defer();

    uitid.getLoginStatus().then(function(loggedIn) {
      if (loggedIn == status) {
        deferred.reject();
        $location.path(path);
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  };
}
