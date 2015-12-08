'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name ubr.utilities.errorClasses
 * @description
 * # errorClasses
 * Translates error codes to html classes.
 */
angular
  .module('ubr.utilities')
  .constant('errorClasses',
  /**
   * Enum for error classes
   * @readonly
   * @enum {object}
   */
  {
    ADVANTAGES_NOT_FOUND: {
      class: 'advantages-not-found'
    },
    PASS_NOT_FOUND: {
      class: 'pass-not-found'
    },
    PAGE_NOT_FOUND: {
      class: 'page-not-found'
    }
  });
