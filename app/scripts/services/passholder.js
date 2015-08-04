'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.passholder
 * @description
 * # passholder
 * Service in the uitpasbeheerApp.
 */
angular
  .module('uitpasbeheerApp')
  .service('passholderService', passholderService);

/* @ngInject */
function passholderService($q, $http, $cacheFactory, appConfig, Pass) {
  var apiUrl = appConfig.apiUrl;
  var passholderIdCache = $cacheFactory('passholderIdCache');
  var passholderCache = $cacheFactory('passholderCache');

  /*jshint validthis: true */
  var service = this;

  /**
   * @param {string} identification
   *   The identification number. This can be either an UiTPAS number, chip-number, INSZ-number, or INSZ-barcode.
   *
   * @returns {Promise}
   *   A passholder promise.
   */
  service.find = function(identification) {
    var deferredPassholder = $q.defer();

    var passholderId = passholderIdCache.get(identification);

    if (passholderId) {
      deferredPassholder.resolve(passholderCache.get(passholderId));
    } else {
      var passholderRequest = $http.get(apiUrl + 'identities/' + identification,
        {
          withCredentials: true
        });

      var cacheAndResolvePassHolder = function (passData) {
        var pass = new Pass(passData);
        var passholder = pass.passholder;
        passholderIdCache.put(identification, pass.number);
        passholderCache.put(pass.number, passholder);
        deferredPassholder.resolve(passholder);
      };

      var rejectPassHolder = function () {
        deferredPassholder.reject(
          {
            code: 'PASSHOLDER_NOT_FOUND',
            title: 'Not found',
            message: 'Passholder not found for identification number: ' + identification
          }
        );
      };

      passholderRequest.success(cacheAndResolvePassHolder);
      passholderRequest.error(rejectPassHolder);
    }

    return deferredPassholder.promise;
  };

  /**
   * Update the information of a passholder by persisting it on the server and caching it locally
   *
   * @param {object} passholder
   * @param {string} identification
   * @return {Function|promise}
   */
  service.update = function(passholder, identification) {
    var deferredUpdate = $q.defer();
    var passholderId;

    var successUpdatingPassholder = function(passholder) {
      service.updatePassholderInCache(passholder, identification, passholderId);
      console.log(passholder, 'successUpdatingPassholder');
      deferredUpdate.resolve(passholder);
    };
    var errorUpdatingPassholder = function(e) {
      deferredUpdate.reject(e);
    };

    service.updatePassholderOnServer(passholder, identification)
      .then(successUpdatingPassholder, errorUpdatingPassholder);

    return deferredUpdate.promise;
  };

  service.updatePassholderOnServer = function(passholderData, identification) {
    var deferred = $q.defer();

    var successUpdatingPassholderOnServer = function(response) {

      console.log(response, 'right after API call');
      deferred.resolve(response);
    };
    var errorUpdatingPassholderOnServer = function(e) {
      var message = 'The passholder could not be updated on the server';
      if (e.code) {
        message += ': ' + e.code;
      }
      else {
        message += '.';
      }

      deferred.reject({
        code: 'PASSHOLDER_NOT_UPDATED_ON_SERVER',
        title: 'Passholder not updated on server',
        message: message
      });
    };
console.log(passholderData, 'right before API call');
    $http
      .post(
      apiUrl + 'passholders/' + identification,
      passholderData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .success(successUpdatingPassholderOnServer)
      .error(errorUpdatingPassholderOnServer);

    return deferred.promise;
  };

  service.updatePassholderInCache = function(passholderData, identification, passholderId) {
    passholderIdCache.put(identification, passholderId);
    passholderCache.put(passholderId, passholderData);
  };
}
