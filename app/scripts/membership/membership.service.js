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
function membershipService($q, $http, appConfig, $filter) {
  var apiUrl = appConfig.apiUrl;

  /*jshint validthis: true */
  var service = this;

  service.path = function (cardNumber, subPath) {
    return apiUrl + 'passholders/' + cardNumber + '/' + subPath;
  };

  service.list = function (cardNumber) {
    var deferredList = $q.defer();

    var listRequest = $http.get(this.path(cardNumber, 'profile'));

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

  service.stop = function (cardNumber, associationId) {
    var deferred = $q.defer();

    // 'delete' is a JavaScript keyword and IE8 parses it as such, even when
    // called as a method, so we can not use $http.delete() here and instead
    // need to use its full form.
    var request = $http({
      method: 'DELETE',
      url: this.path(cardNumber, 'profile/memberships/' + associationId)
    });

    request
      .success(function (data) {
        deferred.resolve(data);
      })
      .error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };


  service.register = function (cardNumber, associationId, endDate) {
    var deferred = $q.defer();

    var requestData = {
      associationId: associationId
    };

    if (!endDate.fixed) {
      requestData.endDate = $filter('date')(endDate.date, 'yyyy-MM-dd');
    }

    var request = $http.post(
      this.path(cardNumber, 'profile/memberships'),
      requestData
    );

    request
      .success(function (data) {
        deferred.resolve(data);
      })
      .error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };
}
