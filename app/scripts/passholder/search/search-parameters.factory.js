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

    if (jsonSearchParameters) {
      this.parseJson(jsonSearchParameters);
    }
  };

  SearchParameters.prototype = {
    parseJson: function (jsonSearchParameters) {
      this.uitpasNumbers = jsonSearchParameters.uitpasNumbers || [];
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
    },
    serialize: function () {
      var serializedSearchParameters = {
        page: this.page || 1,
        limit: this.limit || 10
      };
      var searchParameters = this;

      function includeParameters(parameters, parameterNames) {
        angular.forEach(parameterNames, function (parameterName) {
          var value = searchParameters[parameterName];
          if (value !== null && value !== '') {
            parameters[parameterName] = value;
          }
        });
      }

      includeParameters(serializedSearchParameters, [
        'firstName',
        'name',
        'street',
        'city',
        'email',
        'membershipAssociationId',
        'membershipStatus'
      ]);

      if (this.dateOfBirth) {
        serializedSearchParameters.dateOfBirth = moment(this.dateOfBirth).format('YYYY-MM-DD');
      }

      if (this.uitpasNumbers.length > 0) {
        serializedSearchParameters.uitpasNumber = this.uitpasNumbers;
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
    }
  };

  return (SearchParameters);
}
