'use strict';

/**
 * @ngdoc overview
 * @name ubr.registration
 * @description
 * # ubr.registration
 *
 * registration module UiTPAS Beheer
 */
angular
  .module('ubr.registration', [
    'ui.router',
    'uitpasbeheerApp'
  ])
  /* @ngInject */
  .config(function ($stateProvider) {

    var getPassFromStateParams = function(passholderService, $stateParams) {
      if ($stateParams.pass) {
        return $stateParams.pass;
      }
      else {
        return passholderService.findPass($stateParams.identification);
      }
    };

    var registrationModalInstance;

    $stateProvider
      .state('counter.main.register', {
        url: 'passholder/:identification/register',
        requiresCounter: true,
        params: {
          pass: null,
          identification: null
        },
        resolve: {
          pass: ['passholderService', '$stateParams', getPassFromStateParams],
          identification: ['$stateParams', function($stateParams) {
            return $stateParams.identification;
          }]
        },
        views: {
          'content@counter': {
            templateUrl: 'views/registration/content-passholder-register.html',
            controller: 'PassholderRegisterController',
            controllerAs: 'prc'
          },
          'sidebar@counter': {
            templateUrl: 'views/sidebar-passholder-register.html',
            controller: 'PassholderRegisterController',
            controllerAs: 'prc'
          }
        }
      })
      .state('counter.main.register.form', {
        abstract: true,
        resolve: {
          pass: ['passholderService', '$stateParams', getPassFromStateParams]
        },
        onEnter : ['pass', '$state', '$modal', function(pass, $state, $modal) {
          console.log('opening multi-step registration modal form');
          registrationModalInstance = $modal.open({
            animation: true,
            templateUrl: 'views/registration/multi-step-form.html',
            params: {
              'pass': null
            },
            size: 'lg',
            resolve: {
              pass: function() {
                return pass;
              }
            },
            controller: 'RegistrationModalController',
            controllerAs: 'prc'
          });

          registrationModalInstance
            .result
            .finally(function() {
              console.log('modal closed, moving to parent');
              $state.go('counter.main.register');
          });
        }]
      })
      .state('counter.main.register.form.personalData', {
        url: '/personal-info',
        views: {
          'registrationStep@': {
            templateUrl: 'views/registration/personal-data-step.html'
          }
        }
      })
      .state('counter.main.register.form.contactData', {
        url: '/contact-info',
        views: {
          'registrationStep@': {
            templateUrl: 'views/registration/contact-data-step.html'
          }
        }
      })
      .state('counter.main.register.form.price', {
        url: '/price',
        views: {
          'registrationStep@': {
            templateUrl: 'views/registration/price-data-step.html'
          }
        }
      });
  });
