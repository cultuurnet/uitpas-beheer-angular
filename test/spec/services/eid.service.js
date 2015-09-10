'use strict';

describe('Service: eIdService', function () {

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
  var service, $q, $scope, $window, $interval;

  var eIdRawData = {
    name: {
      first: 'Alberto',
      last: 'Contador'
    },
    inszNumber: '720923-383-17',
    birth: {
      date: moment('1972-09-23').toDate(  ),
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

  var eIdFormattedBirthDate = moment(eIdRawData.birth.date).format('DD/MM/YYYY');

  var eIdRawPhoto = 'base64PictureString';


  beforeEach(inject(function ($injector, $rootScope) {
    service = $injector.get('eIdService');
    $q = $injector.get('$q');
    $scope = $rootScope;
    $window = $injector.get('$window');
    $interval = $injector.get('$interval');
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
      eIdRawData.name.first,
      eIdRawData.name.last,
      eIdRawData.inszNumber,
      eIdFormattedBirthDate,
      eIdRawData.birth.place,
      'M',
      eIdRawData.nationality,
      eIdRawData.address.street,
      eIdRawData.address.postalCode,
      eIdRawData.address.city
    );
    expect($scope.$emit).toHaveBeenCalledWith('eIdDataReceived', eIdRawData);
  });

  it('should emit when the readIdPhoto function is called', function () {
    service.init();
    spyOn($scope, '$emit');
    $window.readEidPhoto(eIdRawPhoto);
    expect($scope.$emit).toHaveBeenCalledWith('eIdPhotoReceived', eIdRawPhoto);
  });

  it('should emit when the readIdError function is called', function () {
    var message = 'Could not read the eid.';
    service.init();
    spyOn($scope, '$emit');
    $window.readEidError(message);
    expect($scope.$emit).toHaveBeenCalledWith('eIdErrorReceived', message);
  });

  it('should request to read the eId', function () {
    service.getDataFromEId();
    expect($window.alert).toHaveBeenCalled();
  });

  it('should accept both F and V values for the female gender', function() {
    service.init();
    spyOn($scope, '$emit');

    eIdRawData.gender = 'FEMALE';
    var expectedEmitArgs = [
      'eIdDataReceived',
      eIdRawData
    ];

    $window.readEid(
      eIdRawData.name.first,
      eIdRawData.name.last,
      eIdRawData.inszNumber,
      eIdFormattedBirthDate,
      eIdRawData.birth.place,
      'F',
      eIdRawData.nationality,
      eIdRawData.address.street,
      eIdRawData.address.postalCode,
      eIdRawData.address.city
    );

    expect($scope.$emit.calls.count()).toEqual(1);
    expect($scope.$emit.calls.mostRecent().args).toEqual(expectedEmitArgs);

    $window.readEid(
      eIdRawData.name.first,
      eIdRawData.name.last,
      eIdRawData.inszNumber,
      eIdFormattedBirthDate,
      eIdRawData.birth.place,
      'V',
      eIdRawData.nationality,
      eIdRawData.address.street,
      eIdRawData.address.postalCode,
      eIdRawData.address.city
    );

    expect($scope.$emit.calls.count()).toEqual(2);
    expect($scope.$emit.calls.mostRecent().args).toEqual(expectedEmitArgs);
  });
});
