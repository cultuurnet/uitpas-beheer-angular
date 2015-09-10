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
function ubrDateField() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {

      function dateParser(date) {
        if (date) {
          var day = moment(date, 'DD/MM/YYYY');

          if (day.isValid()) {
            return day.toDate();
          } else {
            return undefined;
          }
        }
      }

      function dateFormatter(date) {
        if (date) {
          return moment(date).format('DD/MM/YYYY');
        }
      }

      ngModel.$parsers.push(dateParser);
      ngModel.$formatters.push(dateFormatter);
      }
  };
}
