'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.day
 * @description
 * # day factory
 * Factory in the passbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .factory('day', dayFactory);

/* @ngInject */
function dayFactory() {
  /**
   * @class UbrDay
   * @constructor
   */
  var Day = function (dayString, dayFormat) {
    var customRegex = null;

    if (dayFormat === 'D/M/YYYY') {
      customRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-](\d{4})$/;
    }

    var defaultRegex = /^(\d{4})[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;

    var dayRegex = customRegex || defaultRegex;

    var dayParts = dayString.match(dayRegex);

    var day = moment('break stuff');
    if (dayParts) {
      var date, year, month, dayOfMonth;

      if (customRegex) {
        year = dayParts[3];
        month = dayParts[2].length === 1 ? '0' + dayParts[2] : dayParts[2];
        dayOfMonth = dayParts[1].length === 1 ? '0' + dayParts[1] : dayParts[1];
      } else {
        year = dayParts[1];
        month = dayParts[2];
        dayOfMonth = dayParts[3];
      }

      date = new Date(year + '-' +  month + '-' + dayOfMonth);
      day = moment(date);
    }

    return day;
  };

  return Day;
}
