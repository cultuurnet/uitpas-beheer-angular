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
    this.mode = 'detail';

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
      this.mode = jsonSearchParameters.mode || 'detail';
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
        'email',
        'membershipAssociationId',
        'membershipStatus',
        'mode'
      ]);

      if (this.dateOfBirth) {
        params.dateOfBirth = moment(this.dateOfBirth).format('YYYY-MM-DD');
      }

      if (this.uitpasNumbers.length > 0) {
        params.uitpasNumbers = this.uitpasNumbers.join('-');
      }

      return params;
    },
    fromParams: function (params) {
      this.uitpasNumbers = params.uitpasNumbers ? params.uitpasNumbers.split('-') : [];
      this.page = params.page || 1;
      this.dateOfBirth = (params.dateOfBirth ? day(params.dateOfBirth, 'YYYY-MM-DD').toDate() : null);
      this.firstName = params.firstName || null;
      this.name = params.name || null;
      this.street = params.street || null;
      this.city = params.city || null;
      this.email = params.email || null;
      this.membershipAssociationId = params.membershipAssociationId || null;
      this.membershipStatus = MembershipStatus[params.membershipStatus] || null;
      this.mode = params.mode || 'detail';
    }
  };

  return (SearchParameters);
}
