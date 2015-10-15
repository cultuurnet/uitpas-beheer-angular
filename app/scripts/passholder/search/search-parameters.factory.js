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

  /**
   * @class SearchParameters
   * @constructor
   * @param {object}  [jsonSearchParameters]
   */
  var SearchParameters = function (jsonSearchParameters) {
    this.uitpasNumber = [];
    this.page = null;
    this.limit = null;
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
      this.uitpasNumber = jsonSearchParameters.uitpasNumber || [];
      this.page = jsonSearchParameters.page || null;
      this.limit = jsonSearchParameters.limit || null;
      this.dateOfBirth = (jsonSearchParameters.dateOfBirth ? day(jsonSearchParameters.dateOfBirth, 'YYYY-MM-DD').toDate() : null);
      this.firstName = jsonSearchParameters.firstName || null;
      this.name = jsonSearchParameters.name || null;
      this.street = jsonSearchParameters.street || null;
      this.city = jsonSearchParameters.city || null;
      this.email = jsonSearchParameters.email || null;
      this.membershipAssociationId = jsonSearchParameters.membershipAssociationId || null;
      this.membershipStatus = jsonSearchParameters.membershipStatus || null;
    },
    serialize: function () {
      var serializedSearchParameters = angular.copy(this);

      serializedSearchParameters.dateOfBirth = (this.dateOfBirth ? moment(this.dateOfBirth).format('YYYY-MM-DD') : null);
      serializedSearchParameters['uitpasNumber[]'] = serializedSearchParameters.uitpasNumber;
      delete serializedSearchParameters.uitpasNumber;

      return serializedSearchParameters;
    }
  };

  return (SearchParameters);
}
