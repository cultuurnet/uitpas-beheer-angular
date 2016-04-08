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
        redirectOnScan: true,
        params: {
          pass: null,
          passholders: null,
          identification: null,
          activityMode: null,
          bulkSelection: null,
          activeCounter: null
        },
        resolve: {
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }],
          group: getGroup,
          passholder: getGroup,
          passholders: function() {
            return null;
          },
          activityMode: function() {
            return 'group';
          },
          bulkSelection: function() {
            return null;
          },
          activeCounter: function (counterService) {
            return counterService.getActive();
          }
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
          passholders: null,
          activity: null,
          activityMode: null,
          bulkSelection: null,
          counter: null,
        },
        resolve: {
          passholder: getGroup,
          passholders: function() {
            return null;
          },
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }],
          activity: ['$stateParams', function($stateParams) {
            return $stateParams.activity;
          }],
          activityMode: function() {
            return 'group';
          },
          bulkSelection: function () {
            return null;
          },
          counter: function (counterService) {
            return counterService.getActive();
          }
        },
        onEnter: ['passholder', 'passholders', 'identification', 'activity', 'activityMode', 'bulkSelection', 'counter', '$state', '$uibModal', function(passholder, passholders, identification, activity, activityMode, bulkSelection, counter, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/activity/modal-activity-tariffs.html',
              size: 'sm',
              resolve: {
                passholder: function () {
                  return passholder;
                },
                passholders: function () {
                  return passholders;
                },
                identification: function () {
                  return identification;
                },
                activity: function () {
                  return activity;
                },
                activityMode: function () {
                  return activityMode;
                },
                bulkSelection: function () {
                  return bulkSelection;
                },
                counter: function () {
                  return counter;
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
