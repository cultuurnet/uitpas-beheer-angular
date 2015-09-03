'use strict';

/**
 * @ngdoc directive
 * @name ubr.registration.directive:ubrDatepicker
 * @description
 * # ubrDatepicker
 */
angular
  .module('ubr.registration')
  .directive('ubrDatepicker', ubrDatepicker);

/* @ngInject */
function ubrDatepicker() {
  return {
    templateUrl: 'views/registration/datepicker.directive.html',
    restrict: 'E',
    require:'ngModel',
    scope: {
      name: '@name',
      label: '@ubrLabel',
      id: '@ubrId'
    },
    link: function postLink(scope, element, attrs, ngModel) {

      var dateInputElement = element.find('input');

      var datepicker = {
        opened: false,
        date: ngModel.$viewValue,
        name: scope.name,
        label: scope.label,
        id: scope.id
      };

      datepicker.updateModel = function (changeEvent) {
        // The changeEvent date properties contains a Moment object
        var date = changeEvent.date.toDate();
        ngModel.$setViewValue(date);
      };

      dateInputElement.datetimepicker({
        locale: 'nl',
        format: 'DD/MM/YYYY',
        icons: {
          time: 'fa fa-clock-o',
          date: 'fa fa-calendar',
          up: 'fa fa-arrow-up',
          down: 'fa fa-arrow-down',
          previous: 'fa fa-arrow-left',
          next: 'fa fa-arrow-right',
          today: 'fa fa-calendar-check-o',
          clear: 'fa fa-trash',
          close: 'fa fa-times'
        }
      }).on('dp.change', datepicker.updateModel);

      ngModel.$render = function () {
        dateInputElement.data('DateTimePicker').date(ngModel.$viewValue);
      };

      datepicker.toggle = function () {
        dateInputElement.data('DateTimePicker').toggle();
      };

      scope.datepicker = datepicker;
    }
  };
}
