'use strict';

describe('Factory: Activity', function () {

  beforeEach(module('uitpasbeheerApp'));

  var Activity, CheckinState;

  beforeEach(inject(function($injector) {
    Activity = $injector.get('Activity');
    CheckinState = $injector.get('CheckinState');
  }));

  it('should correctly parse an activity with check-in constraints', function () {
    var jsonActivity = {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'points': 182,
      'checkinConstraint': {
        'allowed': true,
        'startDate': '2015-09-01T00:00:00+00:00',
        'endDate': '2015-09-01T23:59:59+00:00',
        'reason': ''
      }
    };

    var expectedActivity = {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'points': 182,
      'checkinConstraint': {
        'allowed': true,
        'startDate': new Date('2015-09-01T00:00:00+00:00'),
        'endDate': new Date('2015-09-01T23:59:59+00:00'),
        'reason': ''
      }
    };

    var activity = new Activity(jsonActivity);

    expect(activity).toEqual(expectedActivity);
  });

  it('should create activities that return the right check-in state', function () {
    var jsonActivity = {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'points': 182,
      'checkinConstraint': {
        'allowed': true,
        'startDate': '2015-09-01T00:00:00+00:00',
        'endDate': '2015-09-01T23:59:59+00:00',
        'reason': ''
      }
    };
    var activity = new Activity(jsonActivity);
    expect(activity.getCheckinState()).toEqual(CheckinState.AVAILABLE);

    var jsonActivityMaximumReached = angular.copy(jsonActivity);
    jsonActivityMaximumReached.checkinConstraint.reason = 'MAXIMUM_REACHED';
    var activityMaximumReached = new Activity(jsonActivityMaximumReached);
    expect(activityMaximumReached.getCheckinState()).toEqual(CheckinState.ALREADY_CHECKED_IN);

    var jsonActivityInvalidDateTimeExpired = angular.copy(jsonActivity);
    jsonActivityInvalidDateTimeExpired.checkinConstraint.reason = 'INVALID_DATE_TIME';
    jsonActivityInvalidDateTimeExpired.checkinConstraint.endDate = new Date();
    jsonActivityInvalidDateTimeExpired.checkinConstraint.endDate.setDate(jsonActivityInvalidDateTimeExpired.checkinConstraint.endDate.getDate() - 1);
    jsonActivityInvalidDateTimeExpired.checkinConstraint.startDate = new Date();
    jsonActivityInvalidDateTimeExpired.checkinConstraint.startDate.setDate(jsonActivityInvalidDateTimeExpired.checkinConstraint.startDate.getDate() - 2);
    var activityInvalidDateTimeExpired = new Activity(jsonActivityInvalidDateTimeExpired);
    expect(activityInvalidDateTimeExpired.getCheckinState()).toEqual(CheckinState.EXPIRED);

    var jsonActivityInvalidDateTimeNotYetAvailable = angular.copy(jsonActivity);
    jsonActivityInvalidDateTimeNotYetAvailable.checkinConstraint.reason = 'INVALID_DATE_TIME';
    jsonActivityInvalidDateTimeNotYetAvailable.checkinConstraint.endDate = new Date();
    jsonActivityInvalidDateTimeNotYetAvailable.checkinConstraint.endDate.setDate(jsonActivityInvalidDateTimeExpired.checkinConstraint.endDate.getDate() + 20);
    jsonActivityInvalidDateTimeNotYetAvailable.checkinConstraint.startDate = new Date();
    jsonActivityInvalidDateTimeNotYetAvailable.checkinConstraint.startDate.setDate(jsonActivityInvalidDateTimeExpired.checkinConstraint.startDate.getDate() + 10);
    var activityInvalidDateTimeNotYetAvailable = new Activity(jsonActivityInvalidDateTimeNotYetAvailable);
    expect(activityInvalidDateTimeNotYetAvailable.getCheckinState()).toEqual(CheckinState.NOT_YET_AVAILABLE);
  });
});
