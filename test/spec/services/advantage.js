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

  var $scope,$httpBackend, advantageService;
  beforeEach(inject(function ($injector, $rootScope) {
    advantageService = $injector.get('advantageService');
    $scope = $rootScope;
    $httpBackend = $injector.get('$httpBackend');
  }));

  it('should return a list of advantages for a given passholder', function (done) {
    var passholderId = '123-passholder';
    var advantagesData = [
      {
        id: 'points-promotion--678',
        title: 'Testvoordeel beperkt per user',
        points: 2,
        exchangeable: true
      },
      {
        id: 'points-promotion--677',
        title: 'Testvoordeel beperkt in stock',
        points: 2,
        exchangeable: true
      },
      {
        id: 'points-promotion--676',
        title: 'Testvoordeel 2 punten onbeperkt',
        points: 2,
        exchangeable: true
      },
      {
        id: 'points-promotion--193',
        title: 'Gratis teaserticket en een 2de ticket voor de helft van de prijs',
        points: 10,
        exchangeable: true
      },
      {
        id: 'welcome--5',
        title: 'Theatercheque € 2,5 in cc De Werf',
        points: 0,
        exchangeable: true
      }
    ];

    var advantagesRetrieved = function(advantages) {
      expect(advantages).toEqual(advantagesData);
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
