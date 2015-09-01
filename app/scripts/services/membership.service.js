'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.membershipService
 * @description
 * # membershipService
 * Service in the uitpasbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .service('membershipService', membershipService);

/* @ngInject */
function membershipService($q, $http, appConfig) {
  var apiUrl = appConfig.apiUrl;

  /*jshint validthis: true */
  var service = this;

  service.list = function (cardNumber) {
    var deferredList = $q.defer();

    var listRequest = $http.get(apiUrl + 'uitpas/' + cardNumber + '/profile');

    var successGettingList = function(data) {
      deferredList.resolve(data);
    };

    var errorGettingList = function() {
      deferredList.reject();
    };

    listRequest.success(successGettingList);
    listRequest.error(errorGettingList);

    return deferredList.promise;
  };
}
