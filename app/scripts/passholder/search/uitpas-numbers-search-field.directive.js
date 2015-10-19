'use strict';

/**
 * @ngdoc directive
 * @name ubr.passholder.search.directive:ubrUitpasNumbersSearchField
 * @description
 * # Validation of the search UiTPAS numbers field.
 */
angular
  .module('ubr.passholder.search')
  .directive('ubrUitpasNumbersSearchField', ubrUitpasNumbersSearchField);

/* @ngInject */
function ubrUitpasNumbersSearchField ($rootScope) {
  var directive = {
    restrict: 'A',
    link: link,
    require: 'ngModel'
  };
  return directive;

  function link(scope, element, attrs, ngModel) {

    function containsOnlyNumbersAndSpaces(value) {
      /**
       * Matches strings containing only numbers and spaces.
       * @type {RegExp}
       */
      var numbersSpacesRegex = /^[\d ]+$/;
      var regexResult = numbersSpacesRegex.exec(value);
      return !(regexResult);
    }

    ngModel.$validators.invalidCharacters = function (modelValue, viewValue) {
      var valid = true;
      if (viewValue) {
        valid = !containsOnlyNumbersAndSpaces(viewValue);
      }
      return valid;
    };

    function passScanned(event, passNumber) {
      var alreadyHasPassnumber = ngModel.$viewValue.indexOf(passNumber) > -1;

      if (!alreadyHasPassnumber) {
        var concatThis = ngModel.$viewValue ? ' ' + passNumber : passNumber;
        var concatenatedNumbers = ngModel.$viewValue + concatThis;
        ngModel.$setViewValue(concatenatedNumbers);
        element.val(concatenatedNumbers);
        scope.$apply();
      }
    }

    var scanListener = $rootScope.$on('nfcNumberReceived', passScanned);

    scope.$on('$destroy', scanListener);
  }
}
