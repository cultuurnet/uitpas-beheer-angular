'use strict';

describe('Service: CheckInDevices', function () {

  var apiUrl = 'http://example.com/';
  var endpointUrl = apiUrl + 'checkindevices';
  var $scope, $q, $httpBackend, CheckInDevices;
  var devices = [
    {
      'id': 'foo',
      'name': 'test device 1'
    },
    {
      'id': 'bar',
      'name': 'test device 2',
      'activityId': '34475f7a-d1d5-481d-b205-9537ae0f9e73'
    }
  ];
  var activities = [{ 'asdf': 123123}];
  // expected generic error
  var expectedError = {
    type: 'error',
    exception: 'CultuurNet\\UiTPASBeheer\\Counter\\CounterNotSetException',
    message: 'No active counter set for the current user.',
    code: 'COUNTER_NOT_SET'
  };
  var activityId = 1245;
  var deviceId = 12444;

  // load the service's module
  beforeEach(module('ubr.counter.checkin-devices', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  beforeEach(inject(function ($injector, $rootScope) {
    $httpBackend = $injector.get('$httpBackend');
    CheckInDevices = $injector.get('CheckInDevices');
    $q = $injector.get('$q');
    $scope = $rootScope;
  }));

  it('should retrieve a list of devices', function (done) {
    $httpBackend
      .expectGET(endpointUrl)
      .respond(200, JSON.stringify(devices));

    function assertDevices(actualDevices) {
      expect(actualDevices).toEqual(devices);
      done();
    }

    CheckInDevices.list().then(assertDevices);
    $httpBackend.flush();
  });

  it('should throw an error when it cannot retrieve the devices', function(done) {
    // Mock an HTTP response.
    $httpBackend
      .expectGET(endpointUrl)
      .respond(400, JSON.stringify(expectedError));

    // make the service call
    CheckInDevices.list().catch(done);

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });

  it('should retrieve a list of activities', function (done) {
    $httpBackend
      .expectGET(endpointUrl + '/' + 'activities')
      .respond(200, JSON.stringify(activities));

    function assertResponse(response) {
      expect(response).toEqual(activities);
      done();
    }

    CheckInDevices.activities().then(assertResponse);
    $httpBackend.flush();
  });

  it('should throw an error when it cannot retrieve the activities', function(done) {
    // Mock an HTTP response.
    $httpBackend
      .expectGET(endpointUrl + '/' + 'activities')
      .respond(400, JSON.stringify(expectedError));

    // make the service call
    CheckInDevices.activities().catch(done);

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });

  it('should connect devices to activities', function (done) {
    $httpBackend
      .expectPOST(endpointUrl + '/' + deviceId, { 'activityId': activityId})
      .respond(200, JSON.stringify(activities));

    CheckInDevices.connectDeviceToActivity(deviceId, activityId).then(done);

    $httpBackend.flush();
  });

  it('should connect devices to activities when no activityId is given', function (done) {
    $httpBackend
      .expectPOST(endpointUrl + '/' + deviceId, { 'activityId': null})
      .respond(200, JSON.stringify(activities));

    CheckInDevices.connectDeviceToActivity(deviceId).then(done);

    $httpBackend.flush();
  });
});
