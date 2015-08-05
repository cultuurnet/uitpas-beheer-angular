'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name uitpasbeheerApp.DateRange
 * @description
 * # DateRange
 * Date ranges used for searching activities
 */
angular
  .module('uitpasbeheerApp')
  .constant('DateRange',
  /**
   * Enum for date range
   * @readonly
   * @enum {string}
   */
  {
    'TODAY': {
      label: 'vandaag',
      value: 'today'
    },
    'NEXT_7_DAYS': {
      label: 'volgende 7 dagen',
      value: 'next_7_days'
    },
    'NEXT_30_DAYS': {
      label: 'volgende 30 dagen',
      value: 'next_30_days'
    },
    'NEXT_12_MONTHS': {
      label: 'volgende 12 maanden',
      value: 'next_12_months'
    },
    'PAST': {
      label: 'afgelopen activiteiten ',
      value: 'past'
    }
  });
