'use strict';

/**
 * @ngdoc overview
 * @name ubr.checkindevices
 * @description
 * # ubr.checkindevices
 *
 * checkindevices module UiTPAS Beheer
 */
angular
  .module('ubr.checkindevices', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    $stateProvider.state(
      'counter.checkindevices',
      {
        url: '/checkindevices',
        requiresCounter: true,
        views: {
          content: {
            templateUrl: 'views/checkindevices/content-checkindevices.html',
            controller: 'CheckInDevicesConnectionsController',
            controllerAs: 'cidc'
          },
          sidebar: {
            templateUrl: 'views/checkindevices/sidebar-checkindevices.html'
          },
          header: {
            templateUrl: 'views/header.html'
          }
        }
      }
    );
  });
