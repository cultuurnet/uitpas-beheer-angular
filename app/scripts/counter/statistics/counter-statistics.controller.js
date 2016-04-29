'use strict';

/**
 * @ngdoc function
 * @name ubr.counter.statistics.controller:CounterStatisticsController
 * @description
 * # CounterStatisticsController
 * Controller of the ubr counter statistics module.
 */
angular
  .module('ubr.counter.statistics')
  .controller('CounterStatisticsController', CounterStatisticsController);

/* @ngInject */
function CounterStatisticsController(counterService, $state) {
  /*jshint validthis: true */
  var controller = this;

  controller.loadingStatistics = true;
  controller.salesStatistics = {};
  controller.noStatisticsError = false;
  controller.dateRanges = [];
  controller.pickingDate = false;
  controller.comparing = false;

  controller.loadDefaultDateRange = function() {
    var dateRange = counterService.getDefaultDateRange();
    controller.dateRanges.push(dateRange);
  };

  controller.makeDate = function (dateStr) {
    return new Date(dateStr);
  };

  controller.loadSalesStatistics = function () {
    var showStatistics = function (statistics) {
      controller.statistics = statistics;
      controller.loadingStatistics = false;
      controller.noStatisticsError = false;
    };

    var noStatisticsFound = function () {
      controller.loadingStatistics = false;
      controller.noStatisticsError = true;
    };

    controller.loadingStatistics = true;
    counterService
      .getSalesStatistics(controller.dateRanges)
      .then(showStatistics, noStatisticsFound);
  };

  controller.loadDefaultDateRange();
  controller.loadSalesStatistics();
}