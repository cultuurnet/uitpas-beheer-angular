'use strict';

describe('Service: passholderService', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  // Instantiate service.
  var passholderService, $httpBackend, $q, $scope, $rootScope, Passholder, Pass, $cacheFactory, SearchParameters, PassholderSearchResults, Coupon;

  var identityData = {
    'uitPas': {
      'number': '0930000422202',
      'kansenStatuut': false,
      'status': 'ACTIVE'
    },
    'passHolder': {
      'uid': 'iewydej',
      'name': {
        'first': 'Cassandra Ama',
        'last': 'Boadu'
      },
      'address': {
        'street': 'Steenweg op Aalst 94',
        'postalCode': '9308',
        'city': 'Aalst'
      },
      'birth': {
        'date': '2003-12-06',
        'place': 'Sint-Agatha-Berchem'
      },
      'gender': 'FEMALE',
      'nationality': 'Belg',
      'privacy': {
        'email': false,
        'sms': false
      },
      'kansenStatuten': [],
      'inszNumber': '930518-223-61',
      'points': 123
    }
  };

  function getPassData() {
    return angular.copy(identityData);
  }

  beforeEach(inject(function ($injector, _$rootScope_) {
    $httpBackend = $injector.get('$httpBackend');
    passholderService = $injector.get('passholderService');
    $q = $injector.get('$q');
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    Passholder = $injector.get('Passholder');
    Pass = $injector.get('Pass');
    $cacheFactory = $injector.get('$cacheFactory');
    SearchParameters = $injector.get('SearchParameters');
    PassholderSearchResults = $injector.get('PassholderSearchResults');
    Coupon = $injector.get('Coupon');
  }));

  it('returns a pass from the server and keeps it cached', function() {
    var uitpasNumber = '0930000422202';
    var expectedPass= new Pass(identityData);

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(200, JSON.stringify(identityData));

    // Assertion method.
    var assertPass = function(pass) {
      expect(pass).toEqual(expectedPass);
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
    };

    // Request the passholder data and assert it when its returned.
    passholderService.findPass(uitpasNumber).then(assertPass, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    // Request the passholder data and assert it again, but this time without
    // mocking an HTTP request as the passholder object should have been cached.
    passholderService.findPass(uitpasNumber).then(assertPass, failed);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('throws an error when the pass request returns an error', function(done) {
    var uitpasNumber = 'thisIsANumber';
    var expectedError = {
      type: 'error',
      exception: 'CultuurNet\\UiTPASBeheer\\PassHolder\\PassHolderNotFoundException',
      message: 'No passholder found with this identification.',
      code: 'PASSHOLDER_NOT_FOUND'
    };

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(404, JSON.stringify(expectedError));
    // Request the passholder data and assert it when its returned.
    passholderService.findPass(uitpasNumber).catch(done);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should block a pass', function() {
    var pass = identityData.uitPas;

    var expectedPass = angular.copy(pass);
    expectedPass.status = 'BLOCKED';

    // Fill the cache so we can check later that it's empty again.
    var passholderCache = $cacheFactory.get('passholderCache');
    var passholderIdCache = $cacheFactory.get('passholderIdCache');
    passholderCache.put(pass.number, pass);
    passholderIdCache.put(pass.number, pass.number);

    // Mock an HTTP response.
    $httpBackend
      .expectDELETE(apiUrl + 'uitpas/' + pass.number)
      .respond(200, JSON.stringify(expectedPass));

    var assertPass = function(pass) {
      expect(pass).toEqual(expectedPass);
      expect(passholderCache.get(pass.number)).toEqual(undefined);
      expect(passholderIdCache.get(pass.number)).toEqual(undefined);
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
    };

    passholderService.blockPass(pass.number).then(assertPass, failed);

    $httpBackend.flush();
  });

  it('throws an error when the block request returns an error', function() {
    var pass = identityData.uitPas;
    var httpError = {
      code: 'INVALID_STATUS',
      message: 'The uitpas is already blocked.'
    };
    var expectedErrorCode = httpError.code;

    // Mock an HTTP response.
    $httpBackend
      .expectDELETE(apiUrl + 'uitpas/' + pass.number)
      .respond(400, JSON.stringify(httpError));

    var failed = function(errorCode) {
      expect(errorCode).toEqual(expectedErrorCode);
    };

    passholderService.blockPass(pass.number).catch(failed);

    $httpBackend.flush();
  });

  it('returns a passholder from the server and keeps it cached', function() {
    var uitpasNumber = '0930000422202';
    var expectedPassholder = new Passholder(identityData.passHolder);
    expectedPassholder.passNumber = uitpasNumber;

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(200, JSON.stringify(identityData));

    // Assertion method.
    var assertPassholder = function(passholder) {
      expect(passholder).toEqual(expectedPassholder);
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
    };

    // Request the passholder data and assert it when its returned.
    passholderService.findPassholder(uitpasNumber).then(assertPassholder, failed);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    // Request the passholder data and assert it again, but this time without
    // mocking an HTTP request as the passholder object should have been cached.
    passholderService.findPassholder(uitpasNumber).then(assertPassholder, failed);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('throws an error when the passholder request returns an error', function(done) {
    var uitpasNumber = 'thisIsANumber';
    var expectedError = {
      type: 'error',
      exception: 'CultuurNet\\UiTPASBeheer\\PassHolder\\PassHolderNotFoundException',
      message: 'No passholder found with this identification.',
      code: 'PASSHOLDER_NOT_FOUND'
    };

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(404, JSON.stringify(expectedError));

    // Request the passholder data and assert it when its returned.
    passholderService.findPassholder(uitpasNumber).catch(done);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should persist and cache passholders', function (done) {
    var uitpasNumber = '0930000422202';
    var pass = new Pass(identityData);
    var passholderPostData = pass.passholder;
    passholderPostData.name.last = 'New last name';
    passholderPostData.address.city = 'Leuven';

    var identityResponseData = angular.copy(identityData);
    identityResponseData.passHolder.name.last = 'New last name';
    identityResponseData.passHolder.address.city = 'Leuven';

    var expectedPassholderData = passholderPostData.serialize();

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber, expectedPassholderData)
      .respond(200, JSON.stringify(expectedPassholderData));

    $httpBackend
      .expectGET(apiUrl + 'identities/' + uitpasNumber)
      .respond(200, JSON.stringify(identityResponseData));

    var assertCachedAndPersisted = function (response) {
      expect(passholderService.findPass).toHaveBeenCalled();

      expect(response).toEqual(passholderPostData);

      var passholderCache = $cacheFactory.get('passholderCache');
      var cachedPass = passholderCache.get(uitpasNumber);
      expect(cachedPass).toEqual(pass);
      done();
    };
    spyOn(passholderService, 'findPass').and.callThrough();

    passholderService.update(passholderPostData, uitpasNumber).then(assertCachedAndPersisted);
    $httpBackend.flush();
  });

  it('throws an error with additional info when the passholder can\'t be updated on the server', function (done) {
    var uitpasNumber = '0930000422202';
    var pass = new Pass(identityData);
    var passholderPostData = pass.passholder;

    var expectedAPIError = {
      code: 'Some error code'
    };

    var expectedInternalError = {
      code: 'PASSHOLDER_NOT_UPDATED_ON_SERVER',
      title: 'Passholder not updated on server',
      message: 'The passholder could not be updated on the server: Some error code',
      apiError: expectedAPIError
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber, passholderPostData.serialize())
      .respond(403, JSON.stringify(expectedAPIError));

    var assertRejectedWithError = function (response) {
      expect(response).toEqual(expectedInternalError);
      done();
    };

    var assertNoSuccess = function () {
      expect(passholderService.findPass).not.toHaveBeenCalled();
      done();
    };

    passholderService.update(passholderPostData, uitpasNumber).then(assertNoSuccess, assertRejectedWithError);
    $httpBackend.flush();
  });

  it('throws an error without additional info when the passholder can\'t be updated on the server', function (done) {
    var uitpasNumber = '0930000422202';
    var pass = new Pass(identityData);
    var passholderPostData = pass.passholder;

    var expectedAPIError = {};

    var expectedInternalError = {
      code: 'PASSHOLDER_NOT_UPDATED_ON_SERVER',
      title: 'Passholder not updated on server',
      message: 'The passholder could not be updated on the server.',
      apiError: expectedAPIError
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber, passholderPostData.serialize())
      .respond(403, JSON.stringify(expectedAPIError));

    var assertRejectedWithError = function (response) {
      expect(response).toEqual(expectedInternalError);
      done();
    };

    var assertNoSuccess = function () {
      expect(passholderService.findPass).not.toHaveBeenCalled();
      done();
    };

    passholderService.update(passholderPostData, uitpasNumber).then(assertNoSuccess, assertRejectedWithError);
    $httpBackend.flush();
  });

  it('should refetch and cache the passholder when an advantage is exchanged', function () {
    // Exhange an advantage with less points.
    var deferredPassholder = $q.defer();
    var passholderPromise = deferredPassholder.promise;

    var passholder = new Passholder(identityData.passHolder);
    var advantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 2,
      title: 'untitled'
    };

    spyOn(passholderService, 'findPassholder').and.returnValue(passholderPromise);
    passholderService.updatePoints('advantageExchanged', advantage, identityData.uitPas.number);

    deferredPassholder.resolve(passholder);
    $scope.$digest();

    expect(passholderService.findPassholder).toHaveBeenCalled();

    // Exhange an advantage with more points.
    advantage.points = 125;
    passholderService.updatePoints('advantageExchanged', advantage, identityData.uitPas.number);

    deferredPassholder.resolve(passholder);
    $scope.$digest();

    expect(passholderService.findPassholder).toHaveBeenCalled();
  });

  it('should register a passholder', function () {
    var pass = new Pass(identityData);

    var registration = {
      passHolder: pass.passholder.serialize()
    };

    $httpBackend
      .expectPUT(apiUrl + 'passholders/' + pass.number, registration)
      .respond(200);

    passholderService.register(pass, pass.passholder, false, false);
    $httpBackend.flush();
  });

  it('should find coupons by pass numbers', function (done) {
    var uitpasNumber = '123456789';

    var expectedCoupons = [
      new Coupon({
        'id': '0',
        'name': 'Cultuurbon',
        'conditions': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
        'date': '2015-12-26',
        'remainingTotal': 4
      }),
      new Coupon({
        'id': '1',
        'name': 'Cultuurbon2',
        'conditions': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
        'date': '2015-11-26',
        'remainingTotal': 5
      })
    ];

    function assertCoupons(coupons) {
      expect(coupons).toEqual(expectedCoupons);
      done();
    }

    $httpBackend
      .expectGET(apiUrl + 'passholders/' + uitpasNumber + '/coupons?max=20')
      .respond(200, expectedCoupons);

    passholderService
      .getCoupons(uitpasNumber)
      .then(assertCoupons);

    $httpBackend.flush();
  });

  it('throws an error when it fails to register a passholder', function (done) {
    var pass = new Pass(identityData);

    var registration = {
      passHolder: pass.passholder.serialize()
    };

    var expectedError = {data: {code: 'ERROR'}};

    var assertRegistered = function (registrationResponse) {
      expect(registrationResponse).toBeUndefined();
      done();
    };

    var assertFail = function (error) {
      expect(error).toEqual(expectedError);
      done();
    };

    $httpBackend
      .expectPUT(apiUrl + 'passholders/' + pass.number, registration)
      .respond(404, expectedError);

    passholderService.register(pass, pass.passholder, false, false).then(
      assertRegistered,
      assertFail
    );
    $httpBackend.flush();
  });

  it('should register a passholder with a voucher and kansenStatuut', function () {
    identityData.uitPas.kansenStatuut = true;
    var pass = new Pass(identityData);
    var voucher = 'voucher';
    var kansenstatuutInfo = {
      endDate: new Date('2011-11-11'),
      remarks: 'remarks',
      includeRemarks: true
    };

    var registration = {
      passHolder: pass.passholder.serialize(),
      voucherNumber: voucher,
      kansenStatuut: {
        endDate: '2011-11-11',
        remarks: 'remarks'
      }
    };

    $httpBackend
      .expectPUT(apiUrl + 'passholders/' + pass.number, registration)
      .respond(200);

    passholderService.register(pass, pass.passholder, voucher, kansenstatuutInfo);
    $httpBackend.flush();
  });

  it('should not register a kansenstatuut pass when additional information is missing', function () {
    identityData.uitPas.kansenStatuut = true;
    var pass = new Pass(identityData);

    var registrationCall = function () {
      passholderService.register(pass, pass.passholder, null);
    };

    expect(registrationCall).toThrowError('Registration for a pass with kansenstatuut should provide additional info.');
  });

  it('should update the kansenstatuut of a passholder when renewing', function (done) {
    var passData = getPassData();
    passData.passHolder.kansenStatuten = [{
      status: 'ACTIVE',
      endDate: '2015-12-06',
      cardSystem: {
        name: 'UiTPAS Regio Aalst',
        id: '1'
      }
    }];
    var pass = new Pass(passData);
    var passholder = pass.passholder;
    var kansenstatuut = passholder.kansenStatuten[0];
    var endDate = new Date('2345-01-01');
    var updateData = {
      endDate: '2345-01-01'
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + pass.number + '/kansenstatuten/' + 1, updateData)
      .respond(200);

    passholderService
      .renewKansenstatuut(passholder, kansenstatuut, endDate)
      .then(done);

    $httpBackend.flush();
  });

  it('should patch the passholder when updating passholder remarks', function (done) {
    var pass = new Pass(getPassData());
    var passholder = pass.passholder;
    var remarks = 'remarkable';
    var expectedData = passholder.serialize();
    expectedData.remarks = 'remarkable';

    spyOn(passholderService, 'findPass').and.returnValue($q.resolve(pass));

    $httpBackend
       .expectPOST(apiUrl + 'passholders/' + pass.number, expectedData)
       .respond(200, expectedData);

    passholderService
      .updateRemarks(passholder, remarks)
      .then(done);

    $httpBackend.flush();
  });

  it('should update and cache both pass and passholder when replacing a pass and return the new pass', function (done) {
    var pass = new Pass(getPassData());
    var expectedPassholder = pass.passholder;
    var reason = 'SELF_DESTRUCTED';
    var kansenStatuutEndDate = new Date('1955-05-05');
    var voucherNumber = 'v-o-u-c-h-e-r';

    var expectedPostParameters = {
      reason: 'SELF_DESTRUCTED',
      voucherNumber: 'v-o-u-c-h-e-r',
      kansenStatuut: {
        endDate: '1955-05-05'
      },
      passholderUid: 'iewydej'
    };

    var assertNewPassholder = function (assignedPass) {
      expect(assignedPass.passholder).toEqual(expectedPassholder);
      done();
    };

    $httpBackend
      .expectPUT(apiUrl + 'uitpas/0930000422202', expectedPostParameters)
      .respond(200, 'all good bro');

    $httpBackend
      .expectGET(apiUrl + 'identities/0930000422202')
      .respond(200, getPassData());

    passholderService.newPass(pass, 'iewydej', reason, kansenStatuutEndDate, voucherNumber);
    passholderService
      .findPass(pass.number)
      .then(assertNewPassholder);

    $scope.$apply();
    $httpBackend.flush();
  });

  it('should find passholders by pass numbers', function (done) {
    var jsonSearchParametersUitpasNumbers = {
      page: 2,
      limit: 15,
      uitpasNumbers: [
        '0987654321012',
        '0987654321013',
        '0987654321014',
        '0987654321015',
        '0987654321016',
        '0987654321017',
        '0987654321018',
        '0987654321019',
        '0987654321020'
      ],
      mode: 'NUMBER'
    };
    var searchParametersUitpasNumbers = new SearchParameters(jsonSearchParametersUitpasNumbers);

    var jsonIdentity = {
      'uitPas': {
        'number': '0930000422202',
        'kansenStatuut': false,
        'status': 'ACTIVE'
      },
      'passHolder': {
        'name': {
          'first': 'Victor',
          'last': 'D\'Hooghe'
        },
        'address': {
          'street': 'Baanweg 60',
          'postalCode': '9308',
          'city': 'Aalst'
        },
        'birth': {
          'date': '2007-11-15',
          'place': 'Aalst'
        },
        'gender': 'MALE',
        'nationality': 'belg',
        'privacy': {
          'email': false,
          'sms': false
        },
        'contact': {
          'email': 'email@email.com'
        },
        kansenStatuten: [{
          status: 'ACTIVE',
          endDate: '2015-12-06',
          cardSystem: {
            name: 'UiTPAS Regio Aalst',
            id: '1'
          }
        }],
        uitPassen: [],
        'points': 309,
        'picture': 'picture-in-base64-format',
        'remarks': 'remarks',
        'uid': 'e1e2b335-e756-4e72-bb0f-3d163a583b35'
      }
    };
    var jsonResultCollection = {
      itemsPerPage: 10,
      totalItems: 50,
      member: [
        jsonIdentity,
        jsonIdentity,
        jsonIdentity,
        jsonIdentity,
        jsonIdentity,
        jsonIdentity,
        jsonIdentity,
        jsonIdentity,
        jsonIdentity,
        jsonIdentity
      ],
      invalidUitpasNumbers: [
        '0987654321012',
        '0987654321013',
        '0987654321014',
        '0987654321015',
        '0987654321016'
      ],
      firstPage: 'http://culpas-silex.dev/passholders?page=1',
      lastPage: 'http://culpas-silex.dev/passholders?page=5',
      previousPage: 'http://culpas-silex.dev/passholders?page=1',
      nextPage: 'http://culpas-silex.dev/passholders?page=2'
    };

    $httpBackend
      .expectGET(apiUrl + 'passholders?limit=15&page=2&uitpasNumber%5B%5D=0987654321012&uitpasNumber%5B%5D=0987654321013&uitpasNumber%5B%5D=0987654321014&uitpasNumber%5B%5D=0987654321015&uitpasNumber%5B%5D=0987654321016&uitpasNumber%5B%5D=0987654321017&uitpasNumber%5B%5D=0987654321018&uitpasNumber%5B%5D=0987654321019&uitpasNumber%5B%5D=0987654321020')
      .respond(200, JSON.stringify(jsonResultCollection));

    var assertCorrectSearchResultData = function (data) {
      expect(data).toEqual(new PassholderSearchResults(jsonResultCollection));
      done();
    };

    var assertNoError = function (error) {
      expect(error).toBeUndefined();
    };

    passholderService
      .findPassholders(searchParametersUitpasNumbers)
      .then(assertCorrectSearchResultData, assertNoError);

    $httpBackend.flush();
  });

  it('should reject with a known API error when it can not find passholders by pass numbers', function (done) {
    var jsonSearchParametersUitpasNumbers = {
      page: 2,
      limit: 15,
      uitpasNumbers: []
    };
    var searchParametersUitpasNumbers = new SearchParameters(jsonSearchParametersUitpasNumbers);

    var error = {
      code: 'PARSE_INVALID_UITPASNUMBER'
    };

    $httpBackend
      .expectGET(apiUrl + 'passholders?limit=15&page=2')
      .respond(404, JSON.stringify(error));

    var validateKnownErrorResponse = function (errorResponse) {
      expect(errorResponse).toEqual({
        code: 'PARSE_INVALID_UITPASNUMBER',
        cleanMessage: 'Alle opgegeven UiTPAS nummers zijn foutief.'
      });
      done();
    };

    passholderService.findPassholders(searchParametersUitpasNumbers).catch(validateKnownErrorResponse);

    $httpBackend.flush();
  });

  it('should reject with an unknown API error when it can not find passholders by pass numbers', function (done) {
    var jsonSearchParametersUitpasNumbers = {
      page: 2,
      limit: 15,
      uitpasNumbers: []
    };
    var searchParametersUitpasNumbers = new SearchParameters(jsonSearchParametersUitpasNumbers);

    var error = {
      message: 'I want only this. URL CALLED I do not want this'
    };

    $httpBackend
      .expectGET(apiUrl + 'passholders?limit=15&page=2')
      .respond(404, JSON.stringify(error));

    var validateUnknownErrorResponse = function (errorResponse) {
      expect(errorResponse).toEqual({
        message: 'I want only this. URL CALLED I do not want this',
        cleanMessage: 'I want only this. '
      });
      done();
    };

    passholderService.findPassholders(searchParametersUitpasNumbers).catch(validateUnknownErrorResponse);

    $httpBackend.flush();
  });

  it('should reject with a fallback error when it can not find passholders by pass numbers', function (done) {
    var jsonSearchParametersUitpasNumbers = {
      page: 2,
      limit: 15,
      uitpasNumbers: []
    };
    var searchParametersUitpasNumbers = new SearchParameters(jsonSearchParametersUitpasNumbers);

    var error = {};

    $httpBackend
      .expectGET(apiUrl + 'passholders?limit=15&page=2')
      .respond(404, JSON.stringify(error));

    var validateFallbackErrorResponse = function (errorResponse) {
      expect(errorResponse).toEqual({
        cleanMessage: 'Er is een fout opgetreden tijdens de communicatie met de server.'
      });
      done();
    };

    passholderService.findPassholders(searchParametersUitpasNumbers).catch(validateFallbackErrorResponse);

    $httpBackend.flush();
  });

  it('should find checkins and advantages by pass numbers', function (done) {
    var uitpasNumber = '123456789';

    var expectedPointHistory = [
      {
        'id': '18',
        'date': '2015/10/26',
        'title': 'Evenement 1',
        'points': 1
      },
      {
        'id': '19',
        'date': '2015/10/30',
        'title': 'Evenement 2',
        'points': 20
      },
      {
        'id': '145',
        'date': '2015/11/20',
        'title': 'Activiteit 1',
        'points': -5
      }
    ];

    function assertPointHistory(pointHistory) {
      expect(pointHistory).toEqual(expectedPointHistory);
      done();
    }

    $httpBackend
      .expectGET(apiUrl + 'passholders/' + uitpasNumber + '/points-history')
      .respond(200, expectedPointHistory);

    passholderService
      .getPointHistory(uitpasNumber)
      .then(assertPointHistory);

    $httpBackend.flush();
  });

  it('should find ticketsales by pass numbers', function (done) {
    var uitpasNumber = '123456789';

    var expectedTicketSales = [
      {
        id: '30788',
        creationDate: '2014-07-14',
        eventTitle: 'Tentoonstelling: Aalst in de Middeleeuwen',
        tariff: 15
      },
      {
        id: '30789',
        creationDate: '2013-12-06',
        eventTitle: 'Eddy Wally in Concert',
        tariff: 7.5
      },
      {
        id: '30790',
        creationDate: '2012-05-11',
        eventTitle: 'Gratis zwembeurt',
        tariff: 0,
        coupon: {
          id: '1',
          name: 'Cultuurwaardebon',
          description: 'dit is de description van Cultuurwaardebon',
          expirationDate: '2015-12-26',
          remainingTotal: 1
        }
      },
      {
        id: '30791',
        creationDate: '2015-05-09',
        eventTitle: 'Cursus foto\'s maken met je smartphone',
        tariff: 7.5
      },
      {
        id: '30792',
        creationDate: '2010-06-09',
        eventTitle: 'Nacht van de poëzie',
        tariff: 5
      }
    ];

    function assertTicketSales(ticketSales) {
      expect(ticketSales).toEqual(expectedTicketSales);
      done();
    }

    $httpBackend
      .expectGET(apiUrl + 'passholders/' + uitpasNumber + '/activities/ticket-sales')
      .respond(200, expectedTicketSales);

    passholderService
      .getTicketSales(uitpasNumber)
      .then(assertTicketSales);

    $httpBackend.flush();
  });

  it('resolves when removing a ticketsale for a passholder', function (done) {
    var passholder = {
      passNumber: '0123456789012'
    };
    var ticketSale = {
      id: '30788',
      creationDate: '2014-07-14',
      eventTitle: 'Tentoonstelling: Aalst in de Middeleeuwen',
      tariff: 15
    };

    function expectResolved () {
      done();
    }

    $httpBackend
      .expectDELETE(apiUrl + 'passholders/' + passholder.passNumber + '/activities/ticket-sales/' + ticketSale.id)
      .respond(200);

    passholderService
      .removeTicketSale(passholder, ticketSale)
      .then(expectResolved);

    $httpBackend.flush();
  });

  it('rejects when it can not remove a ticketsale for a passholder', function (done) {
    var passholder = {
      passNumber: '0123456789012'
    };
    var ticketSale = {
      id: '30788',
      creationDate: '2014-07-14',
      eventTitle: 'Tentoonstelling: Aalst in de Middeleeuwen',
      tariff: 15
    };

    function expectRejected () {
      done();
    }

    $httpBackend
      .expectDELETE(apiUrl + 'passholders/' + passholder.passNumber + '/activities/ticket-sales/' + ticketSale.id)
      .respond(400);

    passholderService
      .removeTicketSale(passholder, ticketSale)
      .catch(expectRejected);

    $httpBackend.flush();
  });

  it('should add a passholder to a card system with a extra card', function (done) {
    var uitpasNumber = '01234567890123';
    var cardSystemId = null;
    var voucherNumber = null;
    var kansenstatuutEndDate = null;
    var extraCardNumber = '01324657890124';

    var expectedRequestParams = {
      uitpasNumber: extraCardNumber
    };

    var assertSuccess = function () {
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber + '/cardsystems', expectedRequestParams)
      .respond(200);

    passholderService
      .addCardSystem(uitpasNumber, cardSystemId, voucherNumber, kansenstatuutEndDate, extraCardNumber)
      .then(assertSuccess);

    $httpBackend.flush();
  });

  it('should add a passholder to a card system with a extra card and voucher', function (done) {
    var uitpasNumber = '01234567890123';
    var cardSystemId = null;
    var voucherNumber = '85000000258';
    var kansenstatuutEndDate = null;
    var extraCardNumber = '01234567890124';

    var expectedRequestParams = {
      uitpasNumber: extraCardNumber,
      voucherNumber: voucherNumber
    };

    var assertSuccess = function () {
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber + '/cardsystems', expectedRequestParams)
      .respond(200);

    passholderService
      .addCardSystem(uitpasNumber, cardSystemId, voucherNumber, kansenstatuutEndDate, extraCardNumber)
      .then(assertSuccess);

    $httpBackend.flush();
  });

  it('should add a passholder to a card system with an extra card, voucher and kansenstatuut', function (done) {
    var uitpasNumber = '01234567890123';
    var cardSystemId = null;
    var voucherNumber = '85000000258';
    var kansenstatuutEndDate = new Date('2345-01-01');
    var extraCardNumber = '01234567890124';

    var expectedRequestParams = {
      uitpasNumber: extraCardNumber,
      voucherNumber: voucherNumber,
      kansenStatuut: {
        endDate: '2345-01-01'
      }
    };

    var assertSuccess = function () {
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber + '/cardsystems', expectedRequestParams)
      .respond(200);

    passholderService
      .addCardSystem(uitpasNumber, cardSystemId, voucherNumber, kansenstatuutEndDate, extraCardNumber)
      .then(assertSuccess);

    $httpBackend.flush();
  });

  it('should add a passholder to a card system without extra card, with voucher and kansenstatuut', function (done) {
    var uitpasNumber = '01234567890123';
    var cardSystemId = 1;
    var voucherNumber = '85000000258';
    var kansenstatuutEndDate = new Date('2345-01-01');
    var extraCardNumber = null;

    var expectedRequestParams = {
      cardSystemId: cardSystemId,
      voucherNumber: voucherNumber,
      kansenStatuut: {
        endDate: '2345-01-01'
      }
    };

    var assertSuccess = function () {
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber + '/cardsystems', expectedRequestParams)
      .respond(200);

    passholderService
      .addCardSystem(uitpasNumber, cardSystemId, voucherNumber, kansenstatuutEndDate, extraCardNumber)
      .then(assertSuccess);

    $httpBackend.flush();
  });

  it('rejects when information is missing to add a passholder to a card system', function (done) {
    var uitpasNumber = '01234567890123';
    var cardSystemId = null;
    var voucherNumber = '85000000258';
    var kansenstatuutEndDate = new Date('2345-01-01');
    var extraCardNumber = null;

    var checkError = function (error) {
      expect(error.code).toBe('MISSING_REQUIRED_FIELDS');
      expect(error.message).toBe('Een card system of nieuw uitpas nummer zijn verplicht. Beide velden zijn leeg.');
      done();
    };

    passholderService
      .addCardSystem(uitpasNumber, cardSystemId, voucherNumber, kansenstatuutEndDate, extraCardNumber)
      .catch(checkError);

    $httpBackend.flush();
  });

  it('rejects when it can not add a passholder to a card system', function (done) {
    var uitpasNumber = '01234567890123';
    var cardSystemId = 1;
    var voucherNumber = '85000000258';
    var kansenstatuutEndDate = new Date('2345-01-01');
    var extraCardNumber = null;

    var expectedRequestParams = {
      cardSystemId: cardSystemId,
      voucherNumber: voucherNumber,
      kansenStatuut: {
        endDate: '2345-01-01'
      }
    };

    var checkError = function () {
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber + '/cardsystems', expectedRequestParams)
      .respond(400);

    passholderService
      .addCardSystem(uitpasNumber, cardSystemId, voucherNumber, kansenstatuutEndDate, extraCardNumber)
      .catch(checkError);

    $httpBackend.flush();
  });

  it('should remove the passholder from the cache after adding a card system', function (done) {
    var pass = identityData.uitPas;
    // Fill the cache so we can check later that it's empty again.
    var passholderCache = $cacheFactory.get('passholderCache');
    var passholderIdCache = $cacheFactory.get('passholderIdCache');
    passholderCache.put(pass.number, pass);
    passholderIdCache.put(pass.number, pass.number);

    var uitpasNumber = '0930000422202';
    var cardSystemId = null;
    var voucherNumber = null;
    var kansenstatuutEndDate = null;
    var extraCardNumber = '01324657890124';

    var expectedRequestParams = {
      uitpasNumber: extraCardNumber
    };

    var assertSuccess = function () {
      expect(passholderCache.get(pass.number)).toEqual(undefined);
      expect(passholderIdCache.get(pass.number)).toEqual(undefined);

      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + uitpasNumber + '/cardsystems', expectedRequestParams)
      .respond(200);

    passholderService
      .addCardSystem(uitpasNumber, cardSystemId, voucherNumber, kansenstatuutEndDate, extraCardNumber)
      .then(assertSuccess);

    $httpBackend.flush();

  });

  it('should post the passholder when updating the passholder school', function (done) {
    var pass = new Pass(getPassData());
    var passholder = pass.passholder;
    var school = {
      id: 'unique-id-a',
      name: 'School A'
    };
    var expectedData = passholder.serialize();
    expectedData.school = school;
    var passHolderCache = $cacheFactory.get('passholderCache');

    spyOn(passholderService, 'findPass').and.returnValue($q.resolve(pass));
    spyOn($rootScope, '$emit');
    spyOn(passHolderCache, 'put').and.callThrough();

    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + pass.number, expectedData)
      .respond(200, expectedData);

    var expectedCachedPass = pass;
    expectedCachedPass.passholder.school = school;

    var assertSuccess = function () {
      expect(passHolderCache.put)
        .toHaveBeenCalledWith(
          identityData.uitPas.number,
          expectedCachedPass
        );
      expect(passHolderCache.get(pass.number)).toEqual(expectedCachedPass);
      expect($rootScope.$emit).toHaveBeenCalledWith('schoolUpdated');
      done();
    };

    passholderService
      .updateSchool(passholder, school)
      .then(assertSuccess);

    $httpBackend.flush();
  });

  it('cleans up the identification before searching a pass', function () {
    var inszNumber = '201010-002-91';
    var cleanInszNumber = '20101000291';

    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'identities/' + cleanInszNumber)
      .respond(200, JSON.stringify(identityData));
    // Request the passholder data and assert it when its returned.
    passholderService.findPass(inszNumber);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();
  });
});
