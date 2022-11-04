'use strict';

/**
 * @ngdoc overview
 * @name ubr.activity
 * @description
 * # ubr.activity
 *
 * activity module UiTPAS Beheer.
 */
angular
  .module('ubr.activity', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {
    /* @ngInject */
    getPassholderFromStateParams.$inject = ['passholderService', '$stateParams', '$q'];
    function getPassholderFromStateParams(passholderService, $stateParams, $q) {
      if ($stateParams.activityMode === 'passholders') {
        return passholderService.findPassholder($stateParams.identification);
      }
      else if ($stateParams.activityMode === 'group') {
        var groupId = $stateParams.identification;
        var deferredGroup = $q.defer();

        passholderService
          .findPass(groupId)
          .then(function(pass) {
            deferredGroup.resolve(pass.group);
          });

        return deferredGroup.promise;
      }
      else {
        return $stateParams.passholder;
      }
    }

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

    var tariffModal = {
      params: {
        identification: null,
        passholder: null,
        passholders: null,
        bulkSelection: null,
        activity: null,
        activityMode: null,
        counter: null
      },
      resolve: {
        passholder: getPassholderFromStateParams,
        passholders: ['$stateParams', function($stateParams) {
          return $stateParams.passholders;
        }],
        bulkSelection: ['$stateParams', function($stateParams) {
          return $stateParams.bulkSelection;
        }],
        identification: ['$stateParams', function($stateParams) {
          return $stateParams.identification;
        }],
        activity: ['$stateParams', function($stateParams) {
          return $stateParams.activity;
        }],
        activityMode: ['$stateParams', function($stateParams) {
          return $stateParams.activityMode;
        }],
        counter: ['counterService', function(counterService) {
          return counterService.getActive();
        }]
      },
      onEnter: ['passholder', 'passholders', 'bulkSelection', 'identification', 'activity', 'activityMode', 'counter', '$state', '$uibModal', function(passholder, passholders, bulkSelection, identification, activity, activityMode, counter, $state, $uibModal) {
        var modalSize = 'sm';
        if (Object.keys(activity.sales.base).length > 3) {
          modalSize = '';
        }
        $uibModal
          .open({
            animation: true,
            templateUrl: 'views/activity/modal-activity-tariffs.html',
            size: modalSize,
            resolve: {
              passholder: function () {
                return passholder;
              },
              passholders: function () {
                return passholders;
              },
              bulkSelection: function () {
                return bulkSelection;
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
              counter: function () {
                return counter;
              }
            },
            controller: 'PassholderActivityTariffsController',
            controllerAs: 'pat'
          })
          .result
          .finally(function () {
            $state.go('^');
          });
      }]
    };

    $stateProvider
      .state('counter.main.passholder.activityTariffs', angular.copy(tariffModal))
      .state('counter.main.advancedSearch.bulkPoints.activityTariffs', angular.copy(tariffModal))
      .state('counter.main.group.activityTariffs', angular.copy(tariffModal))
      .state('counter.main.passholder.activity', angular.copy(activityModal))
      .state('counter.main.advancedSearch.bulkPoints.activity', angular.copy(activityModal))
      .state('counter.main.group.activity', angular.copy(activityModal));
  });
