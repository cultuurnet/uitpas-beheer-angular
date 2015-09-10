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
    var day = moment(dayString + ' 00:00', dayFormat + ' HH:mm', true);

    // Circumvent a bug in JavaFX: https://bugs.openjdk.java.net/browse/JDK-8090098
    if (day.toDate().getTimezoneOffset() === 1320) {
      // This does not take into account DST, however it will always result in
      // the same day in CE(S)T which is sufficient.
      day = moment(dayString + ' 00:00 +0100', dayFormat + ' HH:mm Z', true);
    }

    return day;
  };

  return Day;
}
