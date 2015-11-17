'use strict';

/**
 * @ngdoc overview
 * @name ubr.counter.membership
 * @description
 * # ubr.counter.membership
 *
 * Counter Membership module UiTPAS Beheer
 */
angular
  .module('ubr.counter.membership', [
    'ui.router',
    'ubr.counter'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    /* @ngInject */
    function showCreateMembershipModal($uibModal, $state) {
      $uibModal
        .open({
          animation: true,
          templateUrl: 'views/counter-membership/create-membership.html',
          size: 'sm',
          controller: 'CreateMembershipModalController',
          controllerAs: 'cmmc'
        })
        .result
        .then(function (newMember) {
          // Provide the new member to the parent state to show info.
          $state.go('^', {newMember: newMember});
        }, function () {
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
        },
        params: {
          'newMember': null
        },
        resolve: {
          /* @ngInject */
          newMember: function($stateParams) {
              return $stateParams.newMember;
          }
        }
      })
      .state('counter.memberships.create', {
        onEnter: showCreateMembershipModal
      });
  });
