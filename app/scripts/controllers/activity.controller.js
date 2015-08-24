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
function ActivityController (passholder, activityService, DateRange) {
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

  controller.getActivityTariff = function (activity) {
    var tariff = null;

    if (activity.free) {
      tariff = 'free';
    }
    else if (((activity || {}).sales || {}).maximumReached) {
      tariff = 'maximumReached';
    }
    else if (((activity || {}).sales || {}).differentiation) {
      tariff = 'priceDifferentiation';
    }
    else if ((((activity || {}).sales || {}).tariffs || {}).kansentariefAvailable) {
      tariff = 'kansenTariff';
    }
    else if ((((activity || {}).sales || {}).tariffs || {}).couponAvailable) {
      tariff = 'coupon';
    }

    activity.tariff = tariff;
    return tariff;
  };

  controller.getTariffCoupon = function(tariffs) {
    var tariffCoupon = false;
    angular.forEach(tariffs.list, function (tariff) {
      if (tariff.type !== 'KANSENTARIEF') {
        tariffCoupon = tariff;

        tariffCoupon.price = Object.keys(tariff.prices)[0];
      }
    });

    return tariffCoupon;
  };

  controller.claimTariff = function (tariff, activity) {
    activity.tariffClaimInProgress = true;
    var tariffClaimedSuccessfully = function () {
      activity.tariffClaimInProgress = false;
      tariff.assigned = true;
    };

    var tariffNotClaimed = function (error) {
      tariff.assignError = error;
    };

    activityService.claimTariff(passholder, activity, tariff).then(
      tariffClaimedSuccessfully,
      tariffNotClaimed
    );
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

    activityService.checkin(activity, passholder).then(updateActivity, checkinError);
  };
}
