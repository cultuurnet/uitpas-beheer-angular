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
    function getPassholderFromStateParams(passholderService, counterService, $stateParams) {
      if ($stateParams.activityMode === 'passholders') {
        return passholderService.findPassholder($stateParams.identification);
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
        activity: null,
        activityMode: null,
        bulkSelection: null,
        counter: null
      },
      resolve: {
        passholder: getPassholderFromStateParams,
        passholders: ['$stateParams', function($stateParams) {
          return $stateParams.passholders;
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
        bulkSelection: function($stateParams, SearchParameters, BulkSelection) {
          if(!$stateParams.bulkSelection) {
            var searchParams = new SearchParameters();
            searchParams.fromParams($stateParams);
            var bulkSelection = new BulkSelection(null, searchParams, $stateParams.selection);
            if (!$stateParams.selection) {
              bulkSelection.searchResults.totalItems = $stateParams.totalItems;
              bulkSelection.selectAll = true;
            }
            return bulkSelection;
          }
          else {
            return $stateParams.bulkSelection;
          }
        },
        counter: function(counterService) {
          return counterService.getActive();
        }
      },
      /* @ngInject */
      onEnter: function(passholder, passholders, identification, activity, activityMode, bulkSelection, counter, $state, $uibModal) {
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
              identification: function () {
                return identification;
              },
              activity: function () {
                return activity;
              },
              activityMode: function() {
                return activityMode;
              },
              bulkSelection: function() {
                return bulkSelection;
              },
              counter: function() {
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
      }
    };

    $stateProvider
      .state('counter.main.passholder.activityTariffs', angular.copy(tariffModal))
      .state('counter.main.advancedSearch.bulkPoints.activityTariffs', angular.copy(tariffModal))
      .state('counter.main.passholder.activity', angular.copy(activityModal))
      .state('counter.main.advancedSearch.bulkPoints.activity', angular.copy(activityModal));
  });
