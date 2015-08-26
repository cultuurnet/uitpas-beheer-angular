'use strict';

describe('Factory: Activity', function () {

  beforeEach(module('uitpasbeheerApp'));

  var Activity, CheckinState;

  beforeEach(inject(function($injector) {
    Activity = $injector.get('Activity');
    CheckinState = $injector.get('CheckinState');
  }));

  function getJsonActivity(){
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
      },
      free: true,
      sales: {
        maximumReached: false,
        differentiation: false,
        base: {
          'Default prijsklasse': 6
        },
        tariffs: {
          kansentariefAvailable: true,
          couponAvailable: true,
          lowestAvailable: 1.5,
          list: [
            {
              name: 'Kansentarief',
              type: 'KANSENTARIEF',
              maximumReached: false,
              prices: {
                'Default prijsklasse': 1.5
              }
            },
            {
              "name": "Cultuurwaardebon",
              "type": "COUPON",
              "maximumReached": false,
              "prices": {
                "Rang 1": 22,
                "Rang 2": 11,
                "Rang 3+": 5.5
              }
            }
          ]
        }
      }
    };

    return jsonActivity;
  }

  it('should correctly parse an activity with check-in constraints', function () {
    var jsonActivity = getJsonActivity();

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
      },
      free: true,
      sales: {
        maximumReached: false,
        differentiation: false,
        base: {
          'Default prijsklasse': 6
        },
        tariffs: {
          kansentariefAvailable: true,
          couponAvailable: true,
          lowestAvailable: 1.5,
          list: [
            {
              name: 'Kansentarief',
              type: 'KANSENTARIEF',
              maximumReached: false,
              prices: {
                'Default prijsklasse': 1.5
              }
            },
            {
              "name": "Cultuurwaardebon",
              "type": "COUPON",
              "maximumReached": false,
              "prices": {
                "Rang 1": 22,
                "Rang 2": 11,
                "Rang 3+": 5.5
              }
            }
          ]
        }
      }
    };

    var activity = new Activity(jsonActivity);
    expect(activity).toEqual(expectedActivity);

    jsonActivity.sales.tariffs.list[0].id = '10';
    expectedActivity.sales.tariffs.list[0].id = '10';

    var activityWithId = new Activity(jsonActivity);
    expect(activityWithId).toEqual(expectedActivity);
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

  it('should be free when explicitly stated so and whatever the tariffs are ', function () {
    var jsonActivity = getJsonActivity();
    jsonActivity.free = true;

    var activity = new Activity(jsonActivity);

    expect(activity.getTariff()).toBeTruthy();
  });

  it('should not return a tariff when the sales are maxed out', function () {
    var jsonActivity = getJsonActivity();
    jsonActivity.free = false;
    jsonActivity.sales.maximumReached = true;

    var activity = new Activity(jsonActivity);

    expect(activity.getTariff()).toEqual('maximumReached');
  });

  it('should prefer a kansentarief-tariff when available and the activity is not free or maxed out already', function () {
    var jsonActivity = getJsonActivity();
    jsonActivity.free = false;
    jsonActivity.sales.maximumReached = false;
    jsonActivity.sales.tariffs.kansentariefAvailable = true;

    var activity = new Activity(jsonActivity);

    expect(activity.getTariff()).toEqual('kansenTariff');
  });

  it('should have a coupon tariff when available and the activity is not free, does not have a kansentarief and is not maxed out already', function () {
    var jsonActivity = getJsonActivity();
    jsonActivity.free = false;
    jsonActivity.sales.maximumReached = false;
    jsonActivity.sales.tariffs.kansentariefAvailable = false;
    jsonActivity.sales.tariffs.couponAvailable = true;

    var activity = new Activity(jsonActivity);

    expect(activity.getTariff()).toEqual('coupon');
  });

  it('should return a list of coupons that are still redeemable', function () {
    var jsonActivity = getJsonActivity();
    var activity = new Activity(jsonActivity);

    var coupons = activity.getRedeemableCoupons();
    var expectedCoupons = [
      {
        "name": "Cultuurwaardebon",
        "type": "COUPON",
        "maximumReached": false,
        "prices": {
          "Rang 1": 22,
          "Rang 2": 11,
          "Rang 3+": 5.5
        }
      }
    ];

    expect(coupons).toEqual(expectedCoupons);
  });

  it('should not include coupons that have been maxed out when asking for redeemable coupons', function () {
    var jsonActivity = getJsonActivity();
    jsonActivity.sales.tariffs.couponAvailable = false;
    jsonActivity.sales.tariffs.list = [
      {
        "name": "Cultuurwaardebon",
        "type": "COUPON",
        "maximumReached": true,
        "prices": {
          "Rang 1": 22,
          "Rang 2": 11,
          "Rang 3+": 5.5
        }
      }
    ];
    var activity = new Activity(jsonActivity);

    var coupons = activity.getRedeemableCoupons();

    expect(coupons).toEqual([]);
  });
});
