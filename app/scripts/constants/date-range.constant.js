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
      label: 'Vandaag',
      value: 'today'
    },
    'NEXT_7_DAYS': {
      label: 'Volgende 7 dagen',
      value: 'next_7_days'
    },
    'NEXT_30_DAYS': {
      label: 'Volgende 30 dagen',
      value: 'next_30_days'
    },
    'NEXT_12_MONTHS': {
      label: 'Volgende 12 maanden',
      value: 'next_12_months'
    },
    'PAST': {
      label: 'Afgelopen activiteiten ',
      value: 'past'
    }
  });
