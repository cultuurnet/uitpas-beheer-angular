'use strict';

/**
 * @ngdoc overview
 * @name ubr.help
 * @description
 * # ubr.help
 *
 * Help module UiTPAS Beheer.
 */
angular
  .module('ubr.help', [
    'ui.router',
    'uitpasbeheerApp',
    'truncate'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    $stateProvider
      .state('counter.main.help', {
        url: 'help',
        requiresCounter: true,
        redirectOnScan: true,
        views: {
          'content@counter': {
            templateUrl: 'views/help/content-help.html',
            controller: 'HelpController',
            controllerAs: 'hc'
          },
          'sidebar@counter': {
            templateUrl: 'views/help/sidebar-help.html',
            controller: 'HelpController',
            controllerAs: 'hc'
          }
        }
      })
      .state('counter.main.help.edit', {
        url: '/edit',
        views: {
          'content@counter': {
            templateUrl: 'views/help/content-help-edit.html',
            controller: 'HelpController',
            controllerAs: 'hc'
          },
          'sidebar@counter': {
            templateUrl: 'views/help/sidebar-help-edit.html',
            controller: 'HelpController',
            controllerAs: 'hc'
          }
        }
      });
  });

