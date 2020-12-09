'use strict';

/**
 * @ngdoc overview
 * @name ubr.counter.activities
 * @description
 * # ubr.counter.activities
 *
 * activities module UiTPAS Beheer
 */
angular
  .module('ubr.counter.activities', [
    'ui.router',
    'ubr.counter',
    'monospaced.qrcode',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    var activityModal = {
      params: {
        activity: null
      },
      resolve: {
        activity: ['$stateParams', function($stateParams) {
          return $stateParams.activity;
        }]
      },
      /* @ngInject */
      onEnter: function(activity, $state, $uibModal) {
        $uibModal
          .open({
            animation: true,
            templateUrl: 'views/activity/modal-activity-details.html',
            size: 'sm',
            resolve: {
              activity: function() {
                return activity;
              }
            },
            controller: 'ActivityDetailController',
            controllerAs: 'adc'
          })
          .result
          .finally(function() {
            $state.go('^');
          });
      }
    };

    $stateProvider
      .state(
      'counter.activities',
      {
        url: '/activities',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/counter-activities/content-counter-activities.html',
            controller: 'ActivitiesController',
            controllerAs: 'ac'
          },
          sidebar: {
            templateUrl: 'views/counter-activities/sidebar-counter-activities.html'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      }
      )
      .state('counter.activities.activity', angular.copy(activityModal));
  });
