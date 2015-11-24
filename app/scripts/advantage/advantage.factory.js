'use strict';

/**
 * @ngdoc service
 * @name ubr.advantage.Advantage
 * @description
 * # Advantage factory
 * Factory in the ubr.advantage module.
 */
angular
  .module('ubr.advantage')
  .factory('Advantage', advantageFactory);

/* @ngInject */
function advantageFactory(Counter, moment, day) {
  /**
   * @class Advantage
   * @constructor
   * @param {object}  jsonAdvantage
   */
  var Advantage = function (jsonAdvantage) {
    this.parseJson(jsonAdvantage);
  };

  function parseJsonCounters (jsonCounters) {
    var counters = [];
    angular.forEach(jsonCounters, function (jsonCounter) {
      counters.push(new Counter(jsonCounter));
    });

    return counters;
  }

  Advantage.prototype = {
    parseJson: function (jsonAdvantage) {
      this.id = jsonAdvantage.id;
      this.description1 = jsonAdvantage.description1;
      this.description2 = jsonAdvantage.description2;
      this.title = jsonAdvantage.title;
      this.points = jsonAdvantage.points || 0;
      this.exchangeable = jsonAdvantage.exchangeable;
      this.validForCities = jsonAdvantage.validForCities;
      this.validForCounters = parseJsonCounters(jsonAdvantage.validForCounters);
      this.endDate= day(jsonAdvantage.endDate, 'YYYY-MM-DD').toDate();
    },
    serialize: function () {
      var serializedAdvantage = angular.copy(this);

      serializedAdvantage.endDate = (this.endDate ? moment(this.endDate).format('YYYY-MM-DD') : null);

      return serializedAdvantage;
    }
  };

  return (Advantage);
}
