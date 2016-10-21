'use strict';

/**
 * @ngdoc service
 * @name ubr.counter.statistics.counterStatisticsService
 * @description
 * # counterStatisticsService
 * Service in the ubr.counter module for statistics.
 */
angular.module('ubr.counter.statistics')
  .service('counterStatisticsService', counterStatisticsService);

/* @ngInject */
function counterStatisticsService($q, $http, appConfig, counterService) {
  var apiUrl = appConfig.apiUrl + 'counters';

  /*jshint validthis: true */
  var service = this;

  service.active = undefined;
  service.list = {};

  /**
   * Get default date range
   *
   * return {Object<FromToDates>} An object with formatted from/to values.
   */
  service.getDefaultDateRange = function () {
    var moment = window.moment;
    var start = moment().startOf('month');
    var end = moment().endOf('month');

    var dateRange = {
      from: start,
      to: end,
    };

    return dateRange;
  };

  /**
   * Format dates using default formatting.
   *
   * @param {Date} Date object or moment() parsable string.
   *
   * @return {String} A formatted date like DD/MM/YYY.
   */
  service.formatStatisticsDate = function (date) {
    return window.moment(date).format('DD/MM/YYYY');
  };

  /**
   * Get sales statistics.
   *
   * @param {Parameters} object with from/to keys
   *
   * @return {Promise<CounterSalesStatistics[]|ApiError>} A list of datapoints or an error response.
   */
  service.getStatistics = function (params, path) {
    var dates = this.getDefaultDateRange();
    var query = {};
    var num;
    var fromStr;
    var toStr;
    params = params || [];
    path = path || 'cardsales';
    // If no params were passed, use single default date range.
    if (!params.length) {
      params.push({ from: dates.from, to: dates.to});
    }
    // Prepare querystring
    for (var i = 0, max = params.length; i < max; i++) {
      fromStr = this.formatStatisticsDate(params[i].from);
      toStr = this.formatStatisticsDate(params[i].to);
      // Add number, starting with '', then 2, 3, ...
      num = i ? i+1 : '';
      query['from' + num] = fromStr;
      query['to' + num] = toStr;
    }

    var deferredSales = $q.defer();

    counterService.getActive().then(function(data) {
      query['balieId'] = data.id;
      $http.get(
        apiUrl + '/' + path,
        {
          withCredentials: true,
          params: query
        })
        .success(handleSalesData)
        .error(deferredSales.reject);
    });

    var handleSalesData = function (salesData) {
      deferredSales.resolve(salesData);
    };

    return deferredSales.promise;
  };
}
