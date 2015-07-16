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
function passholderService($q, $http, $cacheFactory, appConfig) {
  var apiUrl = appConfig.apiUrl + 'passholders';
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
      var passholderRequest = $http.get(apiUrl + '/' + identification);

      var cacheAndResolvePassHolder = function (passholderData) {
        try {
          passholderId = identifyPassHolder(passholderData);
        } catch (e) {
          deferredPassholder.reject(e);
        }

        passholderData.dateOfBirth = new Date(passholderData.dateOfBirth * 1000);
        service.updatePassholderInCache(passholderData, identification, passholderId);
        deferredPassholder.resolve(passholderData);
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

  service.update = function(passholderData, identification) {
    var deferredUpdate = $q.defer();
    var passholderId;

    try {
      passholderId = identifyPassHolder(passholderData);
    } catch (e) {
      deferredUpdate.reject(e);
    }

    var successUpdatingPassholder = function(updatedPassholder) {
      service.updatePassholderInCache(updatedPassholder, identification, passholderId);
      deferredUpdate.resolve(updatedPassholder);
    };
    var errorUpdatingPassholder = function(e) {
      deferredUpdate.reject(e);
    };

    service.updatePassholderOnServer(passholderData, identification).then(successUpdatingPassholder, errorUpdatingPassholder);

    return deferredUpdate.promise;
  };

  /**
   * Checks passholder data for a unique identifier
   *
   * @param {object} passholderData
   * @return {string}
   */
  function identifyPassHolder(passholderData) {
    if (((passholderData || {}).uitIdUser || {}).id) {
      return passholderData.uitIdUser.id;
    } else {
      throw {
        code: 'PASSHOLDER_NOT_IDENTIFIED',
        title: 'Not identified',
        message: 'Unable to identify the given passholder data'
      };
    }
  }

  service.updatePassholderOnServer = function(passholderData, identification) {
    var deferred = $q.defer();

    var successUpdatingPassholderOnServer = function(updatedPassholder) {
      console.log('successUpdatingPassholder', updatedPassholder);
      deferred.resolve(updatedPassholder);
    };
    var errorUpdatingPassholderOnServer = function(e) {
      console.log('errorUpdatingPassholder', e);
      deferred.reject({
        code: 'PASSHOLDER_NOT_UPDATED_ON_SERVER',
        title: 'Passholder not updated on server',
        message: 'The passholder could not be updated on the server.'
      });
    };

    $http
      .post(
        apiUrl + '/' + identification,
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
