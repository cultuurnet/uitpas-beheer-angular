'use strict';

describe('Directive: datepicker', function () {

  beforeEach(module('ubr.registration'));
  beforeEach(module('uitpasbeheerAppViews'));

  var element, scope, datepicker;

  beforeEach(inject(function($injector, $rootScope, $compile){
    scope = $rootScope.$new();
    scope.date = moment('2012-12-12');

    var directiveElement = '<ubr-datepicker ng-model="date" ubr-label="Some date" ubr-id="some-date-id" name="someDate"></ubr-datepicker>';
    // The element has to be a child of a parent that has position relative else the datepicker won't open.
    var template = '<div style="position: relative;">' + directiveElement + '</div>';

    element = $compile(template)(scope);
    scope.$digest();

    datepicker = getDatepicker();
  }));

  function getDatepicker() {
    var dateInputElement = element.find('input'),
        datepicker = dateInputElement.data('DateTimePicker');

    return datepicker;
  }

  it('should initialize with the date that is passed as a model', function () {
    var date = datepicker.date();
    var expectedDate = moment("12-12-2012", "MM-DD-YYYY");

    expect(date.isSame(expectedDate)).toBeTruthy();
  });

  it('should show the datepicker when the input button is clicked', function () {
    var dateButtonElement = element.find('button');

    var datepickerShowSpy = jasmine.createSpy('dp.show event Spy');
    element.on('dp.show', datepickerShowSpy);

    // Make sure the datepicker is hidden before trying to open it.
    datepicker.hide();
    dateButtonElement.click();

    expect(datepickerShowSpy).toHaveBeenCalled();
  });

  it('it should flag the input field as touched after it received focus', function () {
    var dateInputElement = element.find('input');
    var ngModelController = dateInputElement.controller('ngModel');

    expect(ngModelController.$touched).toBeFalsy();

    dateInputElement.blur();

    expect(ngModelController.$touched).toBeTruthy();
  });

  it('should include the timezone when changing dates', function () {
    datepicker.date(moment('2001-01-01'));
    var date = scope.date;
    var expectedDate = moment('2001-01-01');

    expect(date.isSame(expectedDate)).toBeTruthy();
  });
});