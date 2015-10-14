'use strict';

/**
 * @ngdoc overview
 * @name ubr.counter.expense-report
 * @description
 * # ubr.counter.expense-report
 *
 * Counter expense report module UiTPAS Beheer
 */
angular
  .module('ubr.counter.expense-report', [
    'ui.router',
    'ubr.counter'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {
    $stateProvider
      .state('counter.main.expense-report', {
        url: 'expense-report',
        requiresCounter: true,
        views: {
          'content@counter': {
            templateUrl: 'views/expense-report/generate-report.html',
            controller: 'ExpenseReportController',
            controllerAs: 'erc'
          },
          'sidebar@counter': {
            templateUrl: 'views/expense-report/sidebar-info.html'
          }
        }
      });
  });
