'use strict';

/**
 * @ngdoc function
 * @name ubr.counter.statistics.filter:ageStatisticsFilter
 * @description
 * # Age statistics filter
 */
angular
  .module('ubr.counter.statistics')
  .filter('ageStatistics', ageStatisticsFilter);

function ageStatisticsFilter() {
  return function(input) {
    if (input === 'unknow') {
      return 'Onbekend';
    }
    else {
      return input + ' jaar';
    }
  };
}
