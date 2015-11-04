'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.search.searchParameters
 * @description
 * # Passholder factory
 * Factory in the ubr.passholder.search module.
 */
angular
  .module('ubr.passholder.search')
  .factory('SearchParameters', searchParametersFactory);

/* @ngInject */
function searchParametersFactory(moment, day) {

  var MembershipStatus = {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED'
  };

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
   * @param {SearchParameters} searchParameters
   * @param {String[]} parameterNames
   * @return {Object}
   */
  function getParameters(searchParameters, parameterNames) {
    var parameters = {};

    angular.forEach(parameterNames, function (parameterName) {
      var value = searchParameters[parameterName];
      if (value !== null && value !== '') {
        parameters[parameterName] = value;
      }
    });

    return parameters;
  }

  /**
   * Takes a list of numbers or a whitespace-separated string and returns a list of UiTPAS numbers
   * @param {String|String[]} uitpasSomething
   * @return {String[]}
   */
  function parseUitpasNumbers (uitpasSomething) {
    var uitpasNumbers = [];

    if (typeof uitpasSomething === 'string') {
      uitpasNumbers = uitpasSomething.split(/[\s]+/);
    } else if (Array.isArray(uitpasSomething)) {
      uitpasNumbers = uitpasSomething;
    } else {
      throw new Error('These are not UiTPAS numbers');
    }

    return uitpasNumbers;
  }

  function parseSearchMode (searchModeKey) {
    var mode = SearchModes.DETAIL;

    if (searchModeKey && SearchModes[searchModeKey]) {
      mode = SearchModes[searchModeKey];
    }

    return mode;
  }

  /**
   * @class SearchParameters
   * @constructor
   * @param {object}  [jsonSearchParameters]
   */
  var SearchParameters = function (jsonSearchParameters) {
    this.uitpasNumbers = [];
    this.page = 1;
    this.limit = 10;
    this.dateOfBirth = null;
    this.firstName = null;
    this.name = null;
    this.street = null;
    this.city = null;
    this.email = null;
    this.membershipAssociationId = null;
    this.membershipStatus = null;
    this.mode = SearchModes.DETAIL;

    if (jsonSearchParameters) {
      this.parseJson(jsonSearchParameters);
    }
  };

  SearchParameters.prototype = {
    parseJson: function (jsonSearchParameters) {
      this.uitpasNumbers = jsonSearchParameters.uitpasNumbers ? parseUitpasNumbers(jsonSearchParameters.uitpasNumbers) : [];
      this.page = jsonSearchParameters.page || 1;
      this.limit = jsonSearchParameters.limit || 10;
      this.dateOfBirth = (jsonSearchParameters.dateOfBirth ? day(jsonSearchParameters.dateOfBirth, 'YYYY-MM-DD').toDate() : null);
      this.firstName = jsonSearchParameters.firstName || null;
      this.name = jsonSearchParameters.name || null;
      this.street = jsonSearchParameters.street || null;
      this.city = jsonSearchParameters.city || null;
      this.email = jsonSearchParameters.email || null;
      this.membershipAssociationId = jsonSearchParameters.membershipAssociationId || null;
      this.membershipStatus = MembershipStatus[jsonSearchParameters.membershipStatus] || null;
      this.mode = jsonSearchParameters.mode ? parseSearchMode(jsonSearchParameters.mode) : SearchModes.DETAIL;
    },
    serialize: function () {
      var serializedSearchParameters = getParameters(this, [
        'firstName',
        'name',
        'street',
        'city',
        'email',
        'membershipAssociationId',
        'membershipStatus',
        'page',
        'limit'
      ]);

      if (this.dateOfBirth) {
        serializedSearchParameters.dateOfBirth = moment(this.dateOfBirth).format('YYYY-MM-DD');
      }

      if (this.uitpasNumbers.length > 0) {
        serializedSearchParameters['uitpasNumber[]'] = this.uitpasNumbers;
      }

      return serializedSearchParameters;
    },

    toQueryParameters: function () {
      var queryParameters = {};

      if (angular.equals(this.mode, SearchModes.NUMBER)) {
        queryParameters = getParameters(this, ['page', 'limit']);

        if(this.uitpasNumbers.length > 0) {
          queryParameters['uitpasNumber[]'] = this.uitpasNumbers;
        }
      } else {
        queryParameters = getParameters(this, [
          'firstName',
          'name',
          'street',
          'city',
          'email',
          'membershipAssociationId',
          'membershipStatus',
          'page',
          'limit'
        ]);

        if (this.dateOfBirth) {
          queryParameters.dateOfBirth = moment(this.dateOfBirth).format('YYYY-MM-DD');
        }
      }

      return queryParameters;
    },

    /**
     * Check if the given parameters should yield the same result set.
     * This means the total result set is the same but the page can be different.
     *
     * @param {SearchParameters} searchParameters
     */
    yieldsSameResultSetAs: function (searchParameters) {
      var theseParameters = this.serialize();
      var thoseParameters = searchParameters.serialize();

      // normalize the parameters by zeroing their page
      theseParameters.page = 0;
      thoseParameters.page = 0;

      return angular.equals(theseParameters, thoseParameters);
    },
    toParams: function () {
      var params =  getParameters(this, [
        'page',
        'firstName',
        'name',
        'street',
        'city',
        'membershipAssociationId',
        'membershipStatus'
      ]);

      if (this.dateOfBirth) {
        params.dateOfBirth = moment(this.dateOfBirth).format('YYYY-MM-DD');
      }

      if (this.uitpasNumbers.length > 0) {
        params.uitpasNumbers = this.uitpasNumbers.join('-');
      }

      if (this.email) {
        var encodedEmail = encodeURIComponent(this.email);
        encodedEmail = encodedEmail.replace(/\./g, '%2E');
        params.email = encodedEmail;
      }

      params.mode = this.mode.name;

      return params;
    },
    fromParams: function (params) {
      this.uitpasNumbers = params.uitpasNumbers ? parseUitpasNumbers(params.uitpasNumbers) : [];
      this.page = params.page ? parseInt(params.page) : 1;
      this.dateOfBirth = (params.dateOfBirth ? day(params.dateOfBirth, 'YYYY-MM-DD').toDate() : null);
      this.firstName = params.firstName || null;
      this.name = params.name || null;
      this.street = params.street || null;
      this.city = params.city || null;
      this.email = params.email ? decodeURIComponent(params.email) : null;
      this.membershipAssociationId = params.membershipAssociationId || null;
      this.membershipStatus = MembershipStatus[params.membershipStatus] || null;
      this.mode = params.mode ? parseSearchMode(params.mode) : SearchModes.DETAIL;
    },
    /**
     * Check if active mode still has its default parameters.
     * Useful to check if a search should trigger automatically when loading parameters.
     */
    hasDefaultParameters: function () {
      var parameters = angular.copy(this);
      var hasDefaultParameters = false;

      if (angular.equals(parameters.mode, SearchModes.NUMBER)) {
        if (parameters.uitpasNumbers.length === 0 && parameters.page === 1) {
          hasDefaultParameters = true;
        }
      }

      if (angular.equals(parameters.mode, SearchModes.DETAIL)) {
        parameters.uitpasNumbers = [];
        var defaultParameters = new SearchParameters();
        hasDefaultParameters = angular.equals(parameters, defaultParameters);
      }

      return hasDefaultParameters;
    },
    /**
     * @param {SearchModes} searchMode
     */
    setSearchMode: function (searchMode) {
      this.mode = searchMode;
    }
  };

  return (SearchParameters);
}
