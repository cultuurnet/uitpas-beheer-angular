'use strict';

/**
 * @ngdoc overview
 * @name ubr.passholder.bulkActions
 * @description
 * # ubr.bulkActions
 *
 * bulkActions module UiTPAS Beheer
 */
angular
  .module('ubr.passholder.bulkActions', [
    'ui.router',
    'uitpasbeheerApp'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    $stateProvider
      .state('counter.main.advancedSearch.bulkAddress', {
        params: {
          bulkSelection: null,
          action: null
        },
        resolve: {
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }],
          action: ['$stateParams', function($stateParams) {
            return $stateParams.action;
          }]
        },
        /* @ngInject */
        onEnter: function(bulkSelection, action, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-bulk-address.html',
              size: 'sm',
              resolve: {
                bulkSelection: function() {
                  return bulkSelection;
                },
                action: function() {
                  return action;
                }
              },
              controller: 'BulkActionsController',
              controllerAs: 'bac'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }
      })
      .state('counter.main.advancedSearch.bulkKansenstatuut', {
        params: {
          bulkSelection: null,
          action: null
        },
        resolve: {
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }],
          action: ['$stateParams', function($stateParams) {
            return $stateParams.action;
          }]
        },
        /* @ngInject */
        onEnter: function(bulkSelection, action, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-bulk-kansenstatuut.html',
              size: 'sm',
              resolve: {
                bulkSelection: function() {
                  return bulkSelection;
                },
                action: function() {
                  return action;
                }
              },
              controller: 'BulkActionsController',
              controllerAs: 'bac'
            })
            .result
            .finally(function() {
              $state.go('^');
            });
        }
      })
      .state('counter.main.advancedSearch.showBulkResults', {
        params: {
          passholders: null,
          bulkForm: null,
          bulkSelection: null,
          action: null
        },
        resolve: {
          passholders: ['$stateParams', function($stateParams) {
            return $stateParams.passholders;
          }],
          bulkForm: ['$stateParams', function($stateParams) {
            return $stateParams.bulkForm;
          }],
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }],
          action: ['$stateParams', function($stateParams) {
            return $stateParams.action;
          }]
        },
        onEnter: function(passholders, bulkForm, bulkSelection, action, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-show-bulk-results.html',
              size: 'sm',
              resolve: {
                passholders: function() {
                  return passholders;
                },
                bulkForm: function() {
                  return bulkForm;
                },
                action: function() {
                  return action;
                },
                resolve: {
                  bulkSelection: function() {
                    return bulkSelection;
                  }
                },
                activeCounter: function (counterService) {
                  return counterService.getActive();
                }
              },
              controller: 'ShowBulkResultsController',
              controllerAs: 'sbrc'
            })
            .result
            .finally(function() {
              $state.go('counter.main.advancedSearch', bulkSelection.searchParameters.toParams(), { reload: true });
            });
        }
      })
      .state('counter.main.advancedSearch.bulkPoints', {
        url: '/bulkactions/points',
        requiresCounter: true,
        reloadOnSearch: false,
        params: {
          'activeCounterAssociations': null,
          'activeCounter': null,
          bulkSelection: null,
          action: null,
          $uibModalInstance: null,
          passholder: null
        },
        resolve: {
          /* @ngInject */
          activeCounterAssociations: function (counterService) {
            return counterService.getAssociations();
          },
          /* @ngInject */
          activeCounter: function (counterService) {
            return counterService.getActive();
          },
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }],
          action: ['$stateParams', function($stateParams) {
            return $stateParams.action;
          }],
          $uibModalInstance: ['$stateParams', function($stateParams) {
            return $stateParams.$uibModalInstance;
          }],
          passholder: ['$stateParams', function($stateParams) {
            $stateParams.passholder = {
              gender: 'MALE',
              inszNumber: '',
              nationality: 'belg',
              passNumber: '0930000005015',
              picture: '',
              points: 3,
              remarks: '',
              school: null,
              uid: 'a52f7de7-e4a9-480b-8a04-fefde55acfa5'
            };
            return $stateParams.passholder;
          }]
        },
        views: {
          'content@counter': {
            templateUrl: 'views/activity/content-passholder-activities.html',
            controller: 'ActivityController',
            controllerAs: 'ac'
          },
          'sidebar@counter': {
            templateUrl: 'views/passholder/bulk-actions/selected-passholders.html',
            controller: 'BulkActionsController',
            controllerAs: 'bac'
          }
        }
      });
  });
