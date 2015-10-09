'use strict';

/**
 * @ngdoc directive
 * @name uitpasbeheerApp.directive:ubrUitpasNumberAsyncValidation
 * @description
 * # Async validation of an UiTPAS number field.
 */
angular
  .module('uitpasbeheerApp')
  .directive('ubrUitpasNumberAsyncValidation', uitpasNumberAsyncValidationDirective);

/* @ngInject */
function uitpasNumberAsyncValidationDirective ($q, passholderService, counterService) {
  var directive = {
    restrict: 'A',
    link: link,
    require: 'ngModel',
    scope: {
     cardSystemId: '=?ubrCardSystem'
    }
  };
  return directive;

  function link(scope, element, attrs, ngModel) {

    function resemblesUitpasNumber(value) {
      return typeof value === 'string' && value.length >= 13;
    }

    ngModel.$asyncValidators.notFound = function (modelValue, viewValue) {
      var uitpasFoundPromise;

      if (!resemblesUitpasNumber(viewValue)) {
        uitpasFoundPromise = $q.resolve(true);
      } else {
        uitpasFoundPromise = passholderService.findPass(viewValue);
      }

      return uitpasFoundPromise;
    };

    ngModel.$asyncValidators.notLocalStock = function (modelValue, viewValue) {
      if (!resemblesUitpasNumber(viewValue)) {
        return $q.when(true);
      }
      var deferred = $q.defer();

      var validateLocalStock = function (pass) {
        if (pass.isLocalStock()) {
          deferred.resolve();
        }
        else {
          deferred.reject();
        }
      };

      var ignoreNotFound = function () {
        deferred.resolve();
      };

      passholderService.findPass(viewValue).then(validateLocalStock, ignoreNotFound);

      return deferred.promise;
    };

    ngModel.$asyncValidators.unavailableForActiveCounter = function (modelValue, viewValue) {
      var deferredValidation = $q.defer();

      var compareWithActiveCounter = function (pass) {
        var matchCounters = function (activeCounter) {
          if (activeCounter.isRegistrationCounter(pass.cardSystem.id)) {
            deferredValidation.resolve();
          } else {
            deferredValidation.reject('Active and pass counter do not match!');
          }
        };

        counterService
          .getActive()
          .then(matchCounters, deferredValidation.resolve);
      };

      if (!resemblesUitpasNumber(viewValue)) {
        deferredValidation.resolve();
      } else {
        passholderService
          .findPass(viewValue)
          .then(compareWithActiveCounter, deferredValidation.resolve);
      }

      return deferredValidation.promise;
    };

    ngModel.$asyncValidators.cardSystemMismatch = function (modelValue, viewValue) {
      var deferredValidation = $q.defer();
      var cardSystemId       = scope.cardSystemId;
      var uitpasNumber       = viewValue;

      var compareCardSystems = function (pass) {
        if (pass.cardSystem.id === cardSystemId) {
          deferredValidation.resolve();
        } else {
          deferredValidation.reject('The card system of the pass does not match.');
        }
      };

      if (cardSystemId) {
        passholderService
          .findPass(uitpasNumber)
          .then(compareCardSystems, deferredValidation.resolve);
      } else {
        deferredValidation.resolve();
      }

      return deferredValidation.promise;
    };
  }
}


