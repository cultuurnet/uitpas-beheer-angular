'use strict';

/**
 * @ngdoc overview
 * @name ubr.help
 * @description
 * # ubr.feedback
 *
 * Feedback module UiTPAS Beheer.
 */
angular
  .module('ubr.feedback', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    $stateProvider
      .state('counter.main.feedback', {
        url: 'feedback',
        requiresCounter: true,
        params: {
          'uitIdUser': null,
          'activeCounter': null
        },
        resolve: {
          /* @ngInject */
          uitIdUser: function(uitid) {
            return uitid.getUser();
          },
          /* @ngInject */
          activeCounter: function(counterService) {
            return counterService.getActive();
          }
        },
        views: {
          'content@counter': {
            templateUrl: 'views/feedback/content-feedback.html',
            controller: 'FeedbackController',
            controllerAs: 'fc'
          },
          'sidebar@counter': {
            templateUrl: 'views/feedback/sidebar-feedback.html'
          }
        }
      });
  });

