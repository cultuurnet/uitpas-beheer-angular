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
  controller.activitiesLoaded = false;

  function getSearchParameters () {
    return {
      query: controller.query,
      dateRange: controller.dateRange,
      page: controller.page,
      limit: controller.limit
    };
  }

  // keep track of the last used search parameters to check if the active page should be reset
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
      controller.activitiesLoaded = true;
    };

    controller.activitiesLoaded = false;
    activityService
      .search(passholder, searchParameters)
      .then(showSearchResults);
  };

  // Do an initial search to populate the activity list.
  controller.search();

  controller.getActivityTariff = function (activity) {
    if (activity.free) {
      activity.tariff = 'free';
      return 'free';
    }
    else if (((activity || {}).sales || {}).maximumReached) {
      activity.tariff = 'maximumreached';
      return 'maximumReached';
    }
    else if (((activity || {}).sales || {}).differentiation) {
      activity.tariff = 'priceDifferentiation';
      return 'priceDifferentiation';
    }
    else if ((((activity || {}).sales || {}).tariffs || {}).kansentariefAvailable) {
      activity.tariff = 'kansenTariff';
      return 'kansenTariff';
    }
    else if ((((activity || {}).sales || {}).tariffs || {}).couponAvailable) {
      activity.tariff = 'coupon';
      return 'coupon';
    }
  };

  controller.claimTariff = function (tariff, activity) {
    var tariffClaimedSuccessfully = function () {
      tariff.assigned = true;
    };

    var tariffNotClaimed= function (error) {
      tariff.assignError = error;
    };

    activityService.claimTariff(passholder, activity, tariff).then(
      tariffClaimedSuccessfully,
      tariffNotClaimed
    );
  };
}
