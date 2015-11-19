'use strict';

describe('Service: advantage', function () {

  // load the service's module
  beforeEach(module('uitpasbeheerApp'));

  var apiUrl = 'http://example.com/';

  // load the service's module
  beforeEach(module('uitpasbeheerApp', function($provide) {
      $provide.constant('appConfig', {
          apiUrl: apiUrl
      });
  }));

  var $scope,$httpBackend, advantageService, day;
  beforeEach(inject(function ($injector, $rootScope) {
    advantageService = $injector.get('advantageService');
    $scope = $rootScope;
    $httpBackend = $injector.get('$httpBackend');
    day = $injector.get('day');
  }));

  it('should return a list of advantages for a given passholder', function (done) {
    var passholderId = '123-passholder';
    var advantagesData = [
      {
        'id': 'welcome--390',
        'title': 'Korting op theaterticket.',
        'points': 5,
        'exchangeable': true,
        'description1': 'description 1: Nulla vitae elit libero, a pharetra augue. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Vestibulum id ligula porta felis euismod semper.',
        'description2': 'description 2: Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla vitae elit libero, a pharetra augue.',
        'validForCities': [
          'Leuven',
          'Aalst',
          'Mechelen',
          'Gent'
        ],
        'validForCounters': [],
        'endDate': '2016/09/10'
      }
    ];
    var expectedAdvantagesData = angular.copy(advantagesData);
    expectedAdvantagesData[0].endDate = day('2016/09/10', 'YYYY-MM-DD').toDate();

    var advantagesRetrieved = function(advantages) {
      expect(advantages).toEqual(expectedAdvantagesData);
      done();
    };

    $httpBackend
      .expectGET(apiUrl + 'passholders/' + passholderId + '/advantages')
      .respond(advantagesData);

    advantageService.list(passholderId)
      .then(advantagesRetrieved);

    $httpBackend.flush();
  });

  it('throws an error when it can\'t get a list of advantages for a given passholder', function (done) {
    var passholderId = '123-passholder';
    var APIError = {
      type: 'error',
      exception: 'CultuurNet/UiTPASBeheer/Counter/CounterNotSetException',
      message: 'No active counter set for the current user.',
      code: 'COUNTER_NOT_SET'
    };
    var expectedInternalError = {
      code: 'ADVANTAGES_NOT_FOUND',
      title: 'Advantages not found',
      message: 'No advantages found for passholder with identification number: 123-passholder'
    };

    var assertNoSuccess = function(advantage) {
      expect(advantage).toBeUndefined();
      done();
    };

    var assertRejectedWithError = function(response) {
      expect(response).toEqual(expectedInternalError);
      done();
    };

    $httpBackend
      .expectGET(apiUrl + 'passholders/' + passholderId + '/advantages')
      .respond(403, JSON.stringify(APIError));

    advantageService.list(passholderId)
      .then(assertNoSuccess, assertRejectedWithError);

    $httpBackend.flush();
  });

  it('should return a specified advantage', function() {
    var uitpasNumber = '0930000422202';
    var expectedAdvantage = {
      id: 'points-promotion--678',
      title: 'Testvoordeel beperkt per user',
      points: 2,
      exchangeable: true
    };

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'passholders/' + uitpasNumber + '/advantages/' + expectedAdvantage.id)
      .respond(200, JSON.stringify(expectedAdvantage));

    // Assertion method.
    var assertAdvantage = function(advantage) {
      expect(advantage).toEqual(expectedAdvantage);
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
    };

    // Request the advantage data and assert it when its returned.
    advantageService.find(uitpasNumber, expectedAdvantage.id).then(assertAdvantage, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    // Request the advantage data and assert it again, but this time without
    // mocking an HTTP request as the advantage object should have been cached.
    advantageService.find(uitpasNumber, expectedAdvantage.id).then(assertAdvantage, failed);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('throws an error when it can\'t return a specified advantage', function() {
    var uitpasNumber = '0930000422202';
    var expectedAdvantage = {
      id: 'points-promotion--678'
    };
    var APIError = {
      type: 'error',
      exception: 'CultuurNet/UiTPASBeheer/Counter/CounterNotSetException',
      message: 'No active counter set for the current user.',
      code: 'COUNTER_NOT_SET'
    };
    var expectedInternalError = {
      code: 'ADVANTAGE_NOT_FOUND',
      title: 'Advantage not found',
      message: 'No advantage with id points-promotion--678 found for passholder with identification number: 0930000422202'
    };

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'passholders/' + uitpasNumber + '/advantages/' + expectedAdvantage.id)
      .respond(403, JSON.stringify(APIError));

    // Assertion method.
    var assertAdvantage = function(advantage) {
      expect(advantage).toBeUndefined();
    };

    var failed = function(error) {
      expect(error).toEqual(expectedInternalError);
    };

    // Request the advantage data and assert it when its returned.
    advantageService.find(uitpasNumber, expectedAdvantage.id).then(assertAdvantage, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exchange an advantage', function (done) {
    var uitpasNumber = '0930000422202';
    var expectedAdvantage = {
      id: 'points-promotion--678',
      title: 'Testvoordeel beperkt per user',
      points: 2,
      exchangeable: true
    };
    spyOn($scope, '$emit');

    // Mock an HTTP response.
    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber + '/advantages/exchanges', {id: expectedAdvantage.id})
      .respond(200, JSON.stringify(expectedAdvantage));

    // Assertion method.
    var assertAdvantage = function(updatedAdvantage) {
      expect(updatedAdvantage).toEqual(expectedAdvantage);
      expect($scope.$emit).toHaveBeenCalledWith('advantageExchanged', updatedAdvantage, uitpasNumber);
      done();
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
      done();
    };

    // Request the advantage data and assert it when its returned.
    advantageService.exchange(expectedAdvantage.id, uitpasNumber).then(assertAdvantage, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();
  });

  it('throws an error when it fails to exchange an advantage', function (done) {
    var uitpasNumber = '0930000422202';
    var advantageId = 'points-promotion--678';
    var expectedError = {
      code: '65',
      message: 'No go!'
    };
    spyOn($scope, '$emit');

    // Mock an HTTP response.
    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber + '/advantages/exchanges', {id: advantageId})
      .respond(404, JSON.stringify(expectedError));

    // Assertion method.
    var assertAdvantage = function(updatedAdvantage) {
      expect(updatedAdvantage).toBeUndefined();
      done();
    };

    var failed = function(error) {
      expect(error).toEqual(expectedError);
      expect($scope.$emit).not.toHaveBeenCalled();
      done();
    };

    // Request the advantage data and assert it when its returned.
    advantageService.exchange(advantageId, uitpasNumber).then(assertAdvantage, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();
  });
});
