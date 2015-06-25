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
function redirectService($q, $location, uitid, counterService) {
  /*jshint validthis: true */
  var redirect = this;

  redirect.ifLoggedIn = function(path) {
    return redirect.ifUserStatus(true, path);
  };

  redirect.ifAnonymous = function(path) {
    return redirect.ifUserStatus(false, path);
  };

  redirect.ifUserStatus = function(status, path) {
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

  redirect.ifActiveCounter = function(path) {
    var deferred = $q.defer();

    counterService.getActive().then(function(activeCounter) {
      if (activeCounter !== undefined) {
        deferred.reject();
        $location.path(path);
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  };

  redirect.ifNoActiveCounter = function(path) {
    var deferred = $q.defer();

    counterService.getActive().then(
      function(activeCounter) {
        deferred.resolve(activeCounter);
      },
      function() {
        deferred.reject();
        $location.path(path);
      }
    );

    return deferred.promise;
  };
}
