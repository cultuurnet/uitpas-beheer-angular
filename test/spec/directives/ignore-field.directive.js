'use strict';

describe('Directive: ignoreField', function () {

  // load the directive's module
  beforeEach(module('uitpasbeheerApp'));

  var element, scope, form;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();

    scope.shouldExclude = false;
    scope.emailAddress = '';

    var inputField = '<input type="email" name="email" ng-model="emailAddress" ubr-ignore-field="shouldExclude">';
    element = angular.element('<form name="form">' + inputField + '</form>');
    scope.$digest();

    $compile(element)(scope);
    form = scope.form;
  }));

  it('should keep validating when ignore-field is false', function () {
    scope.emailAddress = 'hello@world..';
    scope.$digest();

    expect(form.email.$valid).toBeFalsy();
  });

  it('should skip validation and always mark a field as valid when ignore-field is true', function () {
    scope.emailAddress = 'hello@world..';
    scope.shouldExclude = true;
    scope.$digest();

    expect(form.email.$valid).toBeTruthy();
  });

  it('should remove existing validation errors when ignoring a previously validated field', function () {
    scope.emailAddress = 'hello@world..';
    scope.$digest();
    expect(form.email.$error.email).toBeTruthy();

    scope.shouldExclude = true;
    scope.$digest();
    expect(form.email.$error.email).toBeFalsy();
    expect(form.email.$untouched).toBeTruthy();
  });
});
