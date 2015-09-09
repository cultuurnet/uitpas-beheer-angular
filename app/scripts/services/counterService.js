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
  var apiUrl = appConfig.apiUrl + 'counters';

  /*jshint validthis: true */
  var service = this;

  service.active = undefined;
  service.list = undefined;

  /**
   * @returns {Promise}
   *   A promise with a list of available counters for the active user.
   */
  service.getList = function() {
    var deferredList = $q.defer();

    if (service.list !== undefined) {
      deferredList.resolve(service.list);
    } else {
      $http
        .get(apiUrl)
        .success(function(listData) {
          service.list = listData;
          deferredList.resolve(listData);
        })
        .error(function() {
          deferredList.reject('unable to retrieve counters for active user');
        });
    }

    return deferredList.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the active counter for the current user.
   */
  service.getActive = function() {
    var deferredCounter = $q.defer();

    var updateActiveCounter = function(activeCounter) {
      service.active = activeCounter;
      deferredCounter.resolve(activeCounter);
    };

    var suggestActiveCounter = function() {
      service.getList().then(activateOnlyCounter);
    };

    var activateOnlyCounter = function (list) {
      var ids = Object.keys(list);
      if (ids.length === 1) {
        var onlyCounterId = ids[0],
            onlyCounter = list[onlyCounterId];
        service.setActive(onlyCounter);
        deferredCounter.resolve(onlyCounter);
      } else {
        deferredCounter.reject('can\'t activate only counter when there are none or multiple');
      }
    };

    if (service.active !== undefined) {
      deferredCounter.resolve(service.active);
    } else {
      service.getActiveFromServer().then(updateActiveCounter, suggestActiveCounter);
    }

    return deferredCounter.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the active counter for the current user, from the server.
   */
  service.getActiveFromServer = function() {
    var deferred = $q.defer();

    $http
      .get(apiUrl + '/active')
      .success(function(counter) {
        deferred.resolve(counter);
      })
      .error(function() {
        deferred.reject();
      });

    return deferred.promise;
  };

  /**
   * @param {object} activeCounter
   *
   * @returns {Promise}
   *   A promise that the active counter has been set for the current user.
   */
  service.setActive = function(activeCounter) {
    var deferred = $q.defer();

    var setActiveOnServer = service.setActiveOnServer(activeCounter.id);
    var setLastActiveId = service.setLastActiveId(activeCounter.id);

    var failed = function () {
      deferred.reject('something went wrong while activating the counter');
    };

    var updateActiveCounter = function() {
      service.active = activeCounter;
      $rootScope.$emit('activeCounterChanged', activeCounter);
      deferred.resolve();
    };

    $q.all([setActiveOnServer, setLastActiveId]).then(updateActiveCounter, failed);

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise that the active counter has been set for the current user on the server.
   */
  service.setActiveOnServer = function(id) {
    var deferred = $q.defer();

    $http
      .post(apiUrl + '/active', {id: id}, {
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
  service.setLastActiveId = function(id) {
    var deferred = $q.defer();

    service.determineLastActiveCookieKey().then(
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
  service.getLastActiveId = function() {
    var deferred = $q.defer();

    var foundCounterCookieKey = function (cookieKey) {
      var counterId = $cookies.get(cookieKey);

      if (counterId === undefined) {
        noPreviouslyActiveCounter();
      } else {
        deferred.resolve(counterId);
      }
    };

    var noPreviouslyActiveCounter = function () {
      deferred.reject('there is no last active counter');
    };

    service.determineLastActiveCookieKey().then(foundCounterCookieKey, noPreviouslyActiveCounter);

    return deferred.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the cookie key for the last active counter for the current
   *   user.
   */
  service.determineLastActiveCookieKey = function() {
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

  /**
   * @param {Pass} pass
   *   The pass that's going to be registered with the active counter.
   */
  service.getRegistrationPriceInfo = function (pass, passholder, voucherNumber, reason) {
    var url = appConfig.apiUrl + 'uitpas/' + pass.number + '/price',
        parameters = {
          'reason': reason || 'FIRST_CARD'
        },
        config = {
          headers: {},
          params: parameters
        },
        deferredPriceInfo = $q.defer();

    if (voucherNumber) {
      parameters['voucher_number'] = voucherNumber;
    }

    if (passholder.birth.date) {
        parameters['date_of_birth'] = passholder.birth.date.format('YYYY-MM-DD');
    }

    if (passholder.address.postalCode) {
      parameters['postal_code'] = passholder.address.postalCode;
    }

    var resolvePriceInfo = function (responseData) {
      deferredPriceInfo.resolve(responseData.data);
    };

    var handleErrorResponse = function (errorResponse) {
      deferredPriceInfo.reject(errorResponse.data);
    };

    $http
      .get(url, config)
      .then(resolvePriceInfo, handleErrorResponse);

    return deferredPriceInfo.promise;
  };
}
