'use strict';

/**
 * @ngdoc service
 * @name ubr.utilities.uitid
 * @description
 * # uitid
 * Service in the ubr.utilities module.
 */
angular
  .module('ubr.utilities')
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
    var runningInIframe = isRunningInIframe();

    if (uitId.user) {
      deferredUser.resolve(uitId.user);
    } else {
      $http
        .get(apiUrl + '/user')
        .success(angular.bind(uitId, function (userData) {
          uitId.user = userData;
          uitId.user.displayName = uitId.user.givenName || uitId.user.nick;

          deferredUser.resolve(userData);

          if (runningInIframe) {
            window.parent.postMessage({
              source: 'BALIE',
              type: 'LOGIN',
            }, '*');
          }
        }))
        .error(function () {
          deferredUser.reject();

          if (runningInIframe) {
            window.parent.postMessage({
              source: 'BALIE',
              type: 'LOGOUT',
            }, '*');
          }
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
    window.location = apiUrl + '/logout';
  };
}
