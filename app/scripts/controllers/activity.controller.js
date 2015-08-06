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
  controller.dateRanges = Object.keys(DateRange).reduce(function(rangeList, range) {
    rangeList.push(DateRange[range]);
    return rangeList;
  }, []);
  controller.dateRange = controller.dateRanges[0];
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

  // do an initial search to populate the activity list
  controller.search();
}
