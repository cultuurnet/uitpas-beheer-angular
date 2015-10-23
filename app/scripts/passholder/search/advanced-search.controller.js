'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.search.controller:PassholderAdvancedSearchController
 * @description
 * # PassholderAdvancedSearchController
 * Controller of the ubr.passholder.search module.
 */
angular
  .module('ubr.passholder.search')
  .controller('PassholderAdvancedSearchController', AdvancedSearchController);

/* @ngInject */
function AdvancedSearchController (SearchParameters, advancedSearchService) {
  /*jshint validthis: true */
  var controller = this;

  var SearchModes = {
    DETAIL: { title:'Zoeken', name:'detail' },
    NUMBER: { title:'Via kaartnummer', name:'number' }
  };

  controller.formSubmitBusy = false;
  controller.passNumbers = '';
  controller.results = null;
  controller.asyncError = null;
  controller.invalidNumbers = [];
  controller.searchFields = new SearchParameters();
  controller.associationOptions = {};

  controller.searchModes = angular.copy(SearchModes);

  controller.activateSearchMode = function (searchMode) {
    Object.keys(controller.searchModes).forEach(function (modeKey) {
      var mode = controller.searchModes[modeKey];
      mode.active = mode.name === searchMode.name;
    });
  };
  controller.activateSearchMode(controller.searchModes.DETAIL);

  /**
   * Check if a string resembles an UiTPAS number.
   *
   * @param {string} value
   * @return {boolean}
   */
  function resemblesUitpasNumber(value) {
    /**
     * Matches strings containing exactly 13 digits.
     * @type {RegExp}
     */
    var resembleUitpasNumberRegex = /^\d{13}$/;
    return !!(resembleUitpasNumberRegex.exec(value));
  }

  /**
   * Validate a string containing UiTPAS numbers and add invalid numbers to a controller variable.
   *
   * @param {string} givenUitpasNumbers
   * @return {boolean}
   */
  controller.validateUitpasNumbers = function (givenUitpasNumbers) {
    var invalidNumbers = [];
    if (givenUitpasNumbers) {
      var givenNumbers = givenUitpasNumbers.split(/[\s]+/);
      angular.forEach(givenNumbers, function (number) {
        if (!resemblesUitpasNumber(number)) {
          invalidNumbers.push(number);
        }
      });
    }

    controller.invalidNumbers = invalidNumbers;
    return (controller.invalidNumbers.length === 0);
  };

  controller.resetSearchFields = function () {
    controller.searchFields = new SearchParameters();
  };

  /**
   * @param {PassholderSearchResults} searchResults
   */
  controller.showSearchResults = function (searchResults) {
    controller.results = searchResults;
  };

  /**
   * @param {ApiError} apiError
   */
  controller.showAsyncError = function (apiError) {
    controller.asyncError = apiError;
  };

  controller.unlockSearch = function () {
    controller.formSubmitBusy = false;
  };

  /**
   * Find passholders for the given searchParameters.
   * You probably don't want to call this directly from the UI instead search by details or numbers.
   *
   * @param {SearchParameters} searchParameters
   */
  controller.findPassholders = function (searchParameters) {
    controller.formSubmitBusy = true;
    advancedSearchService
      .findPassholders(searchParameters)
      .then(controller.showSearchResults, controller.showAsyncError)
      .finally(controller.unlockSearch);
  };

  /**
   * Find passholders based on the details set on the controller.
   */
  controller.findPassholdersByDetails = function () {
    controller.findPassholders(controller.searchFields);
  };

  /**
   * Use the string of UiTPAS numbers available on the controller to find and show passholders.
   */
  controller.findPassholdersByNumbers = function () {
    // Check if all provided numbers are in valid format.
    if (!controller.validateUitpasNumbers(controller.passNumbers)) {
      controller.formSubmitBusy = false;
      return;
    }

    var jsonSearchParameters = {};
    if (controller.passNumbers) {
      jsonSearchParameters.uitpasNumbers = controller.passNumbers.split(/[\s]+/);
    }

    var searchParameters = new SearchParameters(jsonSearchParameters);

    controller.findPassholders(searchParameters);
  };

  /**
   * Clear the async error set on the controller
   */
  controller.clearAsyncError = function () {
    controller.asyncError = null;
  };
}
