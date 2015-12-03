'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.bulkActions.bulkActionsService
 * @description
 * # bulk actions service
 * Service in the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .service('bulkActionsService', bulkActionsService);

/* @ngInject */
function bulkActionsService(appConfig, $http, $interval, $q) {
  var apiUrl = appConfig.apiUrl + 'passholders/bulkoperations/export';
  var exportGenerationMonitor;

  /*jshint validthis: true */
  var service = this;

  service.exportPassholders = function (exportSelection) {
    var deferredExportRequest = $q.defer();
    var returnExportLocation = function (exportLocation) {
      deferredExportRequest.resolve(exportLocation);
    };

    var awaitPassholdersExport = function (exportId) {
      service
        .awaitPassholdersExport(exportId)
        .then(returnExportLocation, reportExportFailure);
    };

    var reportExportFailure = function (error) {
      deferredExportRequest.reject(error);
    };

    service
      .requestPassholdersExport(exportSelection)
      .then(awaitPassholdersExport, reportExportFailure);

    return deferredExportRequest.promise;
  };

  service.requestPassholdersExport = function (exportSelection) {
    var deferredExport = $q.defer();

    var exportRequestSuccessful = function (exportResponse) {
      deferredExport.resolve(exportResponse.data.id);
    };

    var exportRequestFailed = function () {
      deferredExport.reject();
    };

    //*
    var config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    $http
      .post(apiUrl, exportSelection, config)
      .then(exportRequestSuccessful, exportRequestFailed);
    /*/
    $q.when({data: {id: '65'}}).then(exportRequestSuccessful, exportRequestFailed);
    //*/

    return deferredExport.promise;
  };

  service.awaitPassholdersExport = function (exportId) {
    var deferredGeneration = $q.defer();
    var exportUrl = apiUrl + '/' + exportId;

    var checkGenerationCompleted = function (generationResponse) {
      if (generationResponse.status === 200 && generationResponse.data.completed === true) {
        $interval.cancel(exportGenerationMonitor);
        deferredGeneration.resolve(generationResponse.data.download);
      }
    };

    var exportError = function (error) {
      $interval.cancel(exportGenerationMonitor);
      deferredGeneration.reject(error);
    };

    var pingExportLocation = function () {
      $http
        .get(exportUrl)
        //.get('scripts/passholder/bulk-actions/fakeExportDownload.json')
        .then(checkGenerationCompleted, exportError);
    };

    exportGenerationMonitor = $interval(pingExportLocation, 1000 * 2);

    return deferredGeneration.promise;
  };
}
