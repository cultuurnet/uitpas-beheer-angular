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
function AdvancedSearchController (SearchParameters, advancedSearchService, activeCounterAssociations, activeCounter, $state) {
  /*jshint validthis: true */
  var controller = this;

  var SearchModes = {
    DETAIL: { title:'Zoeken', name:'detail' },
    NUMBER: { title:'Via kaartnummer', name:'number' }
  };

  function getSearchParametersFromState() {
    var params = new SearchParameters();
    params.fromParams($state.params);

    return params;
  }

  controller.searchFields = getSearchParametersFromState();
  controller.formSubmitBusy = false;
  controller.passNumbers = controller.searchFields.uitpasNumbers ? controller.searchFields.uitpasNumbers.join('\n') : '';
  controller.results = null;
  controller.asyncError = null;
  controller.invalidNumbers = [];
  controller.searchFields = new SearchParameters();
  controller.associationOptions = activeCounterAssociations;
  controller.activeCounter = activeCounter;

  controller.searchModes = angular.copy(SearchModes);

  controller.activateSearchMode = function (searchModeName) {
    Object.keys(controller.searchModes).forEach(function (modeKey) {
      var mode = controller.searchModes[modeKey];
      mode.active = mode.name === searchModeName;
      controller.searchFields.mode = modeKey;
      $state.go('counter.main.advancedSearch', controller.searchFields.toParams(), { notify: false });
    });
  };
  controller.activateSearchMode(controller.searchModes.DETAIL);

  if (controller.activeCounter.isRegistrationCounter() || Object.keys(controller.associationOptions).length > 0) {
    controller.activateSearchMode(controller.searchModes.DETAIL);
  }
  else {
    controller.activateSearchMode(controller.searchModes.NUMBER);
    delete controller.searchModes.DETAIL;
  }

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
   * Check if specified fields are empty or a certain pattern.
   * @return {boolean}
   */
  function searchFielsHaveValidPattern() {
    controller.clearAsyncError();
    // Validate name, firstName, street, city
    var moreThanOneCharacterRegex = /(?!\*)./;
    var fieldPatternErrors = {
      cleanMessage: '',
      context: []
    };
    var fieldsToValidateForPattern = {
      name: 'Naam',
      firstName: 'Voornamen',
      street: 'Straat',
      city: 'Gemeente'
    };
    angular.forEach(fieldsToValidateForPattern, function (errorContext, fieldName) {
      var fieldValue = controller.searchFields[fieldName];
      if (fieldValue && !moreThanOneCharacterRegex.exec(fieldValue)) {
        fieldPatternErrors.context.push(errorContext);
      }
    });
    if (fieldPatternErrors.context.length !== 0) {
      fieldPatternErrors.cleanMessage = 'Gebruik minstens 1 teken behalve * bij de velden:';
      controller.showAsyncError(fieldPatternErrors);
      return false;
    }
    else {
      return true;
    }
  }

  controller.disableAssociationMembershipStatus = function () {
    if (controller.searchFields.membershipAssociationId === null) {
      return true;
    }
    else if (controller.searchFields.membershipAssociationId === '') {
      controller.searchFields.membershipStatus = '';
      return true;
    }
    else {
      return false;
    }
  };

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
    $state.go('counter.main.advancedSearch', controller.searchFields.toParams(), { notify: false });
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
    var params = searchParameters.toParams();
    advancedSearchService
      .findPassholders(searchParameters)
      .then(controller.showSearchResults, controller.showAsyncError)
      .finally(controller.unlockSearch);
  };

  /**
   * Find passholders based on the details set on the controller.
   */
  controller.findPassholdersByDetails = function () {
    if (searchFielsHaveValidPattern()) {
      controller.findPassholders(controller.searchFields);
    }
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

    controller.searchFields = new SearchParameters(jsonSearchParameters);
    controller.findPassholders(controller.searchFields);
  };

  /**
   * Clear the async error set on the controller
   */
  controller.clearAsyncError = function () {
    controller.asyncError = null;
  };

  // check if there's a search filled in the url, probably not best way to do it
  if (location.search.length > 1) {
    if (typeof $state.params.uitpasNumber === 'string') {
      // only one UiTPAS-number was entered
      controller.passNumbers = $state.params.uitpasNumber;
      controller.findPassholdersByNumbers();
    }
    else if (typeof $state.params.uitpasNumber === 'object') {
      // multiple were entered
      controller.passNumbers = $state.params.uitpasNumber.join('\n');
      controller.findPassholdersByNumbers();
    }
    else {
      // regular search, set searchFields from $state params
      controller.searchFields.parseJson($state.params);
      // execute search
      controller.findPassholders(controller.searchFields);
    }
  }
}
