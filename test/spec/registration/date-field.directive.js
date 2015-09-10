'use strict';

describe('Directive: datepicker', function () {

  beforeEach(module('ubr.registration'));

  var dateInput, scope, form;

  beforeEach(inject(function($injector, $rootScope, $compile) {
    scope = $rootScope.$new();
    scope.date = new Date('2012-12-12');

    var inputTemplate = '<input type="text" ng-model="date" ubr-date-field name="date" />';
    var formTemplate = '<form name="greenForm">' + inputTemplate + '</form>';

    var formElement = $compile(formTemplate)(scope);
    dateInput = formElement.find('input[ubr-date-field]');
    form = scope.greenForm;
    scope.$apply();
  }));

  it('should invalidate a wrongly formatted date', function () {
    form.date.$setViewValue('Hey-o!');
    expect(form.date.$invalid).toBeTruthy();
  });

  it('should parse a correctly formatted date string to a date object', function () {
    var expectedDate = moment('1955-05-05').toDate();
    form.date.$setViewValue('05/05/1955');

    expect(form.date.$invalid).toBeFalsy();
    expect(scope.date).toEqual(expectedDate)
  });
});