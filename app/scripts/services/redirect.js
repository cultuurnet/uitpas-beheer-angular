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
  this.ifLoggedIn = function(path) {
    return this.ifUserStatus(true, path);
  };

  this.ifAnonymous = function(path) {
    return this.ifUserStatus(false, path);
  };

  this.ifUserStatus = function(status, path) {
    var deferred = $q.defer();

    uitid.getLoginStatus().then(function(loggedIn) {
      if (loggedIn === status) {
        deferred.reject();
        $location.path(path);
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  };
}
