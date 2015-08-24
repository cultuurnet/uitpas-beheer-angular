'use strict';

describe('Controller: ActivityController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var $scope, $httpBackend, $q, activityController, activityService, DateRange;

  var deferredActivities;

  var pagedActivities = {
    activities: [
      {
        'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
        'title': 'Altijd open',
        'description': '',
        'when': ''
      },
      {
        'id': 'eb7c1532-dc32-43bf-a0be-1b9dcf52d2be',
        'title': 'Testevent punten sparen',
        'description': '',
        'when': ''
      }
    ],
    totalActivities: 2
  };

  var passholder = { passNumber: '01234567891234', points: 123 };

  beforeEach(inject(function ($injector, $rootScope){
    var $controller = $injector.get('$controller');
    $q = $injector.get('$q');
    deferredActivities = $q.defer();
    var activityPromise = deferredActivities.promise;
    activityService = $injector.get('activityService');
    DateRange = $injector.get('DateRange');
    $scope = $rootScope.$new();
    $httpBackend = $injector.get('$httpBackend');

    spyOn(activityService, 'search').and.returnValue(activityPromise);

    activityController = $controller('ActivityController', {
      passholder: passholder,
      activityService: activityService,
      DateRange: DateRange
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
      limit: 5

    };
    // reset the calls to not include the initial search
    activityService.search.calls.reset();

    activityController.searchParametersChanged();
    expect(activityService.search).toHaveBeenCalledWith(passholder, expectedSearchParameters);
  });

  it('should enter a loading state while retrieving search results', function (){
    deferredActivities.resolve(pagedActivities);
    $scope.$digest();

    activityController.search();
    expect(activityController.activitiesLoading).toEqual(1);

    deferredActivities.resolve(pagedActivities);
    $scope.$digest();
    expect(activityController.activitiesLoading).toEqual(0);
  });

  it('should exit the loading state when search results fail to load', function (){
    activityController.search();
    expect(activityController.activitiesLoading).toEqual(2);

    deferredActivities.reject();
    $scope.$digest();
    expect(activityController.activitiesLoading).toEqual(0);
  });

  it('should check in a passholder to an activity', function () {
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
        'startDate': new Date(1438584553*1000),
        'endDate': new Date(1438584553*1000),
        'reason': ''
      }
    };
    var updatedActivity = angular.copy(activity);
    updatedActivity.checkinConstraint.reason = 'MAXIMUM_REACHED';

    spyOn(activityService, 'checkin').and.returnValue(deferredCheckin.promise);

    activityController.checkin(activity);
    expect(activity.checkinBusy).toBeTruthy();

    deferredCheckin.resolve(updatedActivity);
    $scope.$digest();

    expect(activityService.checkin).toHaveBeenCalledWith(activity, passholder);
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
        'startDate': new Date(1438584553*1000),
        'endDate': new Date(1438584553*1000),
        'reason': ''
      }
    };

    spyOn(activityService, 'checkin').and.returnValue(deferredCheckin.promise);

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
});
