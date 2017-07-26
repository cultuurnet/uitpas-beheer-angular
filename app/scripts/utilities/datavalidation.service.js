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
function dataValidationService($q, $window, $http, appConfig) {
  var apiUrl = appConfig.apiUrl + 'datavalidation';

  /*jshint validthis: true */
  var dataValidation = this;

  /**
   * @returns {Promise}
   *   A promise with the email validation result
   */
  dataValidation.validateEmail = function(email) {
    var deferredValidation = $q.defer();

    $http
        .get(apiUrl + '/email', {
            params: { email: email }
        }).then(function success(response) {
          deferredValidation.resolve(response.data);
        }, function error(response){
          deferredValidation.reject({
              status: response.status,
              message: response.data.message
          });
        });

    return deferredValidation.promise;
  };
}
