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
function activityFactory() {
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
      endDate: new Date(jsonConstraint.endDate*1000),
      reason: jsonConstraint.reason,
      startDate: new Date(jsonConstraint.startDate*1000)
    };
  }

  var CheckinState = {
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
  };

  Activity.prototype = {
    parseJson: function (jsonActivity) {
      this.id = jsonActivity.id;
      this.description = jsonActivity.description;
      this.title = jsonActivity.title;
      this.when = jsonActivity.when;
      this.checkinConstraint = parseJsonCheckinConstraint(jsonActivity.checkinConstraint);
    },
    getCheckinState: function () {
      var state;

      if (this.checkinConstraint.allowed) {
        state = CheckinState.AVAILABLE;
      }

      if (this.checkinConstraint.reason === 'MAXIMUM_REACHED') {
        state = CheckinState.ALREADY_EXCHANGED;
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
