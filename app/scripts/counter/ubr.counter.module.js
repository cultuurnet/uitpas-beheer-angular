'use strict';

/**
 * @ngdoc overview
 * @name ubr.counter
 * @description
 * # ubr.counter
 *
 * counter module UiTPAS Beheer
 */
angular
  .module('ubr.counter', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    $stateProvider.state('counters', {
      url: '/counters',
      templateUrl:'views/counters.html',
      controller: 'CountersController',
      controllerAs: 'counters',
      resolve: {
        /* @ngInject */
        list: function(counterService) {
          return counterService.getList().then(
            function (list) {
              return list;
            },
            function () {
              return {};
            }
          );
        },
        /* @ngInject */
        lastActiveId: function(counterService) {
          return counterService.getLastActiveId().then(
            function (activeId) {
              return activeId;
            },
            function () {
              return null;
            }
          );
        }
      }
    });
  });
