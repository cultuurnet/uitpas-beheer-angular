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
    'ubr.counter'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    $stateProvider
      .state('counter.statistics', {
        url: '/counter-statistics',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/counter-statistics/statistics.html',
            controller: 'CounterStatisticsController',
            controllerAs: 'csc'
          },
          sidebar: {
            templateUrl: 'views/counter-statistics/sidebar-info.html'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      .state('counter.statistics.savings', {
        url: '/counter-statistics/savings',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/counter-statistics/statistics.html',
            controller: 'CounterStatisticsController',
            controllerAs: 'csc'
          },
          sidebar: {
            templateUrl: 'views/counter-statistics/sidebar-info.html'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      .state('counter.statistics.exchange', {
        url: '/counter-statistics/exchange',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/counter-statistics/statistics.html',
            controller: 'CounterStatisticsController',
            controllerAs: 'csc'
          },
          sidebar: {
            templateUrl: 'views/counter-statistics/sidebar-info.html'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      })
      .state('counter.statistics.mia', {
        url: '/counter-statistics/mia',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/counter-statistics/statistics.html',
            controller: 'CounterStatisticsController',
            controllerAs: 'csc'
          },
          sidebar: {
            templateUrl: 'views/counter-statistics/sidebar-info.html'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      });
  });
