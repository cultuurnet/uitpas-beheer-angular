'use strict';

describe('Service: eIdService', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
    var $window = jasmine.createSpy();
    $provide.value('$window', $window);
  }));

  // Instantiate service.
  var service, $q, $scope, $window;


  beforeEach(inject(function ($injector, $rootScope) {
    service = $injector.get('eIdService');
    $q = $injector.get('$q');
    $scope = $rootScope;
    $window = $injector.get('$window');
  }));

  it('should add some functions to $window on init', function () {
    service.init();
    expect($window.readEid).toBeDefined();
    expect($window.readEidPhoto).toBeDefined();
    expect($window.readEidError).toBeDefined();
  });

  it('should emit when the readId function is called', function () {
    var eIdData = {
      name: {
        first: 'firstName',
        last: 'lastName'
      },
      inszNumber: 'inszNumber',
      birth: {
        date: new Date('1985-05-05'),
        place: 'placeOfBirth'
      },
      gender: 'FEMALE',
      nationality: 'nationality',
      address: {
        street: 'street',
        postalCode: 'postalCode',
        city: 'city'
      }
    };

    service.init();
    spyOn($scope, '$emit');
    $window.readEid(
      eIdData.name.first,
      eIdData.name.last,
      eIdData.inszNumber,
      eIdData.birth.date,
      eIdData.birth.place,
      'F',
      eIdData.nationality,
      eIdData.address.street,
      eIdData.address.postalCode,
      eIdData.address.city
    );
    expect($scope.$emit).toHaveBeenCalledWith('eIdDataReceived', eIdData);
  });

  it('should emit when the readIdPhoto function is called', function () {
    var photo = 'base64PictureString';
    service.init();
    spyOn($scope, '$emit');
    $window.readEidPhoto(photo);
    expect($scope.$emit).toHaveBeenCalledWith('eIdPhotoReceived', photo);
  });

  it('should emit when the readIdError function is called', function () {
    var message = 'Could not read the eid.';
    service.init();
    spyOn($scope, '$emit');
    $window.readEidError(message);
    expect($scope.$emit).toHaveBeenCalledWith('eIdErrorReceived', message);
  });
});
