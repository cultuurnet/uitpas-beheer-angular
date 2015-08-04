'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.advantage
 * @description
 * # advantage
 * Service in the uitpasbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .service('advantageService', advantageService);

/* @ngInject */
function advantageService($q, $http, $rootScope, $cacheFactory, appConfig) {
  var apiUrl = appConfig.apiUrl + 'passholders';
  var advantageCache = $cacheFactory('advantageCache');

  /*jshint validthis: true */
  var service = this;

  service.list = function(passholderIdentification) {
    var deferredAdvantages = $q.defer();

    var advantagesRequest = $http.get(apiUrl + '/' + passholderIdentification + '/advantages');

    var successGettingAdvantages = function(advantagesData) {
      deferredAdvantages.resolve(advantagesData);
    };

    var errorGettingAdvantages = function() {
      deferredAdvantages.reject(
        {
          code: 'ADVANTAGES_NOT_FOUND',
          title: 'Advantages not found',
          message: 'No advantages found for passholder with identification number: ' + passholderIdentification
        }
      );
    };

    advantagesRequest.success(successGettingAdvantages);
    advantagesRequest.error(errorGettingAdvantages);

    return deferredAdvantages.promise;
  };

  service.find = function(passholderIdentification, advantageId) {
    var deferredAdvantage = $q.defer();

    var advantageFromCache = advantageCache.get(advantageId);

    if (advantageFromCache) {
      deferredAdvantage.resolve(advantageFromCache);
    } else {
      var advantageRequest = $http.get(apiUrl + '/' + passholderIdentification + '/advantages/' + advantageId);

      var successGettingAdvantage = function(advantageData) {
        advantageCache.put(advantageId, advantageData);
        deferredAdvantage.resolve(advantageData);
      };

      var errorGettingAdvantage = function() {
        deferredAdvantage.reject(
          {
            code: 'ADVANTAGE_NOT_FOUND',
            title: 'Advantage not found',
            message: 'No advantage with id ' + advantageId + ' found for passholder with identification number: ' + passholderIdentification
          }
        );
      };

      advantageRequest.success(successGettingAdvantage);
      advantageRequest.error(errorGettingAdvantage);
    }

    return deferredAdvantage.promise;
  };

  service.exchange = function(advantageId, passNumber) {
    var deferredExchange = $q.defer();

    var exchangeData = {
      id: advantageId
    };

    var exchangeRequest = $http.post(
      apiUrl + '/' + passNumber + '/advantages/exchanges',
      exchangeData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      });

    var exchangeFailed = function (error) {
      deferredExchange.reject(error);
    };

    var advantageExchanged = function (updatedAdvantage) {
      $rootScope.$emit('advantageExchanged', updatedAdvantage);
      deferredExchange.resolve(updatedAdvantage);
    };

    exchangeRequest
      .success(advantageExchanged)
      .error(exchangeFailed);

    return deferredExchange.promise;
  };
}
