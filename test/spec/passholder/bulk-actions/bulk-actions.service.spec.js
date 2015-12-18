'use strict';

describe('Service: bulkActionsService', function () {
  var apiUrl = 'http://example.com/';

  beforeEach(module('ubr.passholder.bulkActions', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  var bulkActionsService, $httpBackend, $q, $interval;

  var jsonExportSelection = {
    selection: [
      '0123456789012',
      '0123456789013',
      '0123456789014',
      '0123456789015'
    ],
    searchParameters:  {
      'uitpasNumber': [
        '0123456789012',
        '0123456789013',
        '0123456789014',
        '0123456789015'
      ],
      'dateOfBirth': '1983-02-03',
      'firstName': 'Albe*',
      'name': 'Conta*',
      'street': 'Bondgenotenlaan',
      'city': 'Leuven',
      'email': 'foo@bar.com',
      'membershipAssociationId': '5',
      'membershipStatus': 'ACTIVE'
    }
  };

  function getExportSelection () {
    return angular.copy(jsonExportSelection);
  }

  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend');
    bulkActionsService = $injector.get('bulkActionsService');
    $q = $injector.get('$q');
    $interval = $injector.get('$interval');
  }));

  it('can wait for an export to be generated', function(done) {
    var exportStatus = {
      completed: false
    };

    var confirmResolved = function (downloadLocation) {
      expect(downloadLocation).toEqual('http://www.download.me/passholders/export/' + exportId);
      done();
    };
    var exportId = 5;

    $httpBackend
      .expectGET(apiUrl + 'passholders/bulkoperations/export/' + exportId)
      .respond(200, exportStatus);

    bulkActionsService
      .awaitPassholdersExport(exportId)
      .then(confirmResolved);

    $interval.flush(2000);
    $httpBackend.flush();

    exportStatus.completed = true;
    exportStatus.download = 'http://www.download.me/passholders/export/' + exportId;

    $httpBackend
      .expectGET(apiUrl + 'passholders/bulkoperations/export/' + exportId)
      .respond(200, exportStatus);

    $interval.flush(2000);
    $httpBackend.flush();
  });

  it('stops waiting for an export to be generated on server error', function (done) {
    var confirmError = function () {
      done();
    };
    var exportId = 5;

    $httpBackend
      .expectGET(apiUrl + 'passholders/bulkoperations/export/' + exportId)
      .respond(403);

    bulkActionsService
      .awaitPassholdersExport(exportId)
      .catch(confirmError);

    $interval.flush(2000);
    $httpBackend.flush();
  });

  it('can request an export with selection parameters', function (done) {
    var exportSelection = getExportSelection();

    var exportRequestResponse = {
      id: 5
    };

    var confirmExportRequested = function (response) {
      expect(response).toBe(exportRequestResponse.id);
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/bulkoperations/export')
      .respond(200, exportRequestResponse);

    bulkActionsService
      .requestPassholdersExport(exportSelection)
      .then(confirmExportRequested);

    $httpBackend.flush();
  });

  it ('rejects when it can not request an export', function (done) {
    var exportSelection = getExportSelection();

    var confirmFailure = function () {
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/bulkoperations/export')
      .respond(403);

    bulkActionsService
      .requestPassholdersExport(exportSelection)
      .catch(confirmFailure);

    $httpBackend.flush();
  });

  it ('can request an export and await the download path', function (done) {
    var exportSelection = getExportSelection();
    var exportId = 5;

    var exportRequestResponse = {
      id: exportId
    };

    var exportStatus = {
      completed: true,
      download: 'http://www.download.me/passholders/export/' + exportId
    };

    var confirmExportLocation = function (exportLocation) {
      expect(exportLocation).toBe(exportStatus.download);
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/bulkoperations/export')
      .respond(200, exportRequestResponse);

    bulkActionsService
      .exportPassholders(exportSelection)
      .then(confirmExportLocation);

    $httpBackend.flush();

    $httpBackend
      .expectGET(apiUrl + 'passholders/bulkoperations/export/' + exportId)
      .respond(200, exportStatus);

    $interval.flush(2000);
    $httpBackend.flush();
  });

  it('rejects when an export can not be requested', function (done) {
    var exportSelection = getExportSelection();

    var confirmError = function () {
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/bulkoperations/export')
      .respond(403);

    bulkActionsService
      .exportPassholders(exportSelection)
      .catch(confirmError);

    $httpBackend.flush();
  });

  it('rejects when an export can not be generated', function (done) {
    var exportSelection = getExportSelection();
    var exportId = 5;

    var exportRequestResponse = {
      id: exportId
    };

    var confirmError = function () {
      done();
    };

    $httpBackend
      .expectPOST(apiUrl + 'passholders/bulkoperations/export')
      .respond(200, exportRequestResponse);

    bulkActionsService
      .exportPassholders(exportSelection)
      .catch(confirmError);

    $httpBackend.flush();

    $httpBackend
      .expectGET(apiUrl + 'passholders/bulkoperations/export/' + exportId)
      .respond(403);

    $interval.flush(2000);
    $httpBackend.flush();
  });
});
