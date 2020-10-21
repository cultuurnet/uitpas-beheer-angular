'use strict';

/**
 * @ngdoc function
 * @name ubr.counter.activities.controller:ActivitiesController
 * @description
 * # ActivitiesController
 * Controller of the ubr counter activities module.
 */
angular
  .module('ubr.counter.activities')
  .controller('ActivitiesController', ActivitiesController);

/* @ngInject */
function ActivitiesController($http, activitiesService, DateRange) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.query = '';
  controller.page = 1;
  controller.limit = 5;
  controller.sort = 'permanent asc';
  controller.activities = [];
  controller.dateRanges = angular.copy(DateRange);
  controller.dateRange = controller.dateRanges.ALL;
  controller.chooseDateStart = null;
  controller.chooseDateEnd = null;
  controller.totalActivities = 0;
  controller.activitiesLoading = 0;
  controller.hideDateRange = false;

  function getSearchParameters() {
    var searchParameters = {
      query: controller.query,
      dateRange: controller.dateRange,
      page: controller.page,
      limit: controller.limit,
      sort: controller.sort,
      startDate: '',
      endDate: ''
    };

    if (controller.dateRange === controller.dateRanges.CHOOSE_DATE) {
      if (controller.chooseDateStart !== null) {
        searchParameters.startDate = Math.floor(controller.chooseDateStart.getTime() / 1000);
      }

      if (controller.chooseDateEnd !== null) {
        searchParameters.endDate = Math.floor(controller.chooseDateEnd.getTime() / 1000);
      }
    }

    return searchParameters;
  }

  // Keep track of the last used search parameters to check if the active page should be reset.
  var lastSearchParameters = getSearchParameters();

  controller.getActivities = function () {
    var searchParameters = getSearchParameters();

    var showResult = function (pagedActivities) {
      controller.activities = pagedActivities.activities;
      controller.totalActivities = pagedActivities.totalActivities;
      --controller.activitiesLoading;
    };

    var fetchFailed = function () {
      --controller.activitiesLoading;
    };
    ++controller.activitiesLoading;
    activitiesService.getActivities(searchParameters).then(showResult, fetchFailed);
  };

  controller.downloadQRCode = function (activity) {
    // TODO: generate QR code here
    console.log('downloading QR code for activity: \"', activity.title, '\"');
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
    controller.getActivities();
  };

  controller.updateDateRange = function (dateRange) {
    if (!angular.equals(controller.dateRange, dateRange)) {
      controller.dateRange = dateRange;

      // Do not refresh search results when "choose date" option is selected.
      if (!angular.equals(controller.dateRanges.CHOOSE_DATE, dateRange)) {
        controller.searchParametersChanged();
      }
    }
  };

  controller.resetSearchQuery = function () {
    controller.query = '';
    controller.searchParametersChanged();
  };

  // initial fetch
  controller.getActivities();
}
