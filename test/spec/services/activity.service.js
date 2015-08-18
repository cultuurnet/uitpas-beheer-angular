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

  var $scope, $httpBackend, activityService, DateRange, Activity;

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
        'checkinConstraint': {
          'allowed': true,
          'startDate': 1439251200,
          'endDate': 1439337599,
          'reason': ''
        }
      },
      {
        'id': 'eb7c1532-dc32-43bf-a0be-1b9dcf52d2be',
        'title': 'Testevent punten sparen',
        'description': '',
        'when': '',
        'checkinConstraint': {
          'allowed': true,
          'startDate': 1439251200,
          'endDate': 1439337599,
          'reason': ''
        }
      }
    ],
    'firstPage': 'http://culpas-silex.dev/passholders/0900000330317/activities?date_type=today&limit=5&page=1&query=',
    'lastPage': 'http://culpas-silex.dev/passholders/0900000330317/activities?date_type=today&limit=5&page=1&query='
  };

  beforeEach(inject(function ($injector, $rootScope) {
    $scope = $rootScope.$new();
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
          'checkinConstraint': {
            'allowed': true,
            'startDate': new Date(1439251200*1000),
            'endDate': new Date(1439337599*1000),
            'reason': ''
          }
        },
        {
          'id': 'eb7c1532-dc32-43bf-a0be-1b9dcf52d2be',
          'title': 'Testevent punten sparen',
          'description': '',
          'when': '',
          'checkinConstraint': {
            'allowed': true,
            'startDate': new Date(1439251200*1000),
            'endDate': new Date(1439337599*1000),
            'reason': ''
          }
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

    function assertActivities(pagedActivities) {
      expect(pagedActivities).toBeUndefined();
      done();
    }

    function assertError(error) {
      expect(error.code).toBe('UNKNOWN_EVENT_CDBID');
      done();
    }

    activityService
      .search(passholder, searchParameters)
      .then(assertActivities, assertError);

    $httpBackend.flush();
  });

  it('should check in a passholder to an activity', function (done) {
    var passholder = { passNumber: '01234567891234' };
    var activity = {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'checkinConstraint': {
        'allowed': true,
        'startDate': new Date(1438584553*1000),
        'endDate': new Date(1438584553*1000),
        'reason': ''
      }
    };
    var updatedActivity = angular.copy(activity);
    updatedActivity.checkinConstraint.reason = 'MAXIMUM_REACHED';

    function assertActivity(newActivity) {
      expect(newActivity).toEqual(new Activity(updatedActivity));
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

    function assertActivity(newActivity) {
      expect(newActivity).toBeUndefined();
      done();
    }

    function assertError(error) {
      expect(error.code).toBe('CHECKIN_FAILED');
      done();
    }

    $httpBackend.expectPOST(apiUrl + 'passholders/' + passholder.passNumber + '/activities/checkins')
      .respond(403, expectedError);

    activityService
      .checkin(activity, passholder)
      .then(assertActivity, assertError);

    $httpBackend.flush();
  });
});
