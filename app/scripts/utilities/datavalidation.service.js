'use strict';

/**
 * @ngdoc service
 * @name ubr.utilities.datavalidation
 * @description
 * # uitid
 * Service in the ubr.utilities module.
 */
angular
  .module('ubr.utilities')
  .service('dataValidation', dataValidationService);

/* @ngInject */
function dataValidationService($q, $window, $http, appConfig, $cacheFactory) {
  var apiUrl = appConfig.apiUrl + 'datavalidation';

  var emailValidationCache = $cacheFactory('emailValidationCache');

  /*jshint validthis: true */
  var dataValidation = this;

  /**
   * @returns {Promise}
   *   A promise with the email validation result
   */
  dataValidation.validateEmail = function(email) {
    var deferredValidation = $q.defer();
    var validationResult = emailValidationCache.get(email);

    if (validationResult) {
      deferredValidation.resolve(validationResult);
    } else {
      var validationRequest = $http.get(apiUrl + '/email', {
          params: {email: email}
      });

      var cacheAndResolveEmailValidation = function (response) {
        var validationResult = response.data;
        emailValidationCache.put(email, validationResult);
        deferredValidation.resolve(response.data);
      };

      var rejectValidation = function () {
        var error = {
          status: response.status,
          message: response.data.message
        };
        deferredValidation.reject(error);
      };

      validationRequest.then(cacheAndResolveEmailValidation, rejectValidation);
    }

    return deferredValidation.promise;
  };
}
