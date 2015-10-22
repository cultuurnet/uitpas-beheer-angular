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
  controller.formSubmitBusy = false;
  controller.passNumbers = null;
  controller.results = null;
  controller.asyncError = null;

  function resemblesUitpasNumber(value) {
    /**
     * Matches strings containing exactly 13 digits.
     * @type {RegExp}
     */
    var resembleUitpasNumberRegex = /^\d{13}$/;
    return (resembleUitpasNumberRegex.exec(value));
  }

  controller.validateUitpasNumbers = function (givenUitpasNumbers) {
    var invalidNumbers = [];
    if (givenUitpasNumbers) {
      var givenNumbers = givenUitpasNumbers.split(' ');
      angular.forEach(givenNumbers, function (number) {
        if (!resemblesUitpasNumber(number)) {
          invalidNumbers.push(number);
        }
      });
    }

    controller.invalidNumbers = invalidNumbers;
    return (controller.invalidNumbers.length === 0);
  };

  controller.findPassholders = function () {
    controller.formSubmitBusy = true;

    // Check if all provided numbers are in valid format.
    if (!controller.validateUitpasNumbers(controller.passNumbers)) {
      controller.formSubmitBusy = false;
      return;
    }

    var jsonSearchParameters = {};
    if (controller.passNumbers) {
      jsonSearchParameters.uitpasNumber = controller.passNumbers.split(' ');
    }

    var searchParameters = new SearchParameters(jsonSearchParameters);

    var showSearchResults = function (searchResults) {
      controller.results = searchResults;
    };

    /**
     * @param {ApiError} apiError
     */
    function showAsyncError(apiError) {
      controller.asyncError = apiError;
    }

    var unlockSearch = function () {
      controller.formSubmitBusy = false;
    };

    advancedSearchService
      .findPassholders(searchParameters)
      .then(showSearchResults, showAsyncError)
      .finally(unlockSearch);
  };

  controller.clearAsyncError = function () {
    controller.asyncError = null;
  };
}
