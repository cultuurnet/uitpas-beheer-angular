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

    getGroup.$inject = ['$stateParams', 'passholderService', '$q'];
    function getGroup($stateParams, passholderService, $q) {
      var groupId = $stateParams.identification;
      var deferredGroup = $q.defer();

      function pluckGroupFromPass(pass) {
        deferredGroup.resolve(pass.group);
      }
      passholderService
        .findPass(groupId)
        .then(pluckGroupFromPass);

      return deferredGroup.promise;
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
          group: getGroup,
          passholder: getGroup
        },
        views: {
          'sidebar@counter': {
            templateUrl: 'views/group/sidebar-group-details.html',
            controller: 'GroupDetailController',
            controllerAs: 'gdc'
          },
          'content@counter': {
            templateUrl: 'views/group/activities.html',
            controller: 'ActivityController',
            controllerAs: 'ac'
          }
        }
      })
      .state('counter.main.group.activityTariffs', {
        params: {
          identification: null,
          passholder: null,
          activity: null
        },
        resolve: {
          passholder: getGroup,
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }],
          activity: ['$stateParams', function($stateParams) {
            return $stateParams.activity;
          }]
        },
        onEnter: ['passholder', 'identification', 'activity', '$state', '$modal', function(passholder, identification, activity, $state, $modal) {
          $modal
            .open({
              animation: true,
              templateUrl: 'views/modal-passholder-activity-tariffs.html',
              params: {
                identification: null,
                passholder: null,
                activity: null
              },
              size: 'sm',
              resolve: {
                passholder: function () {
                  return passholder;
                },
                identification: function () {
                  return identification;
                },
                activity: function () {
                  return activity;
                }
              },
              controller: 'PassholderActivityTariffsController',
              controllerAs: 'pat'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }]
      });
  });
