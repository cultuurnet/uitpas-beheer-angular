'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.uitid
 * @description
 * # uitid
 * Service in the uitpasbeheerApp.
 */
angular
  .module('uitpasbeheerApp')
  .service('uitid', uitidService);

/* @ngInject */
function uitidService($q, $window, $http, appConfig) {
  var apiUrl = appConfig.apiUrl + 'uitid';
  var authUrl = appConfig.apiUrl + 'culturefeed/oauth/connect';
  /*jshint validthis: true */
  var uitId = this;

  uitId.user = undefined;

  /**
   * @returns {Promise}
   *   A promise with the credentials of the currently logged in user.
   */
  uitId.getUser = function() {
    var deferredUser = $q.defer();

    if (uitId.user) {
      deferredUser.resolve(uitId.user);
    } else {
      $http
        .get(apiUrl + '/user', {
          withCredentials: true
        })
        .success(angular.bind(uitId, function (userData) {
          uitId.user = userData;
          deferredUser.resolve(userData);
        }))
        .error(function () {
          deferredUser.reject();
        });
    }

    return deferredUser.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the login status (true or false).
   */
  uitId.getLoginStatus = function() {
    var deferredStatus = $q.defer();

    uitId
      .getUser()
      .then(
        function () {
          deferredStatus.resolve(true);
        },
        function () {
          deferredStatus.resolve(false);
        }
      );

    return deferredStatus.promise;
  };

  uitId.login = function(destination) {
    $window.location.href = authUrl + '?destination=' + destination;
  };

  /**
   * @returns {Promise}
   *   A promise with no additional data.
   */
  uitId.logout = function() {
    var deferredLogout = $q.defer();

    $http
      .get(apiUrl + '/logout', {
        withCredentials: true
      })
      .then(angular.bind(uitId, function() {
        uitId.user = undefined;
        deferredLogout.resolve();
      }));

    return deferredLogout.promise;
  };
}
