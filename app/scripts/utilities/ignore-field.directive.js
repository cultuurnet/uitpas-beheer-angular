'use strict';

/**
 * @ngdoc directive
 * @name ubr.utilities.directive:ubrIgnoreField
 * @description
 * # ignore field directive.
 */
angular
  .module('ubr.utilities')
  .directive('ubrIgnoreField', ignoreFieldDirective);

/* @ngInject */
function ignoreFieldDirective () {
  var directive = {
    restrict: 'A',
    link: link,
    require: 'ngModel',
    scope: {
      ignore: '=ubrIgnoreField'
    }
  };
  return directive;

  function link(scope, element, attrs, ngModel) {

    var defaultValidators = ngModel.$validators;

    function toggleValidation(shouldValidate) {
      if (shouldValidate) {
        ngModel.$validators = defaultValidators;
      } else {
        ngModel.$validators = {};
        ngModel.$error = {};
        ngModel.$setUntouched();
      }
      ngModel.$validate();
    }

    scope.$watch('ignore', function (shouldIgnore) {
      toggleValidation(!shouldIgnore);
    });
  }
}


