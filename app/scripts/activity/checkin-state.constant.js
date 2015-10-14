'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name ubr.activity.CheckinState
 * @description
 * # CheckinState
 * Checkin state used by activities
 */
angular
  .module('ubr.activity')
  .constant('CheckinState',
  /**
   * Enum for checkin state
   * @readonly
   * @enum {string}
   */
  {
    AVAILABLE: {
      name: 'available',
      label: 'Punt sparen'
    },
    ALREADY_CHECKED_IN: {
      name: 'already checked in',
      label: 'Punt gespaard'
    },
    EXPIRED: {
      name: 'expired',
      label: 'Punt sparen niet langer mogelijk'
    },
    NOT_YET_AVAILABLE: {
      name: 'not yet available',
      label: 'Punt sparen nog niet mogelijk'
    }
  });
