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
function ResultsViewerController (advancedSearchService, $rootScope, $scope, $state) {
  /*jshint validthis: true */
  var controller = this;
  controller.activePage = 1;
  controller.loading = false;

  /** @type {PassholderSearchResults} */
  controller.results = null;

  controller.noSearchDone = function () {
    return !controller.results;
  };

  controller.isShowingResults = function () {
    var results = controller.results;
    var showResults = false;
    if (results && results.totalItems !== 0) {
      showResults = !results.hasUnknownNumbers() || results.hasConfirmedUnknownNumbers();
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
    controller.loading = false;
  };

  /**
   * @param {String} identification
   */
  controller.showPassholderDetails = function (identification) {
    $state.go('counter.main.passholder', {identification: identification});
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
