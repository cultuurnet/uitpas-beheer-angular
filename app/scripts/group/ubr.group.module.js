'use strict';

/**
 * @ngdoc overview
 * @name ubr.group
 * @description
 * # ubr.group
 *
 * group module UiTPAS Beheer
 */
angular
  .module('ubr.group', [
    'ui.router',
    'uitpasbeheerApp'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    getGroup.$inject = ['$stateParams', 'passholderService'];
    function getGroup($stateParams, passholderService) {
      var groupId = $stateParams.identification;

      return passholderService.findPass(groupId);
    }

    $stateProvider
      .state('counter.main.group', {
        url: 'group/:identification',
        requiresCounter: true,
        params: {
          pass: null,
          identification: null
        },
        resolve: {
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }],
          groupPass: getGroup
        },
        views: {
          'sidebar@counter': {
            templateUrl: 'views/group/sidebar-group-details.html',
            controller: 'GroupDetailController',
            controllerAs: 'gdc'
          },
          'content@counter': {
            templateUrl: 'views/group/activities.html',
            controller: 'GroupActivityController',
            controllerAs: 'gac'
          }
        }
      });
  });
