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
    expect($window.readId).toBeDefined();
    expect($window.readIdPhoto).toBeDefined();
  });

  it('should emit when the readId function is called', function () {
    var eIdData = {
      name: {
        first: 'firstName',
        last: 'lastName'
      },
      inszNumber: 'inszNumber',
      birth: {
        date: 'dateOfBirth',
        place: 'placeOfBirth'
      },
      gender: 'gender',
      nationality: 'nationality',
      contact: {
        street: 'street',
        postalCode: 'postalCode',
        city: 'city'
      }
    };

    service.init();
    spyOn($scope, '$emit');
    $window.readId(
      eIdData.name.first,
      eIdData.name.last,
      eIdData.inszNumber,
      eIdData.birth.date,
      eIdData.birth.place,
      eIdData.gender,
      eIdData.nationality,
      eIdData.contact.street,
      eIdData.contact.postalCode,
      eIdData.contact.city
    );
    expect($scope.$emit).toHaveBeenCalledWith('eIdDataReceived', eIdData);
  });

  it('should emit when the readIdPhoto function is called', function () {
    var photo = 'base64PictureString';
    service.init();
    spyOn($scope, '$emit');
    $window.readIdPhoto(photo);
    expect($scope.$emit).toHaveBeenCalledWith('eIdPhotoReceived', photo);
  });
});
