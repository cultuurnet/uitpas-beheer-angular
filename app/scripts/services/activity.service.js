'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.activityService
 * @description
 * # Activity service
 * Service in the uitpasbeheerApp.
 */
angular
  .module('uitpasbeheerApp')
  .service('activityService', activityService);

/* @ngInject */
function activityService($q, $http, $rootScope, appConfig, Activity) {
  var apiUrl = appConfig.apiUrl;

  /*jshint validthis: true */
  var service = this;

  /**
   * Search for a list of activities based on a list of query parameters for a given passholder
   *
   * @param {Passholder} passholder
   * @param {object}     searchParameters
   *
   * @returns {Promise}
   *   A list of activities.
   */
  service.search = function(passholder, searchParameters) {
    var deferredActivities = $q.defer();

    /*jshint camelcase: false */
    var requestParameters = {
      query: searchParameters.query,
      date_type: searchParameters.dateRange.value,
      page: searchParameters.page,
      limit: searchParameters.limit
    };

    var searchRequest = $http.get(
        apiUrl + 'passholders/' + passholder.passNumber + '/activities',
        {
          withCredentials: true,
          params: requestParameters
        });

    var handlePagedActivityResults = function (activityData) {
      var pagedResults = {
        activities: [],
        totalActivities: activityData.totalItems
      };

      if (activityData.member) {
        activityData.member.forEach(function (jsonActivity) {
          pagedResults.activities.push(new Activity(jsonActivity));
        });
      }

      deferredActivities.resolve(pagedResults);
    };

    var rejectSearch = function (error) {
      deferredActivities.reject(error);
    };

    searchRequest.success(handlePagedActivityResults);
    searchRequest.error(rejectSearch);

    return deferredActivities.promise;
  };

  service.claimTariff = function(passholder, activity, tariff) {
    var deferredClaim = $q.defer();

    var successfullClaim = function () {
      deferredClaim.resolve();
    };

    var failedClaim = function () {
      deferredClaim.reject({
        code: 'TARIFF_NOT_CLAIMED',
        title: 'Tarief niet toegekend',
        message: 'Het geselecteerde tarief voor activiteit "' + activity.title + '" kon niet worden toegekend voor ' + passholder.name.first + ' ' + passholder.name.last
      });
    };

    var claimParameters = {
      activityId: activity.id,
      priceClass: tariff.price
    };
    if (tariff.type === 'COUPON') {
      claimParameters.tariffId = tariff.id;
    }

    var claimRequest = $http.post(
      apiUrl + 'passholders/' + passholder.passNumber + '/activities/ticket-sales',
      claimParameters,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    claimRequest
      .success(successfullClaim)
      .error(failedClaim);

    return deferredClaim.promise;
  };

  service.checkin = function(activity, passholder) {
    var deferredCheckin = $q.defer();

    var checkinRequest = $http.post(
      apiUrl + 'passholders/' + passholder.passNumber + '/activities/checkins',
      {
        eventCdbid: activity.id
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    var checkinAccepted = function (jsonActivity) {
      var checkedInActivity = new Activity(jsonActivity);
      deferredCheckin.resolve(checkedInActivity);
      $rootScope.$emit('activityCheckedIn', checkedInActivity);
    };

    var checkinRejected = function () {
      deferredCheckin.reject({
        code: 'CHECKIN_FAILED',
        title: 'Punten sparen mislukt',
        message: 'Het sparen van punt(en) voor ' + activity.title + ' is niet gelukt.'
      });
    };

    checkinRequest.success(checkinAccepted);
    checkinRequest.error(checkinRejected);

    return deferredCheckin.promise;
  };
}
