'use strict';

/**
 * @ngdoc directive
 * @name ubr.search.directive:ubrSearchUitpasNumbersValidation
 * @description
 * # Validation of the search UiTPAS numbers field.
 */
angular
  .module('ubr.search')
  .directive('ubrSearchUitpasNumbersValidation', ubrSearchUitpasNumbersValidation);

/* @ngInject */
function ubrSearchUitpasNumbersValidation () {
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

    function resemblesUitpasNumber(value) {
      /**
       * Matches strings containing exactly 13 digits.
       * @type {RegExp}
       */
      var resembleUitpasNumberRegex = /^\d{13}$/;
      return (resembleUitpasNumberRegex.exec(value));
    }

    ngModel.$validators.invalidCharacters = function (modelValue, viewValue) {
      return !containsOnlyNumbersAndSpaces(viewValue);
    };

    ngModel.$validators.invalidNumber = function (modelValue, viewValue) {
      var invalidNumbers = [];
      if (viewValue) {
        var givenNumbers = viewValue.split(' ');
        angular.forEach(givenNumbers, function (number) {
          if (!resemblesUitpasNumber(number)) {
            invalidNumbers.push(number);
          }
        });
      }

      scope.pasc.invalidNumbers = invalidNumbers;
      return (invalidNumbers.length === 0);
    };
  }
}


