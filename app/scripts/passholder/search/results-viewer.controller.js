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
function ResultsViewerController (advancedSearchService, $rootScope, $scope, $state, SearchParameters, UiTPASRouter, BulkSelection, PassholderSearchResults) {
  function getSearchParametersFromState() {
    var params = new SearchParameters();
    params.fromParams($state.params);

    return params;
  }

  /*jshint validthis: true */
  var controller = this;
  controller.activePage = 1;
  controller.loading = true;
  /** @type {PassholderSearchResults} */
  controller.results = new PassholderSearchResults();
  controller.searchParameters = getSearchParametersFromState();
  controller.bulk = {
    action: 'export',
    submitBusy: false,
    selection: new BulkSelection(controller.results, controller.searchParameters)
  };

  controller.hasDefaultParameters = function () {
    var searchParameters = getSearchParametersFromState();
    return searchParameters.hasDefaultParameters();
  };

  if (controller.hasDefaultParameters()) {
    controller.loading = false;
  }

  controller.noSearchDone = function () {
    return (controller.results.totalItems === 0 && controller.hasDefaultParameters());
  };

  controller.isShowingResults = function () {
    var results = controller.results;
    var showResults = false;

    if (results && results.totalItems !== 0) {
      showResults = !results.hasUnknownNumbers() || results.hasConfirmedUnknownNumbers();
    }

    if (results.totalItems === 0 && !controller.hasDefaultParameters()) {
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
    // Update the search results in the bulk selection object.
    controller.bulk.selection.updateSearchResults(searchResults);
    controller.loading = false;
  };

  /**
   * Watch the click action for the select all checkbox.
   */
  controller.bulkSelectAll = function () {
    // Clear the selection if the checkbox is deselected.
    if (controller.bulk.selection.selectAll === false) {
      controller.bulk.selection.removeAllUitpasNumbers();
    }
  };

  /**
   * Change the selection of a given pass. Can be added or removed depending on the current selection.
   *
   * @param {Pass} pass
   */
  controller.togglePassBulkSelection = function (pass) {
    // Remove the pass if all passes are selecter or if the pass is in the selection.
    if (controller.bulk.selection.selectAll || controller.bulk.selection.numberInSelection(pass.number)) {
      controller.bulk.selection.removeUitpasNumberFromSelection(pass.number);
    }
    else {
      controller.bulk.selection.addUitpasNumberToSelection(pass.number);
    }
  };

  controller.doBulkAction = function () {
    console.log(controller.bulk.action);
    console.log(controller.bulk.selection.toBulkSelection());
    controller.bulk.submitBusy = true;
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
    // Update the search parameters in the bulk selection object.
    controller.bulk.selection.updateSearchParameters(searchParameters);
  };

  var searchResultsListener = $rootScope.$on('passholdersFound', controller.updateResults);
  var searchListener = $rootScope.$on('findingPassholders', controller.finding);

  $scope.$on('$destroy', searchResultsListener);
  $scope.$on('$destroy', searchListener);
}
