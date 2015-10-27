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
          activeCounterAssociations: function (counterService) {
            //return counterService.getAssociations();
            // @todo: Use the service to get real data once the silex callback is iin place.
            return [
              {
                id: 1,
                name:'Chiro Jongens',
                enddateCalculation: 'FREE',
                enddateCalculationFreeDate: 1451602799,
                enddateCalculationValidityTime: 30,
                permissionRead: true,
                permissionRegister: false,
                cardSystems: []
              },
              {
                id: 2,
                name:'Boyscouts from hell',
                enddateCalculation: 'BASED_ON_DATE_OF_BIRTH',
                enddateCalculationFreeDate: 1451602799,
                enddateCalculationValidityTime: 30,
                permissionRead: true,
                permissionRegister: false,
                cardSystems: []
              },
              {
                id: 3,
                name:'Karel & Jos gaan er op los',
                enddateCalculation: 'BASED_ON_REGISTRATION_DATE',
                enddateCalculationFreeDate: 1451602799,
                enddateCalculationValidityTime: 30,
                permissionRead: true,
                permissionRegister: false,
                cardSystems: []
              }
            ];
          }
        },
        params: {
          'activeCounterAssociations': null
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
