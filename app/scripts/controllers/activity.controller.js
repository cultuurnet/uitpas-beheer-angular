'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:ActivityController
 * @description
 * # ActivityController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('ActivityController', ActivityController);

/* @ngInject */
function ActivityController (passholder, activityService, DateRange, $rootScope) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.query = '';
  controller.page = 1;
  controller.limit = 5;
  controller.activities = [];
  controller.dateRanges = angular.copy(DateRange);
  controller.dateRange = controller.dateRanges.TODAY;
  controller.totalActivities = 0;
  controller.activitiesLoading = 0;

  function getSearchParameters () {
    return {
      query: controller.query,
      dateRange: controller.dateRange,
      page: controller.page,
      limit: controller.limit
    };
  }

  // Keep track of the last used search parameters to check if the active page should be reset.
  var lastSearchParameters = getSearchParameters();

  /**
   * Update the active date range and trigger a search parameter change if a new range is selected.
   *
   * @param {DateRange} dateRange
   */
  controller.updateDateRange = function (dateRange) {
    if (!angular.equals(controller.dateRange, dateRange)) {
      controller.dateRange = dateRange;
      controller.searchParametersChanged();
    }
  };

  controller.searchParametersChanged = function () {
    var newSearchParameters = getSearchParameters();

    function queryChanged() {
      return lastSearchParameters.query !== newSearchParameters.query;
    }

    function dateRangeChanged() {
      return lastSearchParameters.dateRange !== newSearchParameters.dateRange;
    }

    function resetActivePage() {
      newSearchParameters.page = 1;
      controller.page = 1;
    }

    if (queryChanged() || dateRangeChanged()) {
      resetActivePage();
    }

    lastSearchParameters = newSearchParameters;
    controller.search();
  };

  controller.search = function () {
    var searchParameters = getSearchParameters();

    var showSearchResults = function (pagedActivities) {
      controller.activities = pagedActivities.activities;
      controller.totalActivities = pagedActivities.totalActivities;
      --controller.activitiesLoading;
    };

    var searchingFailed = function () {
      --controller.activitiesLoading;
    };

    ++controller.activitiesLoading;
    activityService
      .search(passholder, searchParameters)
      .then(showSearchResults, searchingFailed);
  };

  // Do an initial search to populate the activity list.
  controller.search();

  controller.getTariffCoupon = function(tariffs) {
    var tariffCoupon = false;
    angular.forEach(tariffs.list, function (tariff) {
      if (tariff.type !== 'KANSENTARIEF') {
        tariffCoupon = tariff;
      }
    });

    return tariffCoupon;
  };

  controller.claimTariff = function (tariff, activity) {
    activity.tariffClaimInProgress = true;

    tariff.price = Object.keys(tariff.prices)[0];

    var tariffClaimedSuccessfully = function () {
      activity.sales.maximumReached = true;
      activity.tariffClaimInProgress = false;
    };

    var tariffNotClaimed = function (error) {
      activity.tariffClaimError = error;
      activity.tariffClaimInProgress = false;
    };

    activityService
      .claimTariff(passholder, activity, tariff)
      .then(tariffClaimedSuccessfully, tariffNotClaimed);
  };

  controller.checkin = function (activity) {
    activity.checkinBusy = true;

    function updateActivity(newActivity) {
      controller.activities = controller.activities.map(function (activity) {
        if (activity.id === newActivity.id) {
          activity = newActivity;
          activity.checkinConstraint.reason = 'MAXIMUM_REACHED';
          activity.checkinBusy = false;
        }
        return activity;
      });
    }

    function checkinError() {
      controller.activities = controller.activities.map(function (existingActivity) {
        if (existingActivity.id === activity.id) {
          existingActivity.checkinBusy = false;
          existingActivity.checkinFailed = true;
        }
        return existingActivity;
      });
    }

    activityService
      .checkin(activity, passholder)
      .then(updateActivity, checkinError);
  };

  function updateClaimedTariffActivity() {
    controller.search();
  }

  $rootScope.$on('activityTariffClaimed', updateClaimedTariffActivity);
}
