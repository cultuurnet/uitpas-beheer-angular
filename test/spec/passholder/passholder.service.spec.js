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
  var passholderService, $httpBackend, $q, $scope, Passholder, Pass, $cacheFactory;

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

  beforeEach(inject(function ($injector, $rootScope) {
    $httpBackend = $injector.get('$httpBackend');
    passholderService = $injector.get('passholderService');
    $q = $injector.get('$q');
    $scope = $rootScope;
    Passholder = $injector.get('Passholder');
    Pass = $injector.get('Pass');
    $cacheFactory = $injector.get('$cacheFactory');
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

  it('throws an error when the pass request returns an error', function() {
    var uitpasNumber = 'this-is-a-number';
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

    var failed = function(error) {
      expect(error).toEqual({ code: 'PASSHOLDER_NOT_FOUND', title: 'Not found', message: 'Passholder not found for identification number: this-is-a-number' });
    };

    // Request the passholder data and assert it when its returned.
    passholderService.findPass(uitpasNumber).catch(failed);

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

  it('throws an error when the passholder request returns an error', function() {
    var uitpasNumber = 'this-is-a-number';
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

    var failed = function(error) {
      expect(error).toEqual({ code: 'PASSHOLDER_NOT_FOUND', title: 'Not found', message: 'Passholder not found for identification number: this-is-a-number' });
    };

    // Request the passholder data and assert it when its returned.
    passholderService.findPassholder(uitpasNumber).catch(failed);

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
});