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
function ResultsViewerController (advancedSearchService, $rootScope, $scope, $state, SearchParameters, UiTPASRouter,
                                  BulkSelection, PassholderSearchResults, bulkActionsService, activeCounter) {
  function getSearchParametersFromState() {
    var params = new SearchParameters();
    params.fromParams($state.params);

    return params;
  }

  /*jshint validthis: true */
  var controller = this;
  controller.activePage = 1;
  controller.loading = true;
  controller.counterHasKansenstatuutPermission = false;
  /** @type {PassholderSearchResults} */
  controller.results = new PassholderSearchResults();
  controller.searchParameters = getSearchParametersFromState();
  controller.bulk = {
    action: 'export',
    submitBusy: false,
    selection: new BulkSelection(controller.results, controller.searchParameters),
    export: {
      requestingExport: false,
      downloadLink: null,
      error: false
    }
  };

  /**
   * Helper function that checks if the active counter has the permission for kansenstatuut
   *
   */
  controller.hasCounterPermissions = function() {
    if (activeCounter.permissions.indexOf('kansenstatuut toekennen')) {
      controller.counterHasKansenstatuutPermission = true;
    }
  };
  controller.hasCounterPermissions();

  /**
   * Helper function that checks if the current page has default search parameters.
   *
   * @returns {boolean}
   */
  controller.hasDefaultParameters = function () {
    var searchParameters = getSearchParametersFromState();
    return searchParameters.hasDefaultParameters();
  };

  if (controller.hasDefaultParameters()) {
    controller.loading = false;
  }

  /**
   * Helper function that informs if a search has been done on the current page.
   * @returns {boolean}
   */
  controller.noSearchDone = function () {
    if (controller.results === null) {
      return true;
    }
    return (controller.results.totalItems === 0 && controller.hasDefaultParameters());
  };

  /**
   * Helper function that informs if the current page is showing results.
   *
   * @returns {boolean}
   */
  controller.isShowingResults = function () {
    var results = controller.results;
    var showResults = false;

    if (results === null) {
      return showResults;
    }

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

  /**
   * Export form submit handler. Dispatches to other functions.
   */
  controller.doBulkAction = function () {
    controller.bulk.submitBusy = true;
    switch (controller.bulk.action) {
      case 'export':
        controller.doBulkExport();
        break;
      case 'address':
        controller.bulk.submitBusy = false;
        $state.go('counter.main.advancedSearch.bulkAddress', { bulkSelection: controller.bulk.selection });
        break;
      case 'kansenstatuut':
        controller.bulk.submitBusy = false;
        $state.go('counter.main.advancedSearch.bulkKansenstatuut', { bulkSelection: controller.bulk.selection });
        break;
    }
  };

  /**
   * Request an export and report to the user.
   */
  controller.doBulkExport = function () {
    controller.bulk.export.requestingExport = true;

    bulkActionsService.exportPassholders(controller.bulk.selection);
    controller.bulk.export.requestingExport = false;
    controller.bulk.submitBusy = false;
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

  controller.resetSearch = function () {
    controller.loading = false;
    controller.results = null;
  };

  var searchResultsListener = $rootScope.$on('passholdersFound', controller.updateResults);
  var searchListener = $rootScope.$on('findingPassholders', controller.finding);
  var cleanupResetSearchListenerListener = $rootScope.$on('resetSearch', controller.resetSearch);

  $scope.$on('$destroy', searchResultsListener);
  $scope.$on('$destroy', searchListener);
  $scope.$on('$destroy', cleanupResetSearchListenerListener);
}
