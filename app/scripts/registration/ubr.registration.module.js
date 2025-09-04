"use strict";

/**
 * @ngdoc overview
 * @name ubr.registration
 * @description
 * # ubr.registration
 *
 * registration module UiTPAS Beheer
 */
angular
  .module("ubr.registration", ["ui.router", "uitpasbeheerApp"])
  /* @ngInject */
  .config(function ($stateProvider) {
    var getPassFromStateParams = function (passholderService, $stateParams) {
      if ($stateParams.pass) {
        return $stateParams.pass;
      } else {
        return passholderService.findPass($stateParams.identification);
      }
    };

    var registrationModalInstance;

    redirectOnScan.$inject = ["UiTPASRouter"];
    function redirectOnScan(UiTPASRouter) {
      UiTPASRouter.redirectOnScanEnabled();
    }

    $stateProvider
      .state("counter.main.register", {
        url: "passholder/:identification/register",
        requiresCounter: true,
        redirectOnScan: true,
        onEnter: redirectOnScan,
        params: {
          pass: null,
          identification: null,
        },
        resolve: {
          pass: ["passholderService", "$stateParams", getPassFromStateParams],
          identification: [
            "$stateParams",
            function ($stateParams) {
              return $stateParams.identification;
            },
          ],
          activeCounter: [
            "counterService",
            function (counterService) {
              return counterService.getActive();
            },
          ],
        },
        views: {
          "content@counter": {
            templateUrl: "views/registration/content-passholder-register.html",
            controller: "PassholderRegisterController",
            controllerAs: "prc",
          },
          "sidebar@counter": {
            templateUrl: "views/registration/sidebar-passholder-register.html",
            controller: "PassholderRegisterController",
            controllerAs: "prc",
          },
        },
      })
      .state("counter.main.register.form", {
        abstract: true,
        resolve: {
          pass: ["passholderService", "$stateParams", getPassFromStateParams],
          activeCounter: [
            "counterService",
            function (counterService) {
              return counterService.getActive();
            },
          ],
        },
        onEnter: [
          "pass",
          "activeCounter",
          "$state",
          "$uibModal",
          function (pass, activeCounter, $state, $uibModal) {
            registrationModalInstance = $uibModal.open({
              animation: true,
              templateUrl: "views/registration/multi-step-form.html",
              size: "lg",
              backdrop: "static",
              keyboard: false,
              resolve: {
                pass: function () {
                  return pass;
                },
                activeCounter: function () {
                  return activeCounter;
                },
              },
              controller: "RegistrationModalController",
              controllerAs: "prc",
            });

            function passholderRegistered() {
              $state.go("counter.main.passholder", {
                identification: pass.number,
                destination: {
                  route: "counter.main",
                  params: {},
                },
              });
            }

            registrationModalInstance.result.then(passholderRegistered);
          },
        ],
      })
      .state("counter.main.register.form.personalData", {
        url: "/personal-info",
        views: {
          "registrationStep@": {
            templateUrl: "views/registration/personal-data-step.html",
          },
        },
        params: {
          pass: null,
          kansenstatuut: null,
          school: null,
          registerForeign: null,
        },
        stepNumber: 1,
      })
      .state("counter.main.register.form.contactData", {
        url: "/contact-info",
        views: {
          "registrationStep@": {
            templateUrl: "views/registration/contact-data-step.html",
          },
        },
        stepNumber: 2,
      })
      .state("counter.main.register.form.optIns", {
        url: "/opt-ins",
        views: {
          "registrationStep@": {
            templateUrl: "views/registration/opt-ins-data-step.html",
          },
        },
        stepNumber: 3,
      })
      .state("counter.main.register.form.price", {
        url: "/price",
        views: {
          "registrationStep@": {
            templateUrl: "views/registration/price-data-step.html",
          },
        },
        stepNumber: 4,
      });
  });
