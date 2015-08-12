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
function passholderService($q, $http, $cacheFactory, appConfig, Pass, $rootScope) {
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
    var deferred = $q.defer();

    var successUpdatingPassholderOnServer = function(passholderData) {
      service.find(identification).then(function (cachedPassholder) {
        cachedPassholder.parseJson(passholderData);
        deferred.resolve(cachedPassholder);
      });

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
        message: message,
        apiError: e
      });
    };

    $http
      .post(
      apiUrl + 'passholders/' + identification,
      passholder,
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

  service.updatePoints = function(event, exchangedAdvantage, passNumber) {
    service.find(passNumber).then(function (cachedPassholder) {
      var newPointCount = cachedPassholder.points - exchangedAdvantage.points;

      if (newPointCount < 0) {
        newPointCount = 0;
      }

      cachedPassholder.points = newPointCount;
    });
  };

  $rootScope.$on('advantageExchanged', service.updatePoints);
}
