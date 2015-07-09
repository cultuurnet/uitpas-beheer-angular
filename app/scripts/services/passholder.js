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
      var passholderRequest = $http.get(apiUrl,
        {
          withCredentials: true,
          params: {
            identification: identification
          }
        });

      var cacheAndResolvePassHolder = function (passholderData) {
        try {
          passholderId = identifyPassHolder(passholderData);
        } catch (e) {
          deferredPassholder.reject(e);
        }

        passholderIdCache.put(identification, passholderId);
        passholderCache.put(passholderId, passholderData);
        deferredPassholder.resolve(passholderData);
      };

      var rejectPassHolder = function () {
        deferredPassholder.reject('passholder not found for identification number: ' + identification);
      };

      passholderRequest.success(cacheAndResolvePassHolder);
      passholderRequest.error(rejectPassHolder);
    }

    return deferredPassholder.promise;
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
      throw 'can\'t identify passholder data returned from server';
    }
  }
}
