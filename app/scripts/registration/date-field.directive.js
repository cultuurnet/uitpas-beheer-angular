'use strict';

/**
 * @ngdoc directive
 * @name ubr.registration.directive:ubrDateField
 * @description
 * # ubrDateField
 */
angular
  .module('ubr.registration')
  .directive('ubrDateField', ubrDateField);

/* @ngInject */
function ubrDateField(day) {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {

      function dateParser(dayString) {
        if (dayString) {
          console.log(dayString);
          var moment = day(dayString, 'D/M/YYYY');

          if (moment.isValid()) {
            return moment.toDate();
          } else {
            return undefined;
          }
        } else {
          return null;
        }
      }

      function dateFormatter(date) {
        if (date) {
          return moment(date).format('DD/MM/YYYY');
        } else {
          return '';
        }
      }

      ngModel.$parsers.push(dateParser);
      ngModel.$formatters.push(dateFormatter);
      }
  };
}
