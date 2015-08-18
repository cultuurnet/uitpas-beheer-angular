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
        'startDate': 1439251200,
        'endDate': 1439337599,
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
        'startDate': new Date(1439251200*1000),
        'endDate': new Date(1439337599*1000),
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
      'checkinConstraint': {
        'allowed': true,
        'startDate': 1439251200,
        'endDate': 1439337599,
        'reason': ''
      }
    };

    var activity = new Activity(jsonActivity);

    expect(activity.getCheckinState()).toEqual(CheckinState.AVAILABLE);
  });
});