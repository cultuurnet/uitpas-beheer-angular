'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.search.advanced-search
 * @description
 * # advanced search service
 * Service in the ubr.passholder.search module.
 */
angular
  .module('ubr.passholder.search')
  .service('advancedSearchService', advancedSearchService);

/* @ngInject */
function advancedSearchService(passholderService, $q, $rootScope) {

  /*jshint validthis: true */
  var service = this;

  /** @type {SearchParameters} */
  service.searchParameters = null;
  /** @type {PassholderSearchResults} */
  service.searchResults = null;

  /**
   * @param {SearchParameters} searchParameters
   */
  service.findPassholders = function(searchParameters) {
    var deferredSearchResults = $q.defer();

    function rememberAndReturnResults(searchResults) {
      searchResults.page = searchParameters.page;
      service.searchResults = searchResults;
      deferredSearchResults.resolve(searchResults);
      $rootScope.$emit('passholdersFound', searchResults);
    }

    service.searchParameters = searchParameters;
    $rootScope.$emit('findingPassholders', searchParameters);
    passholderService
      .findPassholders(searchParameters)
      .then(rememberAndReturnResults, deferredSearchResults.reject);

    return deferredSearchResults.promise;
  };

  /**
   * Jump to a specific page of the active search
   *
   * @param {int} pageNumber
   */
  service.goToPage = function (pageNumber) {
    if (service.searchParameters) {
      var searchParameters = angular.copy(service.searchParameters);
      searchParameters.page = pageNumber;

      service.findPassholders(searchParameters);
    } else {
      throw new Error('There is no active search for which we can show a specific page.');
    }
  };
}
