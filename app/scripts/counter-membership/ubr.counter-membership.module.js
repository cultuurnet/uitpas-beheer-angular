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

    /* @ngInject */
    function showCreateMembershipModal($modal, $state) {
      $modal
        .open({
          animation: true,
          templateUrl: 'views/counter-membership/create-membership.html',
          size: 'sm',
          controller: 'CreateMembershipModalController',
          controllerAs: 'cmmc'
        })
        .result
        .finally(function () {
          $state.go('^');
        });
    }

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
      })
      .state('counter.memberships.create', {
        onEnter: showCreateMembershipModal
      });
  });
