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
  var tokenUrl = appConfig.apiUrl + 'culturefeed/oauth/token';
  var apiUrl = appConfig.apiUrl + 'counters';

  /*jshint validthis: true */
  var service = this;

  var token = null;
  var pending = false;

  service.active = undefined;
  service.list = {};

  // service.getToken = function () {
  //   $http.get(appConfig.apiUrl + 'culturefeed/oauth/token', {
  //       withCredentials: true,
  //   }).success(function(response){
  //     token = response.token;
  //     console.log({counterService: counterService.active})
  //     var prevHeaders = $http.defaults.headers.get;
  //     // Remove "pragma" header to prevent CORS error
  //     $http.defaults.headers.get = {
  //       'Cache-Control': 'no-cache'
  //     };
  //     $http.get(appConfig.insightsApiUrl + counterService.active.id + '/sale' , {
  //       withCredentials: false,
  //       headers: {
  //         'Authorization': 'Bearer ' + token,
  //       }
  //     }).finally(function() {
  //       $http.defaults.headers.get = prevHeaders;
  //     });
  //   });
  // };

  /**
   *
   * @param activeCounterId String
   * @param path String
   * @param query Object({from: Moment, to: Moment, mia: boolean})
   * @param onSuccess Function
   * @param onError Function
   */
  function getInsightsData(activeCounterId, path, query, onSuccess, onError) {
    // if (pending) {
    //   return;
    // }
    // pending = true;

    function getInsightsDataWithToken(_token) {
      var prevHeaders = $http.defaults.headers.get;
      // Remove "pragma" header to prevent CORS error
      $http.defaults.headers.get = {
        'Cache-Control': 'no-cache'
      };
      $http.get(appConfig.insightsApiUrl +
        activeCounterId + (path || '/sale') +
        '?start_date=' + query.from + '&end_date=' + query.to +
        (query.mia ? '&mia=' + query.mia : ''),
        {
          withCredentials: false,
          headers: {
            'Authorization': 'Bearer ' + _token,
          }
      })
        .success(onSuccess)
        .error(onError)
        .finally(function() {
          $http.defaults.headers.get = prevHeaders;
          // pending = false;
        });
    }

    if (token) {
      getInsightsDataWithToken(token);
      return;
    }

    $http.get(tokenUrl, {
      withCredentials: true,
    }).success(function(response) {
      token = response.token;
      getInsightsDataWithToken(token);
    }).error(onError);
  }

  /**
   * Get default date range
   *
   * return {Object<FromToDates>} An object with formatted from/to values.
   */
  service.getDefaultDateRange = function () {
    var moment = window.moment;
    // var start = moment('2019-07-01').startOf('year');
    // var end = moment('2020-07-01').endOf('year');

    var start = moment('2020-07-01').startOf('month');
    var end = moment('2020-07-01').endOf('month');

    // var start = moment().startOf('month');
    // var end = moment().endOf('month');

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
    return window.moment(date).format('YYYY-MM-DD');
  };

  /**
   * Get sales statistics.
   *
   * @param {params} object with from/to keys
   * @param {path} string
   * @param {mia} boolean
   *
   * @return {Promise<CounterSalesStatistics[]|ApiError>} A list of datapoints or an error response.
   */
  service.getStatistics = function (params, path, mia) {
    var dates = this.getDefaultDateRange();
    var query = [];
    var data = [];
    var error = [];
    params = params || [];

    // If no params were passed, use single default date range.
    if (!params.length) {
      params.push({ from: dates.from, to: dates.to});
    }
    // Prepare querystring
    for (var i = 0, max = params.length; i < max; i++) {
      var fromStr = this.formatStatisticsDate(params[i].from);
      var toStr = this.formatStatisticsDate(params[i].to);
      // Add number, starting with '', then 2, 3, ...
      var q = {};
      q.from = fromStr;
      q.to = toStr;
      q.mia = mia || false;

      query.push(q);
    }

    var deferredSales = $q.defer();

    counterService.getActive().then(function(activeCounter) {
      var fetchedData = 0;

      for (var i = 0; i < query.length; i++) {
        (function getData(index) {
          getInsightsData(activeCounter.id, '/' + path, query[i],function(responseData) {
            // handleSalesData(responseData);
            data[index] = responseData;
            error[index] = null;
            fetchedData++;

            if (fetchedData === query.length) {
              deferredSales.resolve([data, error]);
            }
          }, function(e) {
            data[index] = null;
            error[index] = e;
            fetchedData++;

            if (fetchedData === query.length) {
              deferredSales.resolve([data, error]);
            }
            // deferredSales.reject(e)
          });
        })(i);
      }


      // query['balieId'] = data.id;
      // $http.get(
      //   apiUrl + '/' + path,
      //   {
      //     withCredentials: true,
      //     params: query
      //   })
      //   .success(handleSalesData)
      //   .error(deferredSales.reject);
    });

    var handleSalesData = function (salesData) {
      deferredSales.resolve(salesData);
    };

    return deferredSales.promise;
  };
}
