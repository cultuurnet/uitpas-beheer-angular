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
            });
        }
      })
      .state('counter.main.advancedSearch.bulkAddress.results', {
        params: {
          passholders: null,
          bulkAddressForm: null
        },
        resolve: {
          passholders: ['$stateParams', function($stateParams) {
            return $stateParams.passholders;
          }],
          bulkAddressForm: ['$stateParams', function($stateParams) {
            return $stateParams.bulkAddressForm;
          }]
        },
        onEnter: function(passholders, bulkAddressForm, $state, $uibModal, bulkSelection) {
          $uibModal
            .open({
              animation: true,
              templateUrl: 'views/passholder/bulk-actions/modal-bulk-address-results.html',
              size: 'sm',
              resolve: {
                passholders: function() {
                  return passholders;
                },
                bulkAddressForm: function() {
                  return bulkAddressForm;
                }
              },
              controller: 'AddressBulkResultsController',
              controllerAs: 'abrc'
            })
            .result
            .finally(function() {
              $state.go('counter.main.advancedSearch', bulkSelection.searchParameters.toParams(), { reload: true });
            });
        }
      })
  });
