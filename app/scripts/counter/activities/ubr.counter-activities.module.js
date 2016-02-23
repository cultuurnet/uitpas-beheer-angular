'use strict';

/**
 * @ngdoc overview
 * @name ubr.counter.activities
 * @description
 * # ubr.counter.activities
 *
 * Counter activities module UiTPAS Beheer
 */
angular
  .module('ubr.counter.activities', [
    'ui.router',
    'ubr.counter'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {
    $stateProvider
      .state('counter.main.activities', {
        url: 'counters/active/activities',
        requiresCounter: true,
        views: {
          'content@counter': {
            templateUrl: 'views/counter/content-counter-activities.html',
            controller: 'CounterActivitiesController',
            controllerAs: 'cac'
          }
        }
      });
  });
