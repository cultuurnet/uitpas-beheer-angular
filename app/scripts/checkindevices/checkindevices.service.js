'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.advantage
 * @description
 * # advantage
 * Service in the uitpasbeheerApp.
 */
angular.module('ubr.checkindevices')
  .service('CheckInDevices', CheckInDevices);

/* @ngInject */
function CheckInDevices($q, $http, $rootScope, appConfig) {
  var apiUrl = appConfig.apiUrl + 'checkindevices';

  /*jshint validthis: true */
  var service = this;

  service.list = function() {
    var deferredList = $q.defer();

    var request = $http.get(apiUrl);

    var successGettingDevices = function(devices) {
      deferredList.resolve(devices);
    };

    var errorGettingDevices = function() {
      deferredList.reject();
    };

    request.success(successGettingDevices);
    request.error(errorGettingDevices);

    return deferredList.promise;
  };

  service.activities = function() {
    var deferredList = $q.defer();

    var request = $http.get(apiUrl + '/activities');

    var successGettingActivities = function(activities) {
      deferredList.resolve(activities);
    };

    var errorGettingActivities = function() {
      deferredList.reject();
    };

    request.success(successGettingActivities);
    request.error(errorGettingActivities);

    return deferredList.promise;
  };

  service.connectDeviceToActivity = function(deviceId, activityId) {
    var deferred = $q.defer();

    if (typeof activityId === 'undefined') {
      activityId = null;
    }

    var request = $http.post(
      apiUrl + '/' + deviceId,
      {
        'activityId': activityId
      }
    );

    request.success(deferred.resolve);
    request.error(deferred.reject);

    return deferred.promise;
  };
}
