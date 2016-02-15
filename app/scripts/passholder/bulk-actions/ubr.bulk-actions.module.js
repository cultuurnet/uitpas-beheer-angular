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
          bulkSelection: null
        },
        resolve: {
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }]
        },
        /* @ngInject */
        onEnter: function(bulkSelection, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-bulk-address.html',
              size: 'sm',
              resolve: {
                bulkSelection: function() {
                  return bulkSelection;
                }
              },
              controller: 'AddressBulkController',
              controllerAs: 'abc'
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
          bulkAddressForm: null,
          bulkSelection: null
        },
        resolve: {
          passholders: ['$stateParams', function($stateParams) {
            return $stateParams.passholders;
          }],
          bulkAddressForm: ['$stateParams', function($stateParams) {
            return $stateParams.bulkAddressForm;
          }],
          bulkSelection: ['$stateParams', function($stateParams) {
            return $stateParams.bulkSelection;
          }]
        },
        onEnter: function(passholders, bulkAddressForm, bulkSelection, $state, $uibModal) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-show-bulk-results.html',
              size: 'sm',
              resolve: {
                passholders: function() {
                  return passholders;
                },
                bulkAddressForm: function() {
                  return bulkAddressForm;
                },
                resolve: {
                  bulkSelection: function() {
                    return bulkSelection;
                  }
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
  });
