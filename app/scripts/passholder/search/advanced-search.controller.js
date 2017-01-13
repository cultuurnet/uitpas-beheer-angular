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
function AdvancedSearchController (SearchParameters, advancedSearchService, activeCounterAssociations, activeCounter,
                                   $state, $rootScope, $scope, $location) {
  /*jshint validthis: true */
  var controller = this;

  /**
   * Search mode enum.
   * @readonly
   * @enum {object}
   */
  var SearchModes = {
    DETAIL: { title:'Zoeken', name:'DETAIL' },
    NUMBER: { title:'Via kaartnummer', name:'NUMBER' }
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
  controller.associationOptions = activeCounterAssociations;
  controller.activeCounter = activeCounter;
  controller.detailModeEnabled = false;

  controller.searchModes = angular.copy(SearchModes);

  /**
   * @param {SearchModes} searchMode
   */
  controller.activateSearchMode = function (searchMode) {
    // Iterate over all the search modes and set an active state
    Object.keys(controller.searchModes).forEach(function (modeKey) {
      var mode = controller.searchModes[modeKey];
      mode.$active = mode.name === searchMode.name;
    });

    controller.searchFields.setSearchMode(searchMode);
    $state.go('counter.main.advancedSearch', controller.searchFields.toParams(), { notify: false });
  };

  function enableDetailMode() {
    if (controller.activeCounter.isRegistrationCounter() || Object.keys(controller.associationOptions).length > 0) {
      controller.detailModeEnabled = true;
      controller.searchFields.setSearchMode(controller.searchFields.mode);
    }
    else {
      controller.searchFields.setSearchMode(SearchModes.NUMBER);
    }
  }

  /**
   * @param {SearchParameters} searchParameters
   */
  controller.initializeSearchMode = function (searchParameters) {
    enableDetailMode();
    controller.activateSearchMode(controller.searchFields.mode);

    if (!searchParameters.hasDefaultParameters()) {
      if (angular.equals(searchParameters.mode, SearchModes.DETAIL) && controller.detailModeEnabled) {
        controller.findPassholdersByDetails();
      }

      if (angular.equals(searchParameters.mode, SearchModes.NUMBER)) {
        controller.findPassholdersByNumbers();
      }
    }
  };

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
    $location.search(controller.searchFields.toParams());
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

    if (controller.passNumbers) {
      controller.searchFields.uitpasNumbers = controller.passNumbers.split(/[\s]+/);
    }

    controller.findPassholders(controller.searchFields);
  };

  /**
   * Clear the async error set on the controller
   */
  controller.clearAsyncError = function () {
    controller.asyncError = null;
  };

  controller.initializeSearchMode(controller.searchFields);

  var locationChangeSuccess = function() {
    controller.searchFields = getSearchParametersFromState();

    var emptySearchParams = new SearchParameters();
    if (controller.searchFields.yieldsSameResultSetAs(emptySearchParams) && !controller.searchFields.page) {
      angular.forEach($state.params, function (value, key) {
        if (key !== 'mode') {
          $state.params[key] = null;
        }
      });
      $rootScope.$emit('resetSearch');
    }
  };

  var cleanupLocationChangeSuccessListener = $rootScope.$on('$locationChangeSuccess', locationChangeSuccess);

  $scope.$on('$destroy', cleanupLocationChangeSuccessListener);
}
