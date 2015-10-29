'use strict';

/**
 * @ngdoc directive
 * @name uitpasbeheerApp.directive:ubrInszNumberValidation
 * @description
 * # INSZ number validation directive.
 */
angular
  .module('uitpasbeheerApp')
  .directive('ubrInszNumberValidation', inszNumberValidation);

function inszNumberValidation() {
  var directive = {
    restrict: 'A',
    require: '^form',
    link: link
  };

  return directive;

  function link(scope, element, attrs, form) {
    /**
     * examples:
     * - 930518-223-61
     * - 93051822361
     * - 930518 223 61
     * - 930518.223.61
     * - 93.05.18-223.61
     */
    var regex = /([\d]{2})[-.\s]?([\d]{2})[-.\s]?([\d]{2})[-.\s]?([\d]{3})[-.\s]?([\d]{2}$)/;

    /**
     * Check if the insz number indicates the birth date as unknown.
     * The month or day is 0.
     *
     * @param inszNumberRegexResult
     * @returns {boolean}
     */
    function shouldCheckInszNumberWithBirthDate(inszNumberRegexResult) {
      var inszMonth = parseInt(getMonthFromInszNumberRegexResult(inszNumberRegexResult));
      return (inszMonth !== 0 && parseInt(inszNumberRegexResult[3]) !== 0);
    }

    /**
     * Check if the insz number indicates the gender as unknown.
     * The month has 20 added to it.
     *
     * @param inszNumberRegexResult
     * @returns {boolean}
     */
    function shouldCheckInszNumberWithGender(inszNumberRegexResult) {
      // Don't check the gender if the month has 20 added to it.
      return !(inszNumberRegexResult[2] >= 20 && inszNumberRegexResult[2] <= 32);
    }

    /**
     * Returns the month from the regex result. Takes into that it might have been adjusted with 20 or 40.
     *
     * @param inszNumberRegexResult
     * @returns {int}
     */
    function getMonthFromInszNumberRegexResult(inszNumberRegexResult) {
      var correctedMonth = inszNumberRegexResult[2];

      var correctMonth = function (month) {
        return month - 20;
      };

      while (correctedMonth > 12) {
        correctedMonth = correctMonth(correctedMonth);
      }

      return correctedMonth;
    }

    function isEven(x) {
      return (x%2) === 0;
    }

    function getDayFromDate(date) {
      return ('0' + date.getDate()).slice(-2);
    }

    function getMonthFromDate(date) {
      return ('0' + (date.getMonth() + 1)).slice(-2);
    }

    function getYearFromDate(date) {
      return date.getFullYear().toString().substr(2,2);
    }

    function validateInszNumberGender(inszNumberRegexResult, gender, errorMessages) {
      if (gender && inszNumberRegexResult && shouldCheckInszNumberWithGender(inszNumberRegexResult)) {
        if (gender === 'FEMALE' && !isEven(inszNumberRegexResult[4])) {
          errorMessages.gender = 'INSZNUMBER_GENDER_NOT_FEMALE';
        }
        if (gender === 'MALE' && isEven(inszNumberRegexResult[4])) {
          errorMessages.gender = 'INSZNUMBER_GENDER_NOT_MALE';
        }
      }
    }

    function validateInszNumberBirthDate(inszNumberRegexResult, birthDate, errorMessages) {
      if (inszNumberRegexResult && birthDate && shouldCheckInszNumberWithBirthDate(inszNumberRegexResult)) {
        var inzsMonth = getMonthFromInszNumberRegexResult(inszNumberRegexResult);
        if (getYearFromDate(birthDate) !== inszNumberRegexResult[1] || (parseInt(getMonthFromDate(birthDate)) !== parseInt(inzsMonth) || getDayFromDate(birthDate) !== inszNumberRegexResult[3])) {
          errorMessages.dateOfBirth = 'INSZNUMBER_DATE_MISMATCH';
        }
      }
    }

    function validateInszNumberCheckDigit(inszNumberRegexResult, errorMessages) {
      if (inszNumberRegexResult) {
        var checkDigit = inszNumberRegexResult[5];
        var checklessNumber = inszNumberRegexResult[1] + inszNumberRegexResult[2] + inszNumberRegexResult[3] + inszNumberRegexResult[4];

        var rest = checklessNumber % 97;
        var expectedCheckDigit = String(97 - rest);
        if (expectedCheckDigit.length === 1) {
          expectedCheckDigit = '0' + expectedCheckDigit;
        }

        var rest2000 = ('2' + checklessNumber) % 97;
        var expectedCheckDigit2000 = String(97 - rest2000);
        if (expectedCheckDigit2000.length === 1) {
          expectedCheckDigit2000 = '0' + expectedCheckDigit2000;
        }

        if (expectedCheckDigit !== checkDigit && expectedCheckDigit2000 !== checkDigit) {
          errorMessages.checkDigit = 'INSZNUMBER_WRONG_CHECKDIGIT';
        }
      }
    }

    scope.$watch(function () {return form.inszNumber.$viewValue;}, function() {
      var inszNumber = form.inszNumber.$viewValue;
      var gender = form.gender.$viewValue;
      var birthDate = form.dateOfBirth.$modelValue;
      var regexResult = regex.exec(inszNumber);
      var errorMessages = {};

      if (inszNumber && !regexResult) {
        form.inszNumber.$setValidity('inszNumber', false);
      } else {
        form.inszNumber.$setValidity('inszNumber', true);
      }

      validateInszNumberGender(regexResult, gender, errorMessages);
      if (birthDate) {
        validateInszNumberBirthDate(regexResult, birthDate, errorMessages);
      }
      validateInszNumberCheckDigit(regexResult, errorMessages);

      if (errorMessages.hasOwnProperty('gender')) {
        form.inszNumber.$setValidity('gender', false);
        form.gender.$setValidity('inszNumber', false);
      }
      else {
        form.inszNumber.$setValidity('gender', true);
        form.gender.$setValidity('inszNumber', true);
      }

      if (errorMessages.hasOwnProperty('dateOfBirth')) {
        if (form.dateOfBirth) {
          form.dateOfBirth.$setTouched();
          form.dateOfBirth.$setValidity('inszNumber', false);
        }
        form.inszNumber.$setValidity('dateOfBirth', false);
      }
      else {
        form.inszNumber.$setValidity('dateOfBirth', true);

        if (form.dateOfBirth) {
          form.dateOfBirth.$setValidity('inszNumber', true);
        }
      }

      if (errorMessages.hasOwnProperty('checkDigit')) {
        form.inszNumber.$setValidity('checkDigit', false);
      }
      else {
        form.inszNumber.$setValidity('checkDigit', true);
      }

      // Remove the inUse invalidity when the value of the field changes.
      form.inszNumber.$setValidity('inUse', true);
    });

    scope.$watch(function () {return form.gender.$viewValue;}, function() {
      var inszNumber = form.inszNumber.$viewValue;
      var gender = form.gender.$viewValue;
      var regexResult = regex.exec(inszNumber);
      var errorMessages = {};

      validateInszNumberGender(regexResult, gender, errorMessages);

      if (errorMessages.hasOwnProperty('gender')) {
        form.gender.$setValidity('inszNumber', false);
        form.inszNumber.$setValidity('gender', false);
        form.gender.$setTouched();
      }
      else {
        form.gender.$setValidity('inszNumber', true);
        form.inszNumber.$setValidity('gender', true);
      }
    });

    scope.$watch(function () {return form.dateOfBirth && form.dateOfBirth.$viewValue;}, function() {
      if (!form.inszNumber || !form.dateOfBirth) {
        return;
      }

      var inszNumber = form.inszNumber.$viewValue;

      var errorMessages = {};

      if (form.dateOfBirth.$viewValue) {
        var birthDate = form.dateOfBirth.$modelValue;
        var regexResult = regex.exec(inszNumber);

        validateInszNumberBirthDate(regexResult, birthDate, errorMessages);
      }

      if (errorMessages.hasOwnProperty('dateOfBirth')) {
        form.dateOfBirth.$setValidity('inszNumber', false);
        form.inszNumber.$setValidity('dateOfBirth', false);
      }
      else {
        form.dateOfBirth.$setValidity('inszNumber', true);
        form.inszNumber.$setValidity('dateOfBirth', true);
      }
    });
  }
}
