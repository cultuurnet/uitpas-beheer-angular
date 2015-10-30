'use strict';

/**
 * @ngdoc overview
 * @name ubr.passholder.search
 * @description
 * # ubr.search
 *
 * counter module UiTPAS Beheer
 */
angular
  .module('ubr.passholder.search', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {
    $stateProvider
      .state('counter.main.advancedSearch', {
        url: 'search?name&firstName&street&city&membershipAssociationId&membershipStatus&email&uitpasNumber',
        requiresCounter: true,
        resolve: {
          /* @ngInject */
          activeCounterAssociations: function (counterService) {
            return counterService.getAssociations();
          },
          /* @ngInject */
          activeCounter: function (counterService) {
            return counterService.getActive();
          }
        },
        params: {
          'activeCounterAssociations': null,
          'activeCounter': null
        },
        views: {
          'content@counter': {
            templateUrl: 'views/passholder/search/result-viewer.html',
            controller: 'ResultsViewerController',
            controllerAs: 'rvc'
          },
          'sidebar@counter': {
            templateUrl: 'views/passholder/search/sidebar-advanced-search-form.html',
            controller: 'PassholderAdvancedSearchController',
            controllerAs: 'pasc'
          }
        }
      });
  });
