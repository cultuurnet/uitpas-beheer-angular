'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.search.controller:ResultsViewerController
 * @description
 * # ResultsViewerController
 * Controller of the ubr.passholder.search module.
 */
angular
  .module('ubr.passholder.search')
  .controller('ResultsViewerController', ResultsViewerController);

/* @ngInject */
function ResultsViewerController (advancedSearchService, $rootScope, $scope, $state, SearchParameters, UiTPASRouter) {
  /*jshint validthis: true */
  var controller = this;
  controller.activePage = 1;
  controller.loading = true;

  /** @type {PassholderSearchResults} */
  controller.results = null;

  controller.hasDefaultParameters = function () {
    var searchParameters = new SearchParameters();
    searchParameters.fromParams($state.params);
    return searchParameters.hasDefaultParameters();
  };

  if (controller.hasDefaultParameters()) {
    controller.loading = false;
  }

  controller.noSearchDone = function () {
    return !controller.results && controller.hasDefaultParameters();
  };

  controller.isShowingResults = function () {
    var results = controller.results;
    var showResults = false;

    if (results && results.totalItems !== 0) {
      showResults = !results.hasUnknownNumbers() || results.hasConfirmedUnknownNumbers();
    }

    if (!results && !controller.hasDefaultParameters()) {
      showResults = true;
    }

    return showResults;
  };

  /**
   * Update the active page
   *   When called with a number parameter, update the active page
   *   When called without parameters, trigger a search for the active page
   *
   * @param {int} [pageNumber]
   */
  controller.updateActivePage = function (pageNumber) {
    if (typeof pageNumber === 'number') {
      controller.activePage = pageNumber;
    } else {
      advancedSearchService.goToPage(controller.activePage);
    }
  };

  /**
   * @param {Object} event
   * @param {PassholderSearchResults} searchResults
   */
  controller.updateResults = function (event, searchResults) {
    controller.results = searchResults;
    controller.updateActivePage(searchResults.page);
    controller.loading = false;
  };

  /**
   * @param {String} identification
   */
  controller.showPassholderDetails = function (identification) {
    UiTPASRouter.go(identification);
  };

  var lastSearchParameters = null;
  /**
   * Call this when search results are pending
   */
  controller.finding = function (event, searchParameters) {
    if (lastSearchParameters && !searchParameters.yieldsSameResultSetAs(lastSearchParameters)) {
      controller.results = null;
    }

    controller.loading = true;

    lastSearchParameters = searchParameters;
  };

  var searchResultsListener = $rootScope.$on('passholdersFound', controller.updateResults);
  var searchListener = $rootScope.$on('findingPassholders', controller.finding);

  $scope.$on('$destroy', searchResultsListener);
  $scope.$on('$destroy', searchListener);
}
