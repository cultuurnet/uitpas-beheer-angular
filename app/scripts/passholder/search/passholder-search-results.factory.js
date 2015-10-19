'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.PassholderSearchResults
 * @description
 * # Passholder factory
 * Factory in the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .factory('PassholderSearchResults', PassholderSearchResultsFactory);

/* @ngInject */
function PassholderSearchResultsFactory(Pass) {

  function parseJsonPasses(jsonPassen) {
    var passes = [];

    if (jsonPassen) {
      angular.forEach(jsonPassen, function (jsonPass) {
        var pass = new Pass(jsonPass);
        passes.push(pass);
      });
    }

    return passes;
  }

  /**
   * @class PassholderSearchResults
   * @constructor
   * @param {object}  [jsonPassholderSearchResults]
   */
  var PassholderSearchResults = function (jsonPassholderSearchResults) {
    this.itemsPerPage = 0;
    this.totalItems = 0;
    this.passen = [];
    this.invalidUitpasNumbers = [];
    this.firstPage = '';
    this.lastPage = '';
    this.previousPage = '';
    this.nextPage = '';
    this.unknownNumbersConfirmed = false;
    this.page = 1;

    if (jsonPassholderSearchResults) {
      this.parseJson(jsonPassholderSearchResults);
    }
  };

  PassholderSearchResults.prototype = {
    parseJson: function (jsonPassholderSearchResults) {
      this.itemsPerPage = jsonPassholderSearchResults.itemsPerPage;
      this.totalItems = jsonPassholderSearchResults.totalItems;
      this.passen = parseJsonPasses(jsonPassholderSearchResults.member);
      this.invalidUitpasNumbers = jsonPassholderSearchResults.invalidUitpasNumbers || [];
      this.firstPage = jsonPassholderSearchResults.firstPage;
      this.lastPage = jsonPassholderSearchResults.lastPage;
      this.previousPage = jsonPassholderSearchResults.previousPage;
      this.nextPage = jsonPassholderSearchResults.nextPage;
    },
    hasUnknownNumbers: function () {
      return !!this.invalidUitpasNumbers.length;
    },
    hasConfirmedUnknownNumbers: function () {
      return (this.hasUnknownNumbers() && this.unknownNumbersConfirmed);
    },
    confirmUnknownNumbers: function () {
      this.unknownNumbersConfirmed = true;
    }
  };

  return (PassholderSearchResults);
}
