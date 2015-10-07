'use strict';

/**
 * @ngdoc function
 * @name ubr.expense-report.controller:ExpenseReportController
 * @description
 * # ExpenseReportController
 * Controller of the ubr expense report module.
 */
angular
  .module('ubr.expense-report')
  .controller('ExpenseReportController', ExpenseReportController);

/* @ngInject */
function ExpenseReportController ($http, $filter, $interval, appConfig, $scope) {
  var apiUrl = appConfig.apiUrl + 'counters/active/expense-reports';

  var erc = this;
  var dateFormat = 'yyyy-MM-dd';
  var reportGenerationMonitor;
  var stopMonitor = function () {
    if (reportGenerationMonitor) {
      $interval.cancel(reportGenerationMonitor);
      reportGenerationMonitor = null;
    }
  };

  erc.reportFrom = new Date();
  erc.reportTo = new Date();
  erc.requestingReport = false;
  erc.generatingReport = false;
  erc.asyncError = false;
  erc.reportLocation = '';

  erc.resetReport = function () {
    erc.asyncError = false;
    erc.reportLocation = '';
  };

  erc.generateReport = function () {
    var busy = erc.requestingReport || erc.generatingReport;

    if (!busy) {
      var reportRequestData = {
        'from': $filter('date')(erc.reportFrom, dateFormat),
        'to': $filter('date')(erc.reportTo, dateFormat)
      };

      var reportRequestFinished = function () {
        erc.requestingReport = false;
      };

      erc.reportLocation = '';
      erc.requestingReport = true;
      $http
        .post(apiUrl, reportRequestData)
        .then(erc.generatingReportStarted, erc.displayReportError)
        .finally(reportRequestFinished);
    }
  };

  erc.generatingReportStarted = function (generationStartedResponse) {
    var reportId = generationStartedResponse.data.id;
    var reportUrl = apiUrl + '/' + reportId;

    var displayReport = function (generationResponse) {
      if (generationResponse.status === 200 && generationResponse.data.completed === true) {
        stopMonitor();
        erc.generatingReport = false;
        erc.reportLocation = generationResponse.data.download;
      }
    };

    var pingReportLocation = function () {
      $http
        .get(reportUrl)
        .then(displayReport, erc.displayReportError);
    };

    erc.generatingReport = true;
    reportGenerationMonitor = $interval(pingReportLocation, 1000 * 2);
  };

  erc.displayReportError = function (failedRequest) {
    erc.asyncError = failedRequest.data;
    erc.requestingReport = false;
    erc.generatingReport = false;
    stopMonitor();
  };

  erc.reportPending = function () {
    return erc.requestingReport || erc.generatingReport;
  };

  $scope.$watch(function () {
    return erc.reportFrom.getTime();
  }, erc.resetReport);

  $scope.$watch(function () {
    return erc.reportTo.getTime();
  }, erc.resetReport);
}
