'use strict';

/**
 * @ngdoc overview
 * @name ubr.counter.checkin-devices
 * @description
 * # ubr.counter.checkin-devices
 *
 * checkin-devices module UiTPAS Beheer
 */
angular
  .module('ubr.counter.checkin-devices', [
    'ui.router',
    'ubr.counter',
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
