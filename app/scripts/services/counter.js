'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.counter
 * @description
 * # counter
 * Service in the uitpasbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .service('counter', counterService);

/* @ngInject */
function counterService($q, $http, $rootScope, $cookies, uitid, appConfig) {
  var apiUrl = appConfig.apiUrl + 'counter';

  /*jshint validthis: true */
  var counter = this;

  counter.active = undefined;
  counter.list = undefined;

  counter.lastActive = undefined;
  counter.lastActiveCookieKey = undefined;

  /**
   * @returns {Promise}
   *   A promise with a list of available counters for the active user.
   */
  counter.getList = function() {
    var deferredList = $q.defer();

    if (counter.list !== undefined) {
      deferredList.resolve(counter.list);
    } else {
      $http
        .get(apiUrl + '/list', {
          withCredentials: true
        })
        .success(function(listData) {
          counter.list = listData;
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
   *   A promise with a the last active counter for the active user.
   */
  counter.getLastActive = function() {
    var deferred = $q.defer();

    if (counter.lastActive !== undefined) {
      deferred.resolve(counter.lastActive);
    } else {
      counter.getLastActiveCookieKey().then(
        function(cookieKey) {
          counter.lastActive = $cookies.getObject(cookieKey);

          if (counter.lastActive === undefined) {
            deferred.resolve(undefined);
          } else {
            counter.getList().then(
              function(list) {
                if (counter.lastActive.id in list) {
                  deferred.resolve(counter.lastActive);
                } else {
                  deferred.resolve(undefined);
                }
              },
              function() {
                deferred.resolve(undefined);
              }
            );
          }
        },
        function() {
          deferred.resolve(undefined);
        }
      );
    }

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the cookie key for the last active counter for the active
   *   user.
   */
  counter.getLastActiveCookieKey = function() {
    var deferred = $q.defer();

    if (counter.lastActiveCookieKey !== undefined) {
      deferred.resolve(counter.lastActiveCookieKey);
    } else {
      uitid.getUser().then(function(user) {
        counter.lastActiveCookieKey = 'lastActiveCounter-' + user.id;
        deferred.resolve(counter.lastActiveCookieKey);
      });
    }

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the active counter for the current user.
   */
  counter.getActive = function() {
    var deferred = $q.defer();

    if (counter.active !== undefined) {
      deferred.resolve(counter.active);
    } else {
      counter.getList().then(function(list) {
        var ids = Object.keys(list);
        if (ids.length === 1) {
          var id = ids[0];
          counter.setActive(list[id]);
          deferred.resolve(list[id]);
        } else {
          deferred.resolve(undefined);
        }
      });
    }

    return deferred.promise;
  };

  counter.setActive = function(activeCounter) {
    counter.active = activeCounter;
    $rootScope.$emit('activeCounterChanged', activeCounter);

    counter.lastActive = activeCounter;
    counter.getLastActiveCookieKey().then(function(cookieKey) {
      $cookies.putObject(cookieKey, counter.lastActive);
    });
  };

  counter.setNoActive = function() {
    counter.active = undefined;
    $rootScope.$emit('activeCounterChanged', undefined);
  };
}
