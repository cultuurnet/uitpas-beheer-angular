'use strict';

describe('Controller: CountersController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  function Tracker(name) {
    this.name = name;
    this.get = function(key) {
      return name;
    }
  }

  var CountersController, GoogleAnalyticsService, $scope, $location, counterService, $q, $state;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _$q_, _counterService_, _$state_) {
    counterService = _counterService_;
    $location = jasmine.createSpyObj('$location', ['path']);
    GoogleAnalyticsService = jasmine.createSpyObj('GoogleAnalyticsService', ['isEnabled', 'getTrackers', 'setVariable', 'sendEvent'])

    GoogleAnalyticsService.isEnabled.and.returnValue(true);
    GoogleAnalyticsService.getTrackers.and.returnValue([
      new Tracker('name')
    ]);

    $scope = $rootScope.$new();
    $state = _$state_;
    $q = _$q_;

    CountersController = $controller('CountersController', {
      $location: $location,
      counterService: counterService,
      GoogleAnalyticsService: GoogleAnalyticsService,
      list:
        {
          '1149': {
            'id': '1149',
            'consumerKey': '9d466f7f88231cf298d5cb5dd23d55af',
            'name': 'KSA-VKSJ Denderhoutem',
            'role': 'member',
            'actorId': 'c1372ef5-65db-4f95-aa2f-478fb5b58258',
            'cardSystems': {
              '1': {
                'permissions': [],
                'groups': ['Checkin and Ticket balies'],
                'id': 1,
                'name': 'UiTPAS Regio Aalst',
                'distributionKeys': []
              }
            },
            'permissions': [],
            'groups': ['Checkin and Ticket balies']
          },
          '1059': {
            'id': '1059',
            'consumerKey': '0032c67a801248935cf48826c4f14e81',
            'name': '\u0027t ezelsploin vzw',
            'role': 'member',
            'actorId': '83ea7679-3c0a-4a45-ad0b-6ff20d0412f5',
            'cardSystems': {
              '1': {
                'permissions': [],
                'groups': ['Checkin and Ticket balies'],
                'id': 1,
                'name': 'UiTPAS Regio Aalst',
                'distributionKeys': []
              }
            },
            'permissions': [],
            'groups': ['Checkin and Ticket balies']
          }
        },
      lastActiveId: '1149'
    });
  }));
  
  it('sets the last active counter and populates the list', function () {
    expect(CountersController.lastActiveId).toBe('1149');
    expect(CountersController.lastActive.name).toBe('KSA-VKSJ Denderhoutem');
    expect(CountersController.total).toBe(2);
    expect(CountersController.list.length).toBe(1);
  });

  it('Can activate a counter', function (done) {
    var counterToActivate = {
        id: 1,
        name: 'counter'
      },
      deferredActivation = $q.defer(),
      activeCounterPromise = deferredActivation.promise;

    var counterActivated = function () {
      expect($state.go).toHaveBeenCalledWith('counter.main');
      expect(GoogleAnalyticsService.setVariable).toHaveBeenCalledWith('name', 'dimension1', 1);
      expect(GoogleAnalyticsService.setVariable).toHaveBeenCalledWith('name', 'dimension2', 'counter');
      expect(GoogleAnalyticsService.sendEvent).toHaveBeenCalledWith('name', 'pageview');
      done();
    };

    spyOn(counterService, 'setActive').and.returnValue(activeCounterPromise);
    spyOn($state, 'go');

    CountersController.setActiveCounter(counterToActivate);
    expect(counterService.setActive).toHaveBeenCalledWith(counterToActivate);

    deferredActivation.resolve();
    activeCounterPromise.finally(counterActivated);
    $scope.$digest();
  });
});
