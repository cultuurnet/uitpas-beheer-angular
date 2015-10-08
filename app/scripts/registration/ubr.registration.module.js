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
          }],
          activeCounter: ['counterService', function (counterService) {
            return counterService.getActive();
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
          pass: ['passholderService', '$stateParams', getPassFromStateParams],
          activeCounter: ['counterService', function (counterService) {
            return counterService.getActive();
          }]
        },
        onEnter : ['pass', 'activeCounter', '$state', '$modal', function(pass, activeCounter, $state, $modal) {
          registrationModalInstance = $modal.open({
            animation: true,
            templateUrl: 'views/registration/multi-step-form.html',
            size: 'lg',
            resolve: {
              pass: function() {
                return pass;
              },
              activeCounter: function() {
                return activeCounter;
              }
            },
            controller: 'RegistrationModalController',
            controllerAs: 'prc'
          });

          function registrationCanceled() {
            $state.go('counter.main.register');
          }

          function passholderRegistered() {
            $state.go('counter.main.passholder', {
              identification: pass.number
            });
          }

          registrationModalInstance
            .result
            .then(passholderRegistered ,registrationCanceled);
        }]
      })
      .state('counter.main.register.form.personalData', {
        url: '/personal-info',
        views: {
          'registrationStep@': {
            templateUrl: 'views/registration/personal-data-step.html'
          }
        },
        params: {
          'pass': null,
          'kansenstatuut': null
        },
        stepNumber: 1
      })
      .state('counter.main.register.form.contactData', {
        url: '/contact-info',
        views: {
          'registrationStep@': {
            templateUrl: 'views/registration/contact-data-step.html'
          }
        },
        stepNumber: 2
      })
      .state('counter.main.register.form.price', {
        url: '/price',
        views: {
          'registrationStep@': {
            templateUrl: 'views/registration/price-data-step.html'
          }
        },
        stepNumber: 3
      });
  });
