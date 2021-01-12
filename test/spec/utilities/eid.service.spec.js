'use strict';

describe('Service: eIDService', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
    $window = jasmine.createSpy();
    $window.alert = jasmine.createSpy('$window.alert');
    $provide.value('$window', $window);
  }));

  // Instantiate service.
  var service, $q, $scope, $window, $interval, day;

  var eIDRawData;

  var eIDRawPhoto = 'base64PictureString';


  beforeEach(inject(function ($injector, $rootScope) {
    service = $injector.get('eIDService');
    $q = $injector.get('$q');
    day = $injector.get('day');
    $scope = $rootScope;
    $window = $injector.get('$window');
    $interval = $injector.get('$interval');

    eIDRawData = {
      name: {
        first: 'Alberto',
        last: 'Contador'
      },
      inszNumber: '720923-383-17',
      birth: {
        date: '23/09/1972',
        place: 'Madrid'
      },
      gender: 'MALE',
      nationality: 'Spaans',
      address: {
        street: 'Calle Alava',
        postalCode: '28017',
        city: 'Madrid'
      }
    };
  }));

  it('should add some functions to $window on init', function () {
    service.init();
    expect($window.readEid).toBeDefined();
    expect($window.readEidPhoto).toBeDefined();
    expect($window.readEidError).toBeDefined();
  });

  it('should emit when the readId function is called', function () {
    service.init();
    spyOn($scope, '$emit');
    $window.readEid(
      eIDRawData.name.first,
      eIDRawData.name.last,
      eIDRawData.inszNumber,
      eIDRawData.birth.date,
      eIDRawData.birth.place,
      'M',
      eIDRawData.nationality,
      eIDRawData.address.street,
      eIDRawData.address.postalCode,
      eIDRawData.address.city,
      'somePicture'
    );

    var expectedData = angular.copy(eIDRawData);
    expectedData.birth.date = day(expectedData.birth.date, 'D/M/YYYY').toDate();

    expect($scope.$emit).toHaveBeenCalledWith('eIDDataReceived', expectedData, 'somePicture');
  });

  it('should emit when the readIdPhoto function is called', function () {
    service.init();
    spyOn($scope, '$emit');
    $window.readEidPhoto(eIDRawPhoto);
    expect($scope.$emit).toHaveBeenCalledWith('eIDPhotoReceived', eIDRawPhoto);
  });

  it('should emit when the readIdError function is called', function () {
    var message = 'Could not read the eid.';
    service.init();
    spyOn($scope, '$emit');
    $window.readEidError(message);
    expect($scope.$emit).toHaveBeenCalledWith('eIDErrorReceived', message);
  });

  it('should request to read the eID', function () {
    service.getDataFromEID();
    expect($window.alert).toHaveBeenCalled();
  });

  it('should accept both F and V values for the female gender', function() {
    service.init();
    spyOn($scope, '$emit');

    eIDRawData.gender = 'FEMALE';
    var expectedData = angular.copy(eIDRawData);
    expectedData.birth.date = day(expectedData.birth.date, 'D/M/YYYY').toDate();
    var expectedEmitArgs = [
      'eIDDataReceived',
      expectedData,
      undefined
    ];

    $window.readEid(
      eIDRawData.name.first,
      eIDRawData.name.last,
      eIDRawData.inszNumber,
      eIDRawData.birth.date,
      eIDRawData.birth.place,
      'F',
      eIDRawData.nationality,
      eIDRawData.address.street,
      eIDRawData.address.postalCode,
      eIDRawData.address.city
    );

    expect($scope.$emit.calls.count()).toEqual(1);
    expect($scope.$emit.calls.mostRecent().args).toEqual(expectedEmitArgs);

    $window.readEid(
      eIDRawData.name.first,
      eIDRawData.name.last,
      eIDRawData.inszNumber,
      eIDRawData.birth.date,
      eIDRawData.birth.place,
      'V',
      eIDRawData.nationality,
      eIDRawData.address.street,
      eIDRawData.address.postalCode,
      eIDRawData.address.city
    );

    expect($scope.$emit.calls.count()).toEqual(2);
    expect($scope.$emit.calls.mostRecent().args).toEqual(expectedEmitArgs);
  });
});
