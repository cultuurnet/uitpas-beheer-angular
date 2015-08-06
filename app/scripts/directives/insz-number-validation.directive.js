'use strict';

/**
 * @ngdoc directive
 * @name uitpasbeheerApp.directive:inszNumberValidation
 * @description
 * # inszNumberValidation
 */
angular.module('uitpasbeheerApp')
  .directive('inszNumberValidation', function () {
    return {
      restrict: 'A',
      require: '^form',
      link: function validateInszNumber(scope, element, attrs, form) {
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
            var rest = (inszNumberRegexResult[1] + inszNumberRegexResult[2] + inszNumberRegexResult[3] + inszNumberRegexResult[4]) % 97;
            if (String(97 - rest) !== inszNumberRegexResult[5]) {
              console.log(97 - rest);
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
    };
  });
