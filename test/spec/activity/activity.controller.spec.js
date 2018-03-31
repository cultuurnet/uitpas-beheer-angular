'use strict';

describe('Controller: ActivityController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var $controller, $scope, $rootScope, $httpBackend, $q, activityController, activityService, DateRange, Passholder,
    BulkSelection, bulkSelection, $state, SearchParameters, searchParameters, PassholderSearchResults, searchResults,
    passholders, passholder;

  var deferredActivities;

  var pagedActivities = {
    activities: [
      {
        'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
        'title': 'Altijd open',
        'description': '',
        'when': '',
        'checkinConstraint': {
          'allowed': true,
          'startDate': new Date(1438584553 * 1000),
          'endDate': new Date(1438584553 * 1000),
          'reason': ''
        },
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
                prices: [
                  {priceClass: 'Default prijsklasse', price: 1.5, type: 'KANSENTARIEF'}
                ]
              }
            ]
          }
        }
      },
      {
        'id': 'eb7c1532-dc32-43bf-a0be-1b9dcf52d2be',
        'title': 'Testevent punten sparen',
        'description': '',
        'when': '',
        'checkinConstraint': {
          'allowed': true,
          'startDate': new Date(1438584553 * 1000),
          'endDate': new Date(1438584553 * 1000),
          'reason': ''
        }
      }
    ],
    totalActivities: 2
  };

  //var passholder = { passNumber: '01234567891234', points: 123 };

  var jsonSearchParameters = {
    uitpasNumbers: [],
    page: 1,
    limit: 10,
    dateOfBirth: null,
    firstName: 'jan',
    name: null,
    street: null,
    city: null,
    email: null,
    membershipAssociationId: null,
    membershipStatus: null,
    mode: {
      title: 'Zoeken',
      name: 'DETAIL'
    }
  };

  var jsonPass = {
    uitPas: {
      number: '0930000422202',
      kansenStatuut: true,
      status: 'LOCAL_STOCK',
      type: 'CARD',
      cardSystem: {
        id: '4a567b89',
        name: 'UiTPAS Regio Aalst'
      }
    },
    passHolder: {
      uid: 'string',
      name: {
        first: 'John',
        middle: 'Lupus',
        last: 'Smith'
      },
      address: {
        street: 'Steenweg op Aalst 94',
        postalCode: '9308',
        city: 'Aalst'
      },
      birth: {
        date: '2003-12-26',
        place: 'Sint-Agatha-Berchem'
      },
      inszNumber: '93051822361',
      gender: 'MALE',
      nationality: 'Belg',
      picture: 'R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw==',
      contact: {
        email: 'foo@bar.com',
        telephoneNumber: '016454545',
        mobileNumber: '+32 498 77 88 99'
      },
      privacy: {
        email: true,
        sms: true
      },
      points: 40,
      remarks: 'Dit maakt niet uit.',
      kansenStatuten: [
        {
          status: 'ACTIVE',
          endDate: '2015-12-26',
          cardSystem: {
            id: '4a567b89',
            name: 'UiTPAS Regio Aalst'
          }
        }
      ],
      uitPassen: [
        {
          number: '0930000422202',
          kansenStatuut: true,
          status: 'LOCAL_STOCK',
          type: 'CARD',
          cardSystem: {
            id: '4a567b89',
            name: 'UiTPAS Regio Aalst'
          }
        }
      ]
    },
    group: {
      name: 'Vereniging',
      availableTickets: 0
    }
  };

  var jsonPassholder = {
    uid: 'string',
    name: {
      first: 'John',
      middle: 'Lupus',
      last: 'Smith'
    },
    address: {
      street: 'Steenweg op Aalst 94',
      postalCode: '9308',
      city: 'Aalst'
    },
    birth: {
      date: '2003-12-26',
      place: 'Sint-Agatha-Berchem'
    },
    inszNumber: '93051822361',
    gender: 'MALE',
    nationality: 'Belg',
    picture: 'R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw==',
    contact: {
      email: 'foo@bar.com',
      telephoneNumber: '016454545',
      mobileNumber: '+32 498 77 88 99'
    },
    privacy: {
      email: true,
      sms: true
    },
    points: 40,
    remarks: 'Dit maakt niet uit.',
    kansenStatuten: [
      {
        status: 'ACTIVE',
        endDate: '2015-12-26',
        cardSystem: {
          id: '1',
          name: 'UiTPAS Regio Aalst'
        }
      }
    ],
    uitPassen: [
      {
        number: '0930000422202',
        kansenStatuut: true,
        status: 'ACTIVE',
        type: 'CARD',
        cardSystem: {
          id: '1',
          name: 'UiTPAS Regio Aalst'
        }
      }
    ]
  };

  var jsonSearchResults = {
    firstPage: 'http://culpas-silex.dev/passholders?firstName=jan&limit=10&page=1',
    invalidUitpasNumbers: [],
    itemsPerPage: 10,
    lastPage: 'http://culpas-silex.dev/passholders?firstName=jan&limit=10&page=3',
    nextPage: 'http://culpas-silex.dev/passholders?firstName=jan&limit=10&page=2',
    page: 1,
    member: [
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass
    ],
    length: 10,
    previousPage: undefined,
    totalItems: 29,
    unknownNumbersConfirmed: false
  };

  var activeCounter = {
    'id': '1149',
    'consumerKey': '9d466f7f88231cf298d5cb5dd23d55af',
    'name': 'KSA-VKSJ Denderhoutem',
    'role': 'member',
    'actorId': 'c1372ef5-65db-4f95-aa2f-478fb5b58258',
    'cardSystems': {
      '1': {
        'permissions': [],
        'groups': ['Checkin and Ticket balies'],
        'id': '1',
        'name': 'UiTPAS Regio Aalst',
        'distributionKeys': []
      }
    },
    'permissions': [],
    'groups': ['Checkin and Ticket balies'],
    'getFirstCardSystem': function () {
      return this.cardSystems[1];
    }
  };

  beforeEach(inject(function ($injector) {
    $controller = $injector.get('$controller');
    $q = $injector.get('$q');
    $rootScope = $injector.get('$rootScope');
    BulkSelection = $injector.get('BulkSelection');
    Passholder = $injector.get('Passholder');
    PassholderSearchResults = $injector.get('PassholderSearchResults');
    SearchParameters = $injector.get('SearchParameters');
    $state = $injector.get('$state');
    deferredActivities = $q.defer();
    var activityPromise = deferredActivities.promise;
    activityService = jasmine.createSpyObj('activityService', ['checkin', 'claimTariff', 'search']);
    DateRange = $injector.get('DateRange');
    $scope = $rootScope.$new();
    $httpBackend = $injector.get('$httpBackend');

    searchResults = new PassholderSearchResults(jsonSearchResults);
    searchParameters = new SearchParameters(jsonSearchParameters);
    bulkSelection = new BulkSelection(searchResults, searchParameters, []);

    activityService.search.and.returnValue(activityPromise);

    passholder = new Passholder(jsonPassholder);

    passholders = [
      passholder,
      passholder,
      passholder,
      passholder,
      passholder
    ];

    activityController = $controller('ActivityController', {
      passholder: passholder,
      passholders: null,
      bulkSelection: bulkSelection,
      activityService: activityService,
      DateRange: DateRange,
      $rootScope: $rootScope,
      $scope: $scope,
      activityMode: 'passholders',
      $state: $state,
      activeCounter: activeCounter
    });
  }));

  it('should fetch an initial list of activities for the active passholder', function () {
    deferredActivities.resolve(pagedActivities);
    $scope.$digest();

    expect(activityService.search).toHaveBeenCalled();
    expect(activityController.activitiesLoading).toEqual(0);
  });

  it('should reset the active page when the query or date range search parameter changes', function () {
    deferredActivities.resolve(pagedActivities);
    $scope.$digest();

    // Reset when the query changes.
    activityController.page = 3;
    activityController.query = 'some new query';
    activityController.searchParametersChanged();
    expect(activityController.page).toEqual(1);
    expect(activityController.hideDateRange).toBeTruthy();

    // Reset when date range changes.
    activityController.page = 4;
    activityController.dateRange = DateRange.PAST;
    activityController.searchParametersChanged();
    expect(activityController.page).toEqual(1);

    // Do not reset when none of the above change.
    activityController.page = 2;
    activityController.searchParametersChanged();
    expect(activityController.page).toEqual(2);
  });

  it('should fetch a new list of activities when the search parameters change', function () {
    var expectedSearchParameters = {
      query: '',
      dateRange: DateRange.TODAY,
      page: 1,
      limit: 5,
      sort: '',
    };
    // reset the calls to not include the initial search
    activityService.search.calls.reset();

    activityController.searchParametersChanged();
    expect(activityService.search).toHaveBeenCalledWith(passholder, expectedSearchParameters);
  });

  it('should enter a loading state while retrieving search results', function () {
    deferredActivities.resolve(pagedActivities);
    $scope.$digest();

    activityController.search();
    expect(activityController.activitiesLoading).toEqual(1);

    deferredActivities.resolve(pagedActivities);
    $scope.$digest();
    expect(activityController.activitiesLoading).toEqual(0);
  });

  it('should exit the loading state when search results fail to load', function () {
    activityController.search();
    expect(activityController.activitiesLoading).toEqual(2);

    deferredActivities.reject();
    $scope.$digest();
    expect(activityController.activitiesLoading).toEqual(0);
  });

  it('should exit the loading state when no valid passholders are found', function () {
    activityController = $controller('ActivityController', {
      passholder: null,
      passholders: null,
      bulkSelection: bulkSelection,
      activityService: activityService,
      DateRange: DateRange,
      $rootScope: $rootScope,
      $scope: $scope,
      activityMode: 'passholders',
      $state: $state,
      activeCounter: activeCounter
    });

    activityController.search();
    expect(activityController.activitiesLoading).toEqual(0);
  });

  it('should check in a passholder to an activity', function () {
    deferredActivities.resolve(pagedActivities);
    $scope.$digest();

    var deferredCheckin = $q.defer();

    var updatedActivity = angular.copy(activityController.activities[0]);
    updatedActivity.checkinConstraint.reason = 'MAXIMUM_REACHED';

    activityService.checkin.and.returnValue(deferredCheckin.promise);

    activityController.checkin(activityController.activities[0]);
    expect(activityController.activities[0].checkinBusy).toBeTruthy();

    deferredCheckin.resolve(updatedActivity);
    $scope.$digest();

    expect(activityService.checkin).toHaveBeenCalledWith(activityController.activities[0], passholder);
    expect(activityController.activities[0].checkinBusy).toBeFalsy();
    expect(activityController.activities[0].checkinConstraint.reason).toEqual('MAXIMUM_REACHED');
  });

  it('should set error values when checking in a passholder to an activity fails', function () {
    deferredActivities.resolve(pagedActivities);
    $scope.$digest();

    var deferredCheckin = $q.defer();

    var activity = {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'checkinConstraint': {
        'allowed': true,
        'startDate': new Date(1438584553 * 1000),
        'endDate': new Date(1438584553 * 1000),
        'reason': ''
      }
    };

    activityService.checkin.and.returnValue(deferredCheckin.promise);

    activityController.checkin(activity);
    expect(activity.checkinBusy).toBeTruthy();

    deferredCheckin.reject({
      code: 'CHECKIN_FAILED',
      title: 'Punten sparen mislukt',
      message: 'Het sparen van punt(en) voor ' + activity.title + ' is niet gelukt.'
    });
    $scope.$digest();

    expect(activityService.checkin).toHaveBeenCalledWith(activity, passholder);
    expect(activityController.activities[0].checkinBusy).toBeFalsy();
    expect(activityController.activities[0].checkinFailed).toBeTruthy();
  });

  it('should trigger the search parameters changed when the date range changes', function () {
    spyOn(activityController, 'searchParametersChanged');

    activityController.updateDateRange(activityController.dateRanges.PAST);

    expect(activityController.dateRange).toEqual(activityController.dateRanges.PAST);
    expect(activityController.searchParametersChanged).toHaveBeenCalled();
  });

  it('should trigger a pending state on activities when claiming a tariff inline', function () {
    var activity = angular.copy(pagedActivities.activities[0]);
    var tariff = activity.sales.tariffs.list[0];
    var deferredClaim = $q.defer();

    activityService.claimTariff.and.returnValue(deferredClaim.promise);

    activityController.claimTariff(tariff, activity);
    expect(activity.tariffClaimInProgress).toEqual(true);

    deferredClaim.resolve();
    $scope.$digest();
    expect(activity.tariffClaimInProgress).toEqual(false);
  });

  it('should set an error state on an activity when claiming a tariff fails', function () {
    var activity = angular.copy(pagedActivities.activities[0]);
    var tariff = activity.sales.tariffs.list[0];

    activityService.claimTariff.and.returnValue($q.reject('break stuff'));

    activityController.claimTariff(tariff, activity);
    expect(activity.tariffClaimInProgress).toEqual(true);
    $scope.$digest();
    expect(activity.tariffClaimInProgress).toEqual(false);
    expect(activity.tariffClaimError).toEqual('break stuff');
  });

  it('should refresh the list of activities when a tariff is claimed', function () {
    // when triggered by an external event, eg: when picking a tariff using a modal
    spyOn(activityController, 'search');

    var event = {};
    var activity = angular.copy(pagedActivities.activities[0]);

    activityController.updateClaimedTariffActivity(event, activity);
    expect(activityController.search).toHaveBeenCalled();

    // when claiming a tariff instantly
    activityController.search.calls.reset();
    activityService.claimTariff.and.returnValue($q.resolve());
    activityController.claimTariff({prices: ['priceInfo']}, {});

    $scope.$digest();
    expect(activityController.search).toHaveBeenCalled();
  });

  it('should correctly see if an activity was already claimed on current page', function () {

    var activity = angular.copy(pagedActivities.activities[0]);
    expect(activityController.isActivityClaimed(activity)).toBeFalsy();

    activityController.updateClaimedTariffActivity(event, activity);

    expect(activityController.isActivityClaimed(activity)).toBeTruthy();

  });

  it('should reset the search query and date range field when asked', function () {
    activityController.query = 'something';
    activityController.dateRange = DateRange.NEXT_12_MONTHS;

    activityController.resetSearchQuery();

    expect(activityController.query).toBe('');
    expect(activityController.dateRange).toBe(DateRange.TODAY);
  });

  it('should fetch an initial list of activities when multiple passholders were given', function () {
    activityController = $controller('ActivityController', {
      passholder: passholder,
      passholders: passholders,
      bulkSelection: bulkSelection,
      activityService: activityService,
      DateRange: DateRange,
      $rootScope: $rootScope,
      $scope: $scope,
      activityMode: 'counter',
      $state: $state,
      activeCounter: activeCounter
    });

    deferredActivities.resolve(pagedActivities);
    $scope.$digest();

    expect(activityService.search).toHaveBeenCalled();
    expect(activityController.activitiesLoading).toEqual(0);
  });

  it('should fill in the passholder property of the controller when mulitple passholders were given', function () {
    activityController = $controller('ActivityController', {
      passholder: null,
      passholders: passholders,
      bulkSelection: bulkSelection,
      activityService: activityService,
      DateRange: DateRange,
      $rootScope: $rootScope,
      $scope: $scope,
      activityMode: 'counter',
      $state: $state,
      activeCounter: activeCounter
    });

    $scope.$digest();

    expect(activityController.passholder).toEqual(passholder);
  });

  it('should fill in the passholder property of the controller when mulitple passholders were given but no one has a valid kansenstatuut', function () {
    delete passholder.kansenStatuten;

    passholder.uitPassen = [
      {
        number: '0930000422202',
        kansenStatuut: true,
        status: 'ACTIVE',
        type: 'CARD',
        cardSystem: {
          id: '1',
          name: 'UiTPAS Regio Aalst'
        }
      }
    ];

    var passholdersAlter = [
      passholder,
      passholder,
      passholder
    ];

    activityController = $controller('ActivityController', {
      passholder: null,
      passholders: passholdersAlter,
      bulkSelection: bulkSelection,
      activityService: activityService,
      DateRange: DateRange,
      $rootScope: $rootScope,
      $scope: $scope,
      activityMode: 'counter',
      $state: $state,
      activeCounter: activeCounter
    });

    $scope.$digest();

    expect(activityController.passholder).toEqual(passholder);
  });

  it('should fill in the passholder property of the controller when all passholders kansenstatuut expired', function () {
    passholder.kansenStatuten = [
      {
        status: 'EXPIRED',
        endDate: '2015-12-26',
        cardSystem: {
          id: '1',
          name: 'UiTPAS Regio Aalst'
        }
      }
    ];

    passholder.uitPassen = [
      {
        number: '0930000422202',
        kansenStatuut: true,
        status: 'ACTIVE',
        type: 'CARD',
        cardSystem: {
          id: '1',
          name: 'UiTPAS Regio Aalst'
        }
      }
    ];

    var passholdersAlter = [
      passholder,
      passholder,
      passholder
    ];

    activityController = $controller('ActivityController', {
      passholder: null,
      passholders: passholdersAlter,
      bulkSelection: bulkSelection,
      activityService: activityService,
      DateRange: DateRange,
      $rootScope: $rootScope,
      $scope: $scope,
      activityMode: 'counter',
      $state: $state,
      activeCounter: activeCounter
    });

    $scope.$digest();

    expect(activityController.passholder).toEqual(passholder);
  });
});
