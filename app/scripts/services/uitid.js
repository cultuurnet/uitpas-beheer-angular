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

  this.user = undefined;

  /**
   * @returns {Promise}
   *   A promise with the credentials of the currently logged in user.
   */
  this.getUser = function() {
    var deferredUser = $q.defer();

    if (this.user) {
      deferredUser.resolve(this.user);
    } else {
      $http
        .get(apiUrl + '/user', {
          withCredentials: true
        })
        .success(angular.bind(this, function (userData) {
          this.user = userData;
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
  this.getLoginStatus = function() {
    var deferredStatus = $q.defer();

    this
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

  this.login = function(destination) {
    $window.location.href = authUrl + "?destination=" + destination;
  };

  /**
   * @returns {Promise}
   *   A promise with no additional data.
   */
  this.logout = function() {
    var deferredLogout = $q.defer();

    $http
      .get(apiUrl + '/logout', {
        withCredentials: true
      })
      .then(angular.bind(this, function() {
        this.user = undefined;
        deferredLogout.resolve();
      }));

    return deferredLogout.promise;
  };
}
