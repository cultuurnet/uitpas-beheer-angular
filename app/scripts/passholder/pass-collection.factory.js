'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.PassCollection
 * @description
 * # Passholder factory
 * Factory in the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .factory('PassCollection', passCollectionFactory);

/* @ngInject */
function passCollectionFactory(Pass) {

  function parseJsonPasses(passCollection, jsonMembers) {
    if (jsonMembers) {
      var members = [];

      angular.forEach(jsonMembers, function (jsonMember) {
        var member = new Pass(jsonMember);
        members.push(member);
      });

      passCollection.member = members;
    }
  }

  /**
   * @class PassCollection
   * @constructor
   * @param {object}  [jsonPassCollection]
   */
  var PassCollection = function (jsonPassCollection) {
    this.itemsPerPage = '';
    this.totalItems = '';
    this.member = [];
    this.invalidUitpasNumbers = [];
    this.firstPage = '';
    this.lastPage = '';
    this.previousPage = '';
    this.nextPage = '';

    if (jsonPassCollection) {
      this.parseJson(jsonPassCollection);
    }
  };

  PassCollection.prototype = {
    parseJson: function (jsonPassCollection) {
      this.itemsPerPage = jsonPassCollection.itemsPerPage;
      this.totalItems = jsonPassCollection.totalItems;
      parseJsonPasses(this, jsonPassCollection.member);
      this.invalidUitpasNumbers = jsonPassCollection.invalidUitpasNumbers;
      this.firstPage = jsonPassCollection.firstPage;
      this.lastPage = jsonPassCollection.lastPage;
      this.previousPage = jsonPassCollection.previousPage;
      this.nextPage = jsonPassCollection.nextPage;
    }
  };

  return (PassCollection);
}
