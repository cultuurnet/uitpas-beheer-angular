'use strict';

/**
 * @ngdoc overview
 * @name ubr.counter-membership
 * @description
 * # ubr.counter-membership
 *
 * counter-membership module UiTPAS Beheer
 */
angular
  .module('ubr.counter-membership', [
    'ui.router',
    'uitpasbeheerApp'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    $stateProvider
      .state('counter.memberships', {
        url: '/counter-memberships',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/counter-membership/memberships.html',
            controller: 'CounterMembershipsController',
            controllerAs: 'cmc'
          },
          sidebar: {
            templateUrl: 'views/counter-membership/sidebar-info.html'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      });
  });
