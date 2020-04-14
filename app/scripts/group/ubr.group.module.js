'use strict';

/**
 * @ngdoc overview
 * @name ubr.group
 * @description
 * # ubr.group
 *
 * group module UiTPAS Beheer
 */
angular
  .module('ubr.group', [
    'ui.router',
    'uitpasbeheerApp'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    var getPassFromStateParams = function(passholderService, $stateParams) {
      return passholderService.findPass($stateParams.identification);
    };

    getGroup.$inject = ['$stateParams', 'passholderService', '$q'];
    function getGroup($stateParams, passholderService, $q) {
      var groupId = $stateParams.identification;
      var deferredGroup = $q.defer();

      function pluckGroupFromPass(pass) {
        deferredGroup.resolve(pass.group);
      }
      passholderService
        .findPass(groupId)
        .then(pluckGroupFromPass);

      return deferredGroup.promise;
    }

    $stateProvider
      .state('counter.main.group', {
        url: 'group/:identification',
        requiresCounter: true,
        redirectOnScan: true,
        params: {
          pass: null,
          passholders: null,
          identification: null,
          activityMode: null,
          bulkSelection: null,
          activeCounter: null
        },
        resolve: {
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }],
          pass: getPassFromStateParams,
          group: getGroup,
          passholder: getGroup,
          passholders: function() {
            return null;
          },
          activityMode: function() {
            return 'group';
          },
          bulkSelection: function() {
            return null;
          },
          activeCounter: function (counterService) {
            return counterService.getActive();
          }
        },
        views: {
          'content@counter': {
            templateProvider: function ($templateFactory, pass) {
              var templatePath = 'views/group/activities.html';
              if (pass.isBlocked()) {
                templatePath = 'views/passholder/content-passholder-blocked.html';
              } else if (pass.isExpired()) {
                templatePath = 'views/passholder/content-passholder-group-expired.html';
              }
              return $templateFactory.fromUrl(templatePath);
            },
            controller: 'ActivityController',
            controllerAs: 'ac'
          },
          'sidebar@counter': {
            templateUrl: 'views/group/sidebar-group-details.html',
            controller: 'GroupDetailController',
            controllerAs: 'gdc'
          }
        }
      });
  });
