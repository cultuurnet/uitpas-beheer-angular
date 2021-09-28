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
function ActivitiesController(activitiesService, counterService, DateRange, moment, appConfig, isJavaFXBrowser) {
  /*jshint validthis: true */
  var controller = this;
  var yesterday = moment().subtract(1, 'day');

  function removeDoubleSlash(url) {
    return url.replace(/([^:]\/)\/+/g, "$1");
  }

  // Set default parameters.
  controller.apiUrl = removeDoubleSlash(appConfig.apiUrl + '/checkincodes/');
  controller.uivUrl = removeDoubleSlash(appConfig.uivUrl + '/agenda/e/e/');
  controller.udbUrl = removeDoubleSlash(appConfig.udbUrl + '/event/:id/edit');
  controller.query = '';
  controller.page = 1;
  controller.limit = 5;
  controller.sort = 'permanent desc,periods desc,availableto asc';
  controller.activities = [];
  controller.dateRanges = angular.copy(DateRange);
  controller.dateRange = controller.dateRanges.NEXT_12_MONTHS;
  controller.chooseDateStart = null;
  controller.chooseDateEnd = null;
  controller.totalActivities = 0;
  controller.activitiesLoading = false;
  controller.hideDateRange = false;

  var setActiveCounter = function (counter) {
    controller.activeCounter = counter;
  };

  counterService.getActive().then(setActiveCounter);

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

    // Add specific sorting for past date ranges.
    if (controller.dateRange.value === 'past') {
      searchParameters.sort = 'permanent desc,availableto desc';
    } else if (!controller.dateRange.value || controller.dateRange.value === 'choose_date') {
      searchParameters.sort = 'permanent desc,availableto asc';
    }

    var showResult = function (pagedActivities) {
      controller.activities = pagedActivities.activities;
      controller.totalActivities = pagedActivities.totalActivities;
      controller.activitiesLoading = false;
    };

    var fetchFailed = function () {
      controller.activitiesLoading = false;
    };
    controller.activitiesLoading = true;
    activitiesService.getActivities(searchParameters).then(showResult, fetchFailed);
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

  controller.goTo = function (e, url) {
    if (isJavaFXBrowser) {
      e.preventDefault();
      alert('EXTERNAL:' + url);
    }
  };
}
