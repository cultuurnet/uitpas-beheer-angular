'use strict';

angular
  .module('ubr.counter.activities')
  .service('activitiesService', activitiesService);

/* @ngInject */
function activitiesService($q, $http, appConfig, Activity) {
  var apiUrl = appConfig.apiUrl;

  /*jshint validthis: true */
  var service = this;

  /**
   * Search for a list of activities based on a list of query parameters.
   * When query parameters aren't given, return a list of all activities for the current counter.
   *
   * @param {object}     searchParameters
   *
   * @returns {Promise}
   *   A list of activities.
   */
  service.getActivities = function (searchParameters ) {
    var deferredActivities = $q.defer();

    /*jshint camelcase: false */
    var requestParameters = {
      page: searchParameters.page,
      limit: searchParameters.limit,
      sort: searchParameters.sort,
      query: searchParameters.query,
      date_type: searchParameters.dateRange.value,
    };

    if (searchParameters.date_type !== 'today' ){//&& searchParameters.query !== prevSearch){
      requestParameters.startDate = searchParameters.startDate;
      requestParameters.endDate = searchParameters.endDate;
    }

    var request = $http.get(
      apiUrl + 'counters/active/activities',
      {
        withCredentials: true,
        params: requestParameters
      });

    var handleResult = function (activityData) {
      var pagedResult = {
        activities: [],
        totalActivities: activityData.totalItems
      };

      if (activityData.member) {
        activityData.member.forEach(function (jsonActivity) {
          pagedResult.activities.push(new Activity(jsonActivity));
        });
      }
      deferredActivities.resolve(pagedResult);
    };

    var rejectResult = function (error) {
      deferredActivities.reject(error);
    };

    request.success(handleResult);
    request.error(rejectResult);

    return deferredActivities.promise;
  };
}
