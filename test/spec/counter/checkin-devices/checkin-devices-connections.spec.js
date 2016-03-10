'use strict';

describe('Service: CheckInDevicesConnectionsController', function () {

  var apiUrl = 'http://example.com/';
  var $scope, $q, controller, CheckInDevices;
  var devices = [
    {
      id: 'foo',
      name: 'test device 1',
      state: {}

    },
    {
      id: 'bar',
      name: 'test device 2',
      activityId: '34475f7a-d1d5-481d-b205-9537ae0f9e73',
      state: {}
    }
  ];
  var activities = [{ 'asdf': 123123}];
  // expected generic error

  var deferredDevices, deferredActivities;

  // load the service's module
  beforeEach(module('ubr.utilities'));
  beforeEach(module('ubr.counter.checkin-devices', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  beforeEach(inject(function ($injector, _$rootScope_, $controller) {
    CheckInDevices = {};
    $q = $injector.get('$q');
    $scope = _$rootScope_.$new();

    CheckInDevices  = jasmine.createSpyObj('CheckInDevices', ['list', 'activities', 'connectDeviceToActivity']);

    deferredDevices = $q.defer();
    CheckInDevices.list.and.returnValue(deferredDevices.promise);

    deferredActivities = $q.defer();
    CheckInDevices.activities.and.returnValue(deferredActivities.promise);

    CheckInDevices.connectDeviceToActivity.and.returnValue($q.resolve());

    controller = $controller('CheckInDevicesConnectionsController', {
      $q: $q,
      CheckInDevices: CheckInDevices,
      $rootScope: _$rootScope_,
      $scope: $scope
    });
  }));

  it('should retrieve a list of devices and activities', function () {
    deferredDevices.resolve(devices);
    deferredActivities.resolve(activities);
    $scope.$digest();
    expect(CheckInDevices.list).toHaveBeenCalled();
    expect(CheckInDevices.activities).toHaveBeenCalled();

    expect(controller.devices).toEqual(devices);
    expect(controller.activities).toBe(activities);
    expect(controller.loadingData).toBe(false);
  });

  it('should do nothing if retrieval of devices and activities fails', function () {
    // TODO: this is probably bad ^
    deferredDevices.reject(devices);
    deferredActivities.resolve(activities);
    $scope.$digest();
    expect(controller.loadingData).toBe(true);
  });


  it('should connect devices to activities', function () {
    deferredDevices.resolve(devices);
    deferredActivities.resolve(activities);
    $scope.$digest();

    controller.connectDevicesToActivities();
    $scope.$digest();

    devices.forEach(function(device){
      expect(CheckInDevices.connectDeviceToActivity).toHaveBeenCalledWith(device.id, device.activityId);
    });
  });

  it('should set device state to failed if a request failed', function () {
    CheckInDevices.connectDeviceToActivity.and.returnValue($q.reject());

    deferredDevices.resolve(devices);
    deferredActivities.resolve(activities);
    $scope.$digest();

    controller.connectDevicesToActivities();
    $scope.$digest();
    deferredDevices.resolve(devices);
    devices.forEach(function(device){
      expect(CheckInDevices.connectDeviceToActivity).toHaveBeenCalledWith(device.id, device.activityId);
    });
  });

  it('should clear the state of a device', function () {
    var device = {};
    controller.clearState(device);
    expect(device.state).toBe(null);
  });
});
