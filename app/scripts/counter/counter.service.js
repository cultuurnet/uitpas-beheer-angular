'use strict';

/**
 * An error object return by the UiTPAS app API.
 * @typedef {Object} ApiError
 * @property {string} code      - An error code, eg: YOU_BROKE_IT.
 * @property {string} message   - A mostly readable error message.
 * @property {string} exception - The actual exception that occurred.
 * @property {string} type      - The type of the error.
 */

/**
 * Counter membership
 * @typedef {Object} CounterMembership
 * @property {string} uid      - Unique identifier, eg: 465a4sd-5as4df-asd65f4-asd45f6as5d4
 * @property {string} nick     - Member nickname
 * @property {string} role     - Membership role
 */

/**
 * @ngdoc service
 * @name ubr.counter.counterService
 * @description
 * # counterService
 * Service in the ubr.counter module.
 */
angular.module('ubr.counter')
  .service('counterService', counterService);

/* @ngInject */
function counterService($q, $http, $rootScope, $cookies, uitid, appConfig, moment, Counter) {
  var apiUrl = appConfig.apiUrl + 'counters';

  /*jshint validthis: true */
  var service = this;

  service.active = undefined;
  service.list = {};

  /**
   * @returns {Promise}
   *   A promise with a list of available counters for the active user.
   */
  service.getList = function() {
    var deferredList = $q.defer();

    if (Object.keys(service.list).length > 0) {
      deferredList.resolve(service.list);
    } else {
      $http
        .get(apiUrl)
        .success(function(listData) {
          service.list = {};
          angular.forEach(listData, function (jsonCounter, key) {
            service.list[key] = new Counter(jsonCounter);
          });
          deferredList.resolve(service.list);
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
        deferred.resolve(new Counter(counter));
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
   * @param {Passholder} [passholder]
   *   The passholder that's going to be registered with the active counter.
   * @param {string} [voucherNumber]
   *   The voucher number to use with the registration.
   * @param {string} [reason]
   *   The reason of the registration.
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

    if (passholder && passholder.birth.date) {
        parameters['date_of_birth'] = moment(passholder.birth.date).format('YYYY-MM-DD');
    }

    if (passholder && passholder.address.postalCode) {
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

  /**
   * Return a list of memberships for the active counter
   *
   * @return {Promise<CounterMembership[]|ApiError>} A list of memberships or an error response.
   */
  service.getMemberships = function () {
    var url = apiUrl + '/active/members';
    var deferredMembers = $q.defer();

    $http
      .get(url)
      .success(deferredMembers.resolve)
      .error(deferredMembers.reject);

    return deferredMembers.promise;
  };

  /**
   * Add a member with the given email to the active counter
   *
   * @param {string} email
   *
   * @return {Promise.<CounterMembership|ApiError>}
   */
  service.createMembership = function (email) {
    var url = apiUrl + '/active/members';
    var parameters = {
      email: email
    };
    var config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    var deferredMember = $q.defer();

    var returnMember = function (creationResponse) {
      var member = {
        uid: creationResponse.data.uid,
        nick: creationResponse.data.nick,
        role: creationResponse.data.role
      };

      deferredMember.resolve(member);
    };

    var returnError = function (errorResponse) {
      deferredMember.reject(errorResponse.data);
    };

    $http
      .post(url, parameters, config)
      .then(returnMember, returnError);

    return deferredMember.promise;
  };

  /**
   * Delete a member with the given uid from the active counter.
   *
   * @param {string} uid
   *
   * @return {Promise.<null|ApiError>} Resolves with null if successfully deleted or an error
   */
  service.deleteMembership = function (uid) {
    var url = apiUrl + '/active/members/' + uid;
    var deferredResponse = $q.defer();

    var returnError = function (errorResponse) {
      deferredResponse.reject(errorResponse.data);
    };

    $http.delete(url).then(deferredResponse.resolve, returnError);

    return deferredResponse.promise;
  };
}
