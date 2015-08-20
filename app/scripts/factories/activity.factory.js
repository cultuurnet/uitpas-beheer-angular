'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.Activity
 * @description
 * # Activity factory
 * Factory in the passbeheerApp.
 */
angular
  .module('uitpasbeheerApp')
  .factory('Activity', activityFactory);

/* @ngInject */
function activityFactory(CheckinState) {
  /**
   * @class Activity
   * @constructor
   * @param {object}  jsonActivity
   */
  var Activity = function (jsonActivity) {
    this.parseJson(jsonActivity);
  };

  function parseJsonCheckinConstraint (jsonConstraint) {
    return {
      allowed: jsonConstraint.allowed,
      endDate: new Date(jsonConstraint.endDate),
      reason: jsonConstraint.reason,
      startDate: new Date(jsonConstraint.startDate)
    };
  }

  Activity.prototype = {
    parseJson: function (jsonActivity) {
      this.id = jsonActivity.id;
      this.description = jsonActivity.description;
      this.title = jsonActivity.title;
      this.when = jsonActivity.when;
      this.points = jsonActivity.points || 0;
      this.checkinConstraint = parseJsonCheckinConstraint(jsonActivity.checkinConstraint);
    },
    getCheckinState: function () {
      var state;

      if (this.checkinConstraint.allowed) {
        state = CheckinState.AVAILABLE;
      }

      if (this.checkinConstraint.reason === 'MAXIMUM_REACHED') {
        state = CheckinState.ALREADY_CHECKED_IN;
      }

      if (this.checkinConstraint.reason === 'INVALID_DATE_TIME') {
        var now = new Date();
        if (this.checkinConstraint.endDate < now) {
          state = CheckinState.EXPIRED;
        }
        if (this.checkinConstraint.startDate > now) {
          state = CheckinState.NOT_YET_AVAILABLE;
        }
      }

      return state;
    }
  };

  return (Activity);
}