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
        id: "points-promotion--678",
        title: "Testvoordeel beperkt per user",
        points: 2,
        exchangeable: true
      },
      {
        id: "points-promotion--677",
        title: "Testvoordeel beperkt in stock",
        points: 2,
        exchangeable: true
      },
      {
        id: "points-promotion--676",
        title: "Testvoordeel 2 punten onbeperkt",
        points: 2,
        exchangeable: true
      },
      {
        id: "points-promotion--193",
        title: "Gratis teaserticket en een 2de ticket voor de helft van de prijs",
        points: 10,
        exchangeable: true
      },
      {
        id: "welcome--5",
        title: "Theatercheque € 2,5 in cc De Werf",
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

});
