'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name ubr.utilities.DateRange
 * @description
 * # DateRange
 * Date ranges used for searching activities
 */
angular
  .module('ubr.utilities')
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
      label: 'Afgelopen activiteiten',
      value: 'past'
    },
    'CHOOSE_DATE': {
      label: 'Kies datum',
      value: 'choose_date'
    }
  });
