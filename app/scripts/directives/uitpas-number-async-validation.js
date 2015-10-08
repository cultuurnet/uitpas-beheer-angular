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
function uitpasNumberAsyncValidationDirective ($q, passholderService) {
  var directive = {
    restrict: 'A',
    link: link,
    require: 'ngModel'
  };
  return directive;

  function link(scope, element, attrs, ngModel) {
    ngModel.$asyncValidators.notFound = function (modelValue, viewValue) {
      if (!viewValue || viewValue < 13) {
        return $q.when(true);
      }

      return passholderService.findPass(viewValue);
    };
    ngModel.$asyncValidators.notLocalStock = function (modelValue, viewValue) {
      if (!viewValue || viewValue < 13) {
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
  }
}


