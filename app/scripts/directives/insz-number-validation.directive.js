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
      if (gender && inszNumberRegexResult) {
        if (gender === 'FEMALE' && !isEven(inszNumberRegexResult[4])) {
          errorMessages.gender = 'INSZNUMBER_GENDER_NOT_FEMALE';
        }
        if (gender === 'MALE' && isEven(inszNumberRegexResult[4])) {
          errorMessages.gender = 'INSZNUMBER_GENDER_NOT_MALE';
        }
      }
    }

    function validateInszNumberBirthDate(inszNumberRegexResult, birthDate, errorMessages) {
      if (inszNumberRegexResult && birthDate) {
        if (getYearFromDate(birthDate) !== inszNumberRegexResult[1] || (getMonthFromDate(birthDate) !== inszNumberRegexResult[2] || getDayFromDate(birthDate) !== inszNumberRegexResult[3])) {
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
      var birthDate = new Date(form.dateOfBirth.$viewValue);
      var regexResult = regex.exec(inszNumber);
      var errorMessages = {};

      validateInszNumberGender(regexResult, gender, errorMessages);
      validateInszNumberBirthDate(regexResult, birthDate, errorMessages);
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
        form.dateOfBirth.$setTouched();
        form.inszNumber.$setValidity('dateOfBirth', false);
        form.dateOfBirth.$setValidity('inszNumber', false);
      }
      else {
        form.inszNumber.$setValidity('dateOfBirth', true);
        form.dateOfBirth.$setValidity('inszNumber', true);
      }

      if (errorMessages.hasOwnProperty('checkDigit')) {
        form.inszNumber.$setValidity('checkDigit', false);
      }
      else {
        form.inszNumber.$setValidity('checkDigit', true);
      }
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

    scope.$watch(function () {return form.dateOfBirth.$viewValue;}, function() {
      var inszNumber = form.inszNumber.$viewValue;
      var birthDate = new Date(form.dateOfBirth.$viewValue);
      var regexResult = regex.exec(inszNumber);
      var errorMessages = {};

      validateInszNumberBirthDate(regexResult, birthDate, errorMessages);

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
