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
        url: 'search',
        requiresCounter: true,
        resolve: {
          /* @ngInject */
          activeCounter: function (counterService) {
            return counterService.getActive();
          }
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
