'use strict';


/**
 * @ngdoc function
 * @name ubr.counter.expense-report.controller:ExpenseReportController
 * @description
 * # ExpenseReportController
 * Controller of the ubr expense report module.
 */
angular
  .module('ubr.counter.expense-report')
  .controller('ExpenseReportController', ExpenseReportController);

/* @ngInject */
function ExpenseReportController (expenseReportService, $http, $filter, $interval, appConfig, $scope, $window) {
  var apiUrl = appConfig.apiUrl + 'counters/active/expense-reports';
  var erc = this;
  var dateFormat = 'yyyy-MM-dd';
  var reportGenerationMonitor;
  var forceDownload = false;
  var stopMonitor = function () {
    if (reportGenerationMonitor) {
      $interval.cancel(reportGenerationMonitor);
      reportGenerationMonitor = null;
    }
    forceDownload = false;
  };

  erc.reportFrom = new Date();
  erc.reportTo = new Date();
  erc.requestingReport = false;
  erc.generatingReport = false;
  erc.asyncError = false;
  erc.reportLocation = '';
  erc.periods = [];
  erc.periodFetchError = false;

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
        if (forceDownload) {
          $window.location.href = generationResponse.data.download;
        }

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

    switch (erc.asyncError.code) {
      case 'INVALID_DATE_RANGE':
        erc.asyncError.message = 'Je hebt een ongeldige periode opgegeven. De start-datum moet vóór of gelijk aan de eind-datum zijn.';
        break;
      case 'ACTION_FAILED':
        erc.asyncError.message = 'In deze periode werden geen kortingen geregistreerd, er is dan ook geen financieel rapport beschikbaar.';
        break;
    }

    erc.requestingReport = false;
    erc.generatingReport = false;
    stopMonitor();
  };

  erc.reportPending = function () {
    return erc.requestingReport || erc.generatingReport;
  };

  erc.displayPeriods = function () {
    function showFetchResults(results) {
      erc.periodFetchError = false;
      erc.periods = results;
    }
    function fetchFailed() {
      erc.periodFetchError = true;
    }
    expenseReportService.getPeriods().then(showFetchResults, fetchFailed);
  };
  erc.displayPeriods();

  erc.setDateAndGenerate = function (period) {
    erc.reportFrom = new Date(period.from);
    erc.reportTo = new Date(period.to);
    forceDownload = true;
    erc.generateReport();
  };

  erc.periodReportPending = function (period) {
    return erc.reportFrom.toString() === new Date(period.from).toString() && erc.reportTo.toString() === new Date(period.to).toString();
  };

  $scope.$watch(function () {
    return erc.reportFrom.getTime();
  }, erc.resetReport);

  $scope.$watch(function () {
    return erc.reportTo.getTime();
  }, erc.resetReport);
}
