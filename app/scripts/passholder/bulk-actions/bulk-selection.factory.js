'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.bulkActions.BulkSelection
 * @description
 * # Pass factory
 * Factory in the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .factory('BulkSelection', bulkSelectionFactory);

/* @ngInject */
function bulkSelectionFactory($q, passholderService, PassholderSearchResults) {
    /**
     * Search mode enum.
     * @readonly
     * @enum {object}
     */
    var SearchModes = {
        DETAIL: { title:'Zoeken', name:'DETAIL' },
        NUMBER: { title:'Via kaartnummer', name:'NUMBER' }
    };

  /**
   * @class BulkSelection
   * @constructor
   * @param {PassholderSearchResults} searchResults
   * @param {SearchParameters} searchParameters
   * @param {array} selection
   */
  var BulkSelection = function (searchResults, searchParameters, selection) {
    this.initialize(searchResults, searchParameters, selection);
  };

  BulkSelection.prototype = {
    initialize: function (searchResults, searchParameters, selection) {
      this.uitpasNumberSelection = (selection) ? selection : [];
      if (!(this.uitpasNumberSelection instanceof Array)) {
        throw Error('Unexpected value for selection.');
      }
      this.searchParameters = searchParameters;
      this.searchResults = searchResults ? searchResults : new PassholderSearchResults();
      this.selectAll = false;
    },
    /**
     * Add a given uitpas number to the number selection array.
     *
     * @param {string} [uitpasNumberToAdd]
     */
    addUitpasNumberToSelection: function (uitpasNumberToAdd) {
      this.uitpasNumberSelection.push(uitpasNumberToAdd);

      // Reset parameters if all passes are selected.
      if (this.uitpasNumberSelection.length === this.searchResults.totalItems) {
        this.selectAll = true;
        this.uitpasNumberSelection = [];
      }
    },
    /**
     * Remove a given uitpas number from the number selection array.
     *
     * @param {string} [uitpasNumberToRemove]
     */
    removeUitpasNumberFromSelection: function (uitpasNumberToRemove) {
      // Add all the uitpas numbers form the current search page to the selection, except the one to remove.
      if (this.selectAll) {
        var newSelection = [];
        angular.forEach(this.searchResults.passen, function (pass) {
          if (pass.number !== uitpasNumberToRemove) {
            newSelection.push(pass.number);
          }
        });

        this.uitpasNumberSelection = newSelection;
      }
      else {
        // Remove the uitpas number from the selection
        var index = this.uitpasNumberSelection.indexOf(uitpasNumberToRemove);
        this.uitpasNumberSelection.splice(index, 1);
      }

      this.selectAll = false;
    },
    removeAllUitpasNumbers: function () {
      this.uitpasNumberSelection = [];
    },
    /**
     * Update the search results information.
     *
     * @param {PassholderSearchResults} searchResults
     */
    updateSearchResults: function (searchResults) {
      this.searchResults = searchResults;
      this.uitpasNumberSelection = [];
      this.selectAll = false;
    },
    /**
     * Update the search parameters information.
     *
     * @param {SearchParameters} searchParameters
     */
    updateSearchParameters: function (searchParameters) {
      this.searchParameters = searchParameters;
    },
    numberInSelection: function (uitpasNumber) {
      return (this.uitpasNumberSelection.indexOf(uitpasNumber) > -1);
    },
    toBulkSelection: function () {
      var bulkSelection = {};

      if (!this.selectAll && this.uitpasNumberSelection.length > 0) {
        bulkSelection.selection = this.uitpasNumberSelection;
      }

      bulkSelection.searchParameters = this.searchParameters.toQueryParameters();
      delete bulkSelection.searchParameters.page;
      delete bulkSelection.searchParameters.limit;

      return bulkSelection;
    },
    toQueryParameters: function () {
      var queryParameters = this.searchParameters.toQueryParameters();
      delete queryParameters.page;
      delete queryParameters.limit;

      if(!this.selectAll && this.uitpasNumberSelection.length > 0) {
        queryParameters['selection'] = this.uitpasNumberSelection;
      }

      return queryParameters;
    },
    getPassholderNumbers: function () {
      var passholders = [];
      var deferred = $q.defer();

      // When retrieving passholders for a bulk selection, the page parameter should always be 1.
      this.searchParameters.page = 1;
      
      if (this.selectAll) {
        this.searchParameters.limit = this.searchResults.totalItems;

        passholderService
          .findPassholders(this.searchParameters)
          .then(
            function(PassholderSearchResults) {
              angular.forEach(PassholderSearchResults.passen, function(passholder){
                passholders.push(passholder.passholder);
              });
              deferred.resolve(passholders);
            }
        );
      }
      else {
        this.searchParameters.limit = this.uitpasNumberSelection.length;
        this.searchParameters.uitpasNumbers = this.uitpasNumberSelection;
        this.searchParameters.mode = SearchModes.NUMBER;

        passholderService
          .findPassholders(this.searchParameters)
          .then(
            function(PassholderSearchResults) {
              angular.forEach(PassholderSearchResults.passen, function(passholder){
                passholders.push(passholder.passholder);
              });
              deferred.resolve(passholders);
            }
          );
      }

      return deferred.promise;
    }
  };

  return (BulkSelection);
}
