'use strict';

describe('Service: CheckInDevices', function () {

  var apiUrl = 'http://example.com/';
  var $scope, $q, $rootScope, $httpBackend, CheckInDevices;

  beforeEach(module('ubr.checkindevices'));

  // load the service's module
  beforeEach(module('ubr.checkindevices', function($provide) {
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

  fit('can retrieve a list of devices', function (done) {
    var devices = [
      {
        "id": "foo",
        "name": "test device 1"
      },
      {
        "id": "bar",
        "name": "test device 2",
        "activityId": "34475f7a-d1d5-481d-b205-9537ae0f9e73"
      }
    ];

    $httpBackend
      .expectGET('http://example.com/checkindevices')
      .respond(
        200,
        JSON.stringify(
          devices
        )
      );

    function assertDevices(actualDevices) {
      expect(actualDevices).toEqual(devices);
      done();
    }

    CheckInDevices.list().then(assertDevices);
    $httpBackend.flush();
  });
});
