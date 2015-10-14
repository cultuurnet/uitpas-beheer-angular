'use strict';

/**
 * @ngdoc directive
 * @name ubr.passholder.search.directive:ubrSearchUitpasNumbersValidation
 * @description
 * # Validation of the search UiTPAS numbers field.
 */
angular
  .module('ubr.passholder.search')
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

    ngModel.$validators.invalidCharacters = function (modelValue, viewValue) {
      var valid = true;
      if (viewValue) {
        valid = !containsOnlyNumbersAndSpaces(viewValue);
      }
      return valid;
    };
  }
}
