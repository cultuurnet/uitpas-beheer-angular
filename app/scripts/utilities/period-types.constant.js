'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name ubr.utilities.PeriodType
 * @description
 * # PeriodType
 * Period Types used for coupons
 */
angular
  .module('ubr.utilities')
  .constant('PeriodType',
  /**
   * Enum for period type
   * @readonly
   * @enum {string}
   */
  {
    'DAY': {
      remainingSuffix: ' vandaag'
    },
    'WEEK': {
      remainingSuffix: ' deze week'
    },
    'MONTH': {
      remainingSuffix: ' deze maand'
    },
    'QUARTER': {
      remainingSuffix: ' dit kwartaal'
    },
    'YEAR': {
      remainingSuffix: ' dit jaar'
    },
    'ABSOLUTE': {
      remainingSuffix: ''
    }
  });
