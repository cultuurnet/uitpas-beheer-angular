'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.passHolder
 * @description
 * # passHolder
 * Service in the uitpasbeheerApp.
 */
angular
  .module('uitpasbeheerApp')
  .service('passHolderService', passHolderService);

/* @ngInject */
function passHolderService($q, $http, $cacheFactory, appConfig) {
  var apiUrl = appConfig.apiUrl + 'passholder';
  var passHolderIdCache = $cacheFactory('passHolderIdCache');
  var passHolderCache = $cacheFactory('passHolderCache');

  /**
   * @param {string} identification
   *   The identification number. This can be either an UiTPAS number, chip-number, INSZ-number, or INSZ-barcode.
   *
   * @returns {Promise}
   *   A passHolder promise.
   */
  this.find = function(identification) {
    var deferredPassHolder = $q.defer();

    var passHolderId = passHolderIdCache.get(identification);

    if (passHolderId) {
      deferredPassHolder.resolve(passHolderCache.get(passHolderId));
    } else {
      var passHolderRequest = $http.post(
        apiUrl + '/find',
        {'identification': identification},
        {withCredentials: true}
      );

      var cacheAndResolePassHolder = function (passHolderData) {
        try {
          passHolderId = identifyPassHolder(passHolderData);
        } catch (e) {
          deferredPassHolder.reject(e.message);
        }

        passHolderIdCache.put(identification, passHolderId);
        passHolderCache.put(passHolderId, passHolderData);
        deferredPassHolder.resolve(passHolderData);
      };

      var rejectPassHolder = function () {
        deferredPassHolder.reject('pass holder not found for identification number: ' + identification);
      };

      passHolderRequest.success(cacheAndResolePassHolder);
      passHolderRequest.error(rejectPassHolder);
    }

    return deferredPassHolder.promise;
  };

  /**
   * Checks pass holder data for a unique identifier
   *
   * @param {object} passHolderData
   * @return {string}
   */
  function identifyPassHolder(passHolderData) {
    if (((passHolderData || {}).uitIdUser || {}).id) {
      return passHolderData.uitIdUser.id;
    } else {
      throw 'can\'t identify pass holder data returned from server';
    }
  }
}
