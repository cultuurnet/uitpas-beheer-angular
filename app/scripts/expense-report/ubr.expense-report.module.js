'use strict';

/**
 * @ngdoc overview
 * @name ubr.kansenstatuut
 * @description
 * # ubr.kansenstatuut
 *
 * kansenstatuut module UiTPAS Beheer
 */
angular
  .module('ubr.expense-report', [
    'ui.router',
    'uitpasbeheerApp'
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
