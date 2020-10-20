'use strict';

/**
 * @ngdoc service
 * @name ubr.counter.expense-report.expenseReportService
 * @description
 * # expenseReportService
 * Service in the ubr.counter module for expense reports.
 */
angular
  .module('ubr.counter.expense-report')
  .service('expenseReportService', expenseReportService);

/* @ngInject */
function expenseReportService($q, $http, $rootScope, appConfig) {

  var periodsApiUrl = appConfig.apiUrl + 'counters/active/expense-reports/periods';

  /*jshint validthis: true */
  var service = this;

  /**
   * Get pre-determined periods to generate expense reports for
   */
  service.getPeriods = function () {
    var deferredPeriods= $q.defer();

    var periodFetch = $http.get(periodsApiUrl);

    var onSuccess = function (results) {
      deferredPeriods.resolve(results);
    };
    var onError = function (error) {
      deferredPeriods.reject(error);
    };

    periodFetch.success(onSuccess);
    periodFetch.error(onError);

    return deferredPeriods.promise;
  };
}

