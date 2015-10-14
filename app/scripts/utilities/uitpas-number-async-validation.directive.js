'use strict';

/**
 * @ngdoc directive
 * @name ubr.utilities.directive:ubrUitpasNumberAsyncValidation
 * @description
 * # Async validation of an UiTPAS number field.
 */
angular
  .module('ubr.utilities')
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

    var lastSearch = false;
    function findPass(identification) {
      if (identification !== lastSearch.identification) {
        lastSearch = {
          identification: identification,
          result: passholderService.findPass(identification)
        };
      }
      return $q.when(lastSearch.result);
    }

    ngModel.$asyncValidators.notFound = function (modelValue, viewValue) {
      var uitpasFoundPromise;

      if (!resemblesUitpasNumber(viewValue)) {
        uitpasFoundPromise = $q.resolve(true);
      } else {
        uitpasFoundPromise = findPass(viewValue);
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

      findPass(viewValue)
        .then(validateLocalStock, ignoreNotFound);

      return deferred.promise;
    };

    ngModel.$asyncValidators.unavailableForActiveCounter = function (modelValue, viewValue) {
      var deferredValidation = $q.defer();

      var compareWithActiveCounter = function (pass) {

        var checkIfBalieError = function (error) {
          if (error.code === 'BALIE_NOT_AUTHORIZED') {
            deferredValidation.reject(error);
          } else {
            deferredValidation.resolve();
          }
        };

        counterService
          // TODO: match against the counter of the pass instead of fetching the price
          .getRegistrationPriceInfo(pass)
          .then(deferredValidation.resolve, checkIfBalieError);
      };

      if (!resemblesUitpasNumber(viewValue)) {
        deferredValidation.resolve();
      } else {
        findPass(viewValue)
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
        findPass(uitpasNumber)
          .then(compareCardSystems, deferredValidation.resolve);
      } else {
        deferredValidation.resolve();
      }

      return deferredValidation.promise;
    };
  }
}


