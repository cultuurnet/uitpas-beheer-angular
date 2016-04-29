'use strict';

/**
 * @ngdoc service
 * @name ubr.counter.statistics.CounterStatistics
 * @description
 * # CounterStatistics factory
 * Factory in the ubr.counter.statistics module.
 */
angular
  .module('ubr.counter.statistics')
  .factory('CounterStatistics', counterStatisticsFactory);

/* @ngInject */
function counterStatisticsFactory(Role) {
  /**
   * @class CounterStatistics
   * @constructor
   * @param {object} jsonCounterStatistics
   */
  var CounterStatistics = function (jsonCounterStatistics) {
    this.parseJson(jsonCounterStatistics);
  };

  function parseJsonRole(roleKey) {
    return Role[roleKey];
  }

  CounterStatistics.prototype = {
    parseJson: function (jsonCounterStatistics) {
      this.uid = jsonCounterStatistics.uid;
      this.nick = jsonCounterStatistics.nick;
      this.role = parseJsonRole(jsonCounterStatistics.role);
    }
  };

  return (CounterStatistics);
}
