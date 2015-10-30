'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.filter:PassNumberFilter
 * @description
 * # PassNumberFilter
 * Filter to format a passnumber.
 */
angular
  .module('ubr.passholder')
  .filter('passNumber', passNumberFilter);

function passNumberFilter() {
  return function(input) {
    return [input.slice(0, 5), ' ',
      input.slice(5, 10), ' ',
      input.slice(10)].join('');
  };
}
