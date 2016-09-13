'use strict';

describe('Service: activity', function (){

  beforeEach(module('uitpasbeheerApp'));

  var apiUrl = 'http://example.com/';

  // load the service's module
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  var $scope, $q, $rootScope, $httpBackend, activityService, DateRange, Activity;

  var pagedActivityData = {
    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
    '@type': 'PagedCollection',
    'itemsPerPage': 5,
    'totalItems': 2,
    'member': [
      {
        'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
        'title': 'Altijd open',
        'description': '',
        'when': '',
        'age': 10,
        'points': 182,
        'checkinConstraint': {
          'allowed': true,
          'startDate': '2015-09-01T00:00:00+00:00',
          'endDate': '2015-09-01T23:59:59+00:00',
          'reason': ''
        },
        'free': false
      },
      {
        'id': 'eb7c1532-dc32-43bf-a0be-1b9dcf52d2be',
        'title': 'Testevent punten sparen',
        'description': '',
        'when': '',
        'age': 10,
        'points': 182,
        'checkinConstraint': {
          'allowed': true,
          'startDate': '2015-09-01T00:00:00+00:00',
          'endDate': '2015-09-01T23:59:59+00:00',
          'reason': ''
        },
        'free': true
      }
    ],
    'firstPage': 'http://culpas-silex.dev/passholders/0900000330317/activities?date_type=today&limit=5&page=1&query=',
    'lastPage': 'http://culpas-silex.dev/passholders/0900000330317/activities?date_type=today&limit=5&page=1&query='
  };

  function getJsonActivity() {
    var jsonActivity = {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'age': 10,
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
          couponAvailable: false,
          lowestAvailable: 1.5,
          list: [
            {
              name: 'Kansentarief',
              type: 'KANSENTARIEF',
              maximumReached: false,
              prices: {
                'Default prijsklasse': 1.5
              }
            }
          ]
        }
      }
    };

    return angular.copy(jsonActivity);
  }

  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $q = $injector.get('$q');
    $httpBackend = $injector.get('$httpBackend');
    activityService = $injector.get('activityService');
    DateRange = $injector.get('DateRange');
    Activity = $injector.get('Activity');
  }));

  it('should return a list of activities for a given passholder and search parameters', function (done) {
    var passholder = { passNumber: '01234567891234', points: 123 };
    var searchParameters = {
      query: 'something awesome',
      dateRange: DateRange.TODAY,
      page: 1,
      limit: 5
    };
    $httpBackend
      .expectGET(apiUrl + 'passholders/' + passholder.passNumber + '/activities?date_type=today&limit=5&page=1&query=something+awesome')
      .respond(200, JSON.stringify(pagedActivityData));

    var expectedPagedActivities = {
      activities: [
        {
          'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
          'title': 'Altijd open',
          'description': '',
          'when': '',
          'age': 10,
          'points': 182,
          'checkinConstraint': {
            'allowed': true,
            'startDate': new Date('2015-09-01T00:00:00+00:00'),
            'endDate': new Date('2015-09-01T23:59:59+00:00'),
            'reason': ''
          },
          'free': false
        },
        {
          'id': 'eb7c1532-dc32-43bf-a0be-1b9dcf52d2be',
          'title': 'Testevent punten sparen',
          'description': '',
          'when': '',
          'age' : 10,
          'points': 182,
          'checkinConstraint': {
            'allowed': true,
            'startDate': new Date('2015-09-01T00:00:00+00:00'),
            'endDate': new Date('2015-09-01T23:59:59+00:00'),
            'reason': ''
          },
          'free': true
        }
    ],
      totalActivities: 2
    };

    function assertActivities(pagedActivities) {
      expect(pagedActivities).toEqual(expectedPagedActivities);
      done();
    }

    activityService
      .search(passholder, searchParameters)
      .then(assertActivities);

    $httpBackend.flush();
  });

  it ('throws an error when it can\'t get a list of activities', function (done) {
    var passholder = { passNumber: '01234567891234', points: 123 };
    var searchParameters = {
      query: 'something awesome',
      dateRange: DateRange.TODAY,
      page: 1,
      limit: 5
    };
    var expectedError = {
      code: 'UNKNOWN_EVENT_CDBID',
      exception: 'CultuurNet\UiTPASBeheer\Exception\ReadableCodeResponseException',
      message: 'Event with cdbid [eb7c1532-dc32-43bf-a0be-1b9dcf52d2be1] not found. URL CALLED: https://acc2.uitid.be/uitid/rest/uitpas/passholder/checkin POST DATA: cdbid=eb7c1532-dc32-43bf-a0be-1b9dcf52d2be1&uitpasNumber=0930000419406&balieConsumerKey=31413BDF-DFC7-7A9F-10403618C2816E44',
      type: 'error'
    };

    $httpBackend
      .expectGET(apiUrl + 'passholders/' + passholder.passNumber + '/activities?date_type=today&limit=5&page=1&query=something+awesome')
      .respond(403, expectedError);

    function assertError(error) {
      expect(error.code).toBe('UNKNOWN_EVENT_CDBID');
      done();
    }

    activityService
      .search(passholder, searchParameters)
      .catch(assertError);

    $httpBackend.flush();
  });

  it('should check in a passholder to an activity', function (done) {
    var passholder = { passNumber: '01234567891234' };
    var activity = {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'age': 10,
      'points': 182,
      'checkinConstraint': {
        'allowed': true,
        'startDate': new Date('2015-09-01T00:00:00+00:00'),
        'endDate': new Date('2015-09-01T23:59:59+00:00'),
        'reason': ''
      }
    };
    var updatedActivity = angular.copy(activity);
    updatedActivity.checkinConstraint.reason = 'MAXIMUM_REACHED';
    spyOn($rootScope, '$emit');

    function assertActivity(newActivity) {
      expect(newActivity).toEqual(new Activity(updatedActivity));
      expect($rootScope.$emit).toHaveBeenCalledWith('activityCheckedIn', new Activity(updatedActivity));
      done();
    }

    $httpBackend.expectPOST(apiUrl + 'passholders/' + passholder.passNumber + '/activities/checkins')
      .respond(200, updatedActivity);

    activityService
      .checkin(activity, passholder)
      .then(assertActivity);

    $httpBackend.flush();
  });

  it('throws an error when it can\'t check in a passholder to an activity', function (done) {
    var passholder = { passNumber: '01234567891234' };
    var activity = { id: 'e71f3381-21aa-4f73-a860-17cf3e31f013' };
    var expectedError = {
      code: 'UNKNOWN_EVENT_CDBID',
      exception: 'CultuurNet\UiTPASBeheer\Exception\ReadableCodeResponseException',
      message: 'Event with cdbid [eb7c1532-dc32-43bf-a0be-1b9dcf52d2be1] not found. URL CALLED: https://acc2.uitid.be/uitid/rest/uitpas/passholder/checkin POST DATA: cdbid=eb7c1532-dc32-43bf-a0be-1b9dcf52d2be1&uitpasNumber=0930000419406&balieConsumerKey=31413BDF-DFC7-7A9F-10403618C2816E44',
      type: 'error'
    };

    function assertError(error) {
      expect(error.code).toBe('UNKNOWN_EVENT_CDBID');
      done();
    }

    $httpBackend.expectPOST(apiUrl + 'passholders/' + passholder.passNumber + '/activities/checkins')
      .respond(403, expectedError);

    activityService
      .checkin(activity, passholder)
      .catch(assertError);

    $httpBackend.flush();
  });

  it('should claim a tariff for a passholder for an activity', function(done) {
    // Claim a coupon tariff.
    var passholder = { passNumber: '01234567891234' };
    var jsonActivity = {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'age': 10,
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
          couponAvailable: false,
          lowestAvailable: 1.5,
          list: [
            {
              name: 'Kansentarief',
              type: 'KANSENTARIEF',
              maximumReached: false,
              prices: {
                'Default prijsklasse': 1.5
              }
            }
          ]
        }
      }
    };
    var activity = new Activity(jsonActivity);
    var priceInfo = {
      type: 'COUPON',
      priceClass: 'Eerste rang',
      couponId: '10'
    };
    var claim = {
      id: '30819',
      price: 1.5,
      creationDate: 'string'
    };
    var expectedPostParams = {
      activityId: 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      priceClass: 'Eerste rang',
      tariffId: '10'
    };
    spyOn($rootScope, '$emit');

    function claimActivity(response) {
      expect($rootScope.$emit).toHaveBeenCalledWith('ticketsSold', response);
    }

    $httpBackend.expectPOST(apiUrl + 'passholders/' + passholder.passNumber + '/activities/ticket-sales', expectedPostParams)
      .respond(200, claim);

    var claimPromise = activityService
      .claimTariff(passholder, activity, priceInfo);

    $httpBackend.flush();

    // Claim a kansenstatuut tariff.
    delete expectedPostParams.tariffId;
    priceInfo.type = 'KANSENSTATUUT';
    delete priceInfo.id;

    $httpBackend.expectPOST(apiUrl + 'passholders/' + passholder.passNumber + '/activities/ticket-sales', expectedPostParams)
      .respond(200, claim);

    var kansenstatuutClaimPromise = activityService
      .claimTariff(passholder, activity, priceInfo)
      .then(claimActivity);

    var allTariffsClaimed = function () {
      done();
    };

    $q.all([claimPromise, kansenstatuutClaimPromise])
      .then(allTariffsClaimed);

    $httpBackend.flush();
  });

  it('throws an error when it can\'t claim a tariff', function (done) {
    var passholder = {
      passNumber: '01234567891234',
      name: {
        first: 'voornaam',
        last: 'achternaam'
      }
    };
    var activity = new Activity(getJsonActivity());
    var tariff = {
      type: 'COUPON',
      priceClass: 'Eerste rang',
      couponId: '10'
    };
    var apiError = {
      code: '30819',
      message: 'This is a meaningless message.'
    };
    var expectedPostParams = {
      activityId: 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      priceClass: 'Eerste rang',
      tariffId: '10'
    };

    function assertFailure (error) {
      expect(error).toEqual(apiError);
      done();
    }

    $httpBackend.expectPOST(apiUrl + 'passholders/' + passholder.passNumber + '/activities/ticket-sales', expectedPostParams)
      .respond(403, apiError);

    activityService
      .claimTariff(passholder, activity, tariff)
      .catch(assertFailure);

    $httpBackend.flush();
  });
});
