'use strict';

/**
 * @ngdoc overview
 * @name ubr.counter.statistics
 * @description
 * # ubr.counter.statistics
 *
 * Counter Statistics module UiTPAS Beheer
 */
angular
  .module('ubr.counter.statistics', [
    'ui.router',
    'ubr.counter',
    'daterangepicker'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    $stateProvider
      .state('counter.statistics', {
        url: '/counter-statistics',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/counter-statistics/statistics-under-construction.html',
            // templateUrl: 'views/counter-statistics/statistics.html',
            // controller: 'CounterStatisticsController',
            // controllerAs: 'csc'
          },
          sidebar: {
            templateUrl: 'views/counter-statistics/sidebar-info.html'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      // .state('counter.statistics.savings', {
      //   url: '/savings',
      //   requiresCounter: true,
      //   views: {
      //     content: {
      //       templateUrl: 'views/counter-statistics/statistics.html',
      //       controller: 'CounterStatisticsController',
      //       controllerAs: 'csc'
      //     },
      //     sidebar: {
      //       templateUrl: 'views/counter-statistics/sidebar-info.html'
      //     },
      //     header: {
      //       templateUrl: 'views/header.html'
      //     }
      //   }
      // })
      // .state('counter.statistics.exchange', {
      //   url: '/exchange',
      //   requiresCounter: true,
      //   views: {
      //     content: {
      //       templateUrl: 'views/counter-statistics/statistics.html',
      //       controller: 'CounterStatisticsController',
      //       controllerAs: 'csc'
      //     },
      //     sidebar: {
      //       templateUrl: 'views/counter-statistics/sidebar-info.html'
      //     },
      //     header: {
      //       templateUrl: 'views/header.html'
      //     }
      //   }
      // })
      // .state('counter.statistics.mia', {
      //   url: '/mia',
      //   requiresCounter: true,
      //   views: {
      //     content: {
      //       templateUrl: 'views/counter-statistics/statistics.html',
      //       controller: 'CounterStatisticsController',
      //       controllerAs: 'csc'
      //     },
      //     sidebar: {
      //       templateUrl: 'views/counter-statistics/sidebar-info.html'
      //     },
      //     header: {
      //       templateUrl: 'views/header.html'
      //     }
      //   }
      // });
  });
