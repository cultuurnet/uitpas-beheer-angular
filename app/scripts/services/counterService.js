'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.counterService
 * @description
 * # counterService
 * Service in the uitpasbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .service('counterService', counterService);

/* @ngInject */
function counterService($q, $http, $rootScope, $cookies, uitid, appConfig) {
  var apiUrl = appConfig.apiUrl + 'counter';

  /*jshint validthis: true */
  var counterService = this;

  counterService.active = undefined;
  counterService.list = undefined;

  /**
   * @returns {Promise}
   *   A promise with a list of available counters for the active user.
   */
  counterService.getList = function() {
    var deferredList = $q.defer();

    if (counterService.list !== undefined) {
      deferredList.resolve(counterService.list);
    } else {
      $http
        .get(apiUrl + '/list', {
          withCredentials: true
        })
        .success(function(listData) {
          counterService.list = listData;
          deferredList.resolve(listData);
        })
        .error(function() {
          deferredList.reject();
        });
    }

    return deferredList.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the active counter for the current user.
   */
  counterService.getActive = function() {
    var deferred = $q.defer();

    if (counterService.active !== undefined) {
      deferred.resolve(counterService.active);
    } else {
      counterService.getActiveFromServer().then(
        function(activeCounter) {
          counterService.active = activeCounter;
          deferred.resolve(activeCounter);
        },
        function() {
          counterService.getList().then(function(list) {
            var ids = Object.keys(list);
            if (ids.length === 1) {
              var id = ids[0];
              counterService.setActive(list[id]);
              deferred.resolve(list[id]);
            } else {
              deferred.reject();
            }
          });
        }
      );
    }

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the active counter for the current user, from the server.
   */
  counterService.getActiveFromServer = function() {
    var deferred = $q.defer();

    $http
      .get(apiUrl + '/active', {
        withCredentials: true
      })
      .success(function(counter) {
        deferred.resolve(counter);
      })
      .error(function() {
        deferred.reject();
      });

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise that the active counter has been set for the current user.
   */
  counterService.setActive = function(activeCounter) {
    var deferred = $q.defer();

    var setActiveOnServer = counterService.setActiveOnServer(activeCounter.id);
    var setLastActiveId = counterService.setLastActiveId(activeCounter.id);

    $q.all([setActiveOnServer, setLastActiveId]).then(
      function() {
        counterService.active = activeCounter;
        $rootScope.$emit('activeCounterChanged', activeCounter);
        deferred.resolve();
      },
      function() {
        deferred.reject();
      }
    );

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise that the active counter has been set for the current user on the server.
   */
  counterService.setActiveOnServer = function(id) {
    var deferred = $q.defer();

    $http
      .post(apiUrl + '/active', {id: id}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .success(function() {
        deferred.resolve();
      })
      .error(function() {
        deferred.reject();
      });

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise that the last active counter id has been stored on the client.
   */
  counterService.setLastActiveId = function(id) {
    var deferred = $q.defer();

    counterService.determineLastActiveCookieKey().then(
      function(cookieKey) {
        $cookies.put(cookieKey, id);
        deferred.resolve(cookieKey);
      },
      function() {
        deferred.reject();
      }
    );

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with a the last active counter id for the active user.
   */
  counterService.getLastActiveId = function() {
    var deferred = $q.defer();

    counterService.determineLastActiveCookieKey().then(
      function(cookieKey) {
        var lastActive = $cookies.get(cookieKey);

        if (lastActive === undefined) {
          deferred.reject();
        } else {
          deferred.resolve(lastActive);
        }
      },
      function() {
        deferred.reject();
      }
    );

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the cookie key for the last active counter for the current
   *   user.
   */
  counterService.determineLastActiveCookieKey = function() {
    var deferred = $q.defer();

    uitid.getUser().then(
      function(user) {
        deferred.resolve('lastActiveCounter-' + user.id);
      },
      function() {
        deferred.reject();
      }
    );

    return deferred.promise;
  };
}
