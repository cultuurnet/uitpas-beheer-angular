'use strict';

describe('Directive: inszNumberValidation', function () {

  // load the directive's module
  beforeEach(module('uitpasbeheerApp'));
  beforeEach(module('uitpasbeheerAppViews'));

  var formElement,
      scope,
      form;

  beforeEach(inject(function ($rootScope, $templateCache, $compile) {
    scope = $rootScope.$new();

    var inszNumberInputTemplate = '<input type="text" name="inszNumber" ng-model="inszNumber">',
        dateInputTemplate = '<input type="text" name="dateOfBirth" ng-model="dateOfBirth">',
        genderInputTemplate = '<input type="radio" name="gender" value="MALE" ng-model="gender"><input type="radio" name="gender" value="FEMALE" ng-model="gender">';
    formElement = angular.element('<form name="form" ubr-insz-number-validation>' + inszNumberInputTemplate + dateInputTemplate + genderInputTemplate + '</form>');

    scope.inszNumber = '93051822361';
    scope.dateOfBirth = new Date('1993-05-18');
    scope.gender = 'MALE';
    $compile(formElement)(scope);
    form = scope.form;

    scope.$apply();
  }));

  it('should start out in a valid state', function () {
    expect(form.$valid).toBeTruthy();
  });

  it('should set and remove errors on inszNumber, gender and dateOfBirth fields', function () {
    // Change the inszNumber so there have to be a lot of errors.
    form.inszNumber.$setViewValue('930517-224-61');
    // InszNumber field errors.
    expect(form.inszNumber.$error.gender).toBeTruthy();
    expect(form.inszNumber.$error.dateOfBirth).toBeTruthy();
    expect(form.inszNumber.$error.checkDigit).toBeTruthy();
    // Gender field errors.
    expect(form.gender.$error.inszNumber).toBeTruthy();
    // Birth date field errors.
    expect(form.dateOfBirth.$touched).toBeTruthy();
    expect(form.dateOfBirth.$error.inszNumber).toBeTruthy();

    // Change the birth date so these errors should be gone.
    scope.dateOfBirth = new Date('1993-05-17');
    scope.$digest();
    expect(form.dateOfBirth.$error.inszNumber).toBeUndefined();
    expect(form.inszNumber.$error.dateOfBirth).toBeUndefined();

    // Change the gender value so these errors should be gone.
    scope.gender = 'FEMALE';
    scope.$digest();
    expect(form.gender.$error.inszNumber).toBeUndefined();
    expect(form.inszNumber.$error.gender).toBeUndefined();

    // Change the inszNumber check digit so that error should be gone.
    scope.inszNumber = '930517-224-90';
    scope.$digest();
    expect(form.inszNumber.$error.checkDigit).toBeUndefined();
    // The form should be error free now.
    expect(form.$valid).toBeTruthy();

    // Change the inszNumber gender again to test the not female case.
    scope.inszNumber = '930517-223-91';
    scope.$digest();
    expect(form.gender.$error.inszNumber).toBeTruthy();
    expect(form.inszNumber.$error.gender).toBeTruthy();

    // Trigger the errors from the gender and date fields.
    scope.inszNumber = '930517-224-61';
    scope.$digest();
    scope.gender = 'MALE';
    scope.dateOfBirth = new Date('1993-05-18');
    scope.$digest();
    expect(form.gender.$error.inszNumber).toBeTruthy();
    expect(form.dateOfBirth.$error.inszNumber).toBeTruthy();
  });

  it('should correctly validate inszNumbers with a checkDigit below 10', function () {
    scope.inszNumber = '90080757002';
    scope.dateOfBirth = new Date('1990-08-07');
    scope.gender = 'FEMALE';
    scope.$digest();

    expect(form.inszNumber.$error.checkDigit).toBeUndefined();
    expect(form.$valid).toBeTruthy();
  });

  it('should correctly validate inszNumbers for people born in or after 2000', function () {
    scope.inszNumber = '02020231402';
    scope.dateOfBirth = new Date('2002-02-02');
    scope.gender = 'FEMALE';
    scope.$digest();

    expect(form.inszNumber.$error.checkDigit).toBeUndefined();
    expect(form.$valid).toBeTruthy();
  });

  it('should correctly validate numbers for people with unknown birth date or gender', function () {
    // Valid, normal
    scope.inszNumber = '830203-313-93';
    scope.dateOfBirth = new Date('1983-02-03');
    scope.gender = 'MALE';
    scope.$digest();
    expect(form.$valid).toBeTruthy();

    // Valid, no known gender
    scope.inszNumber = '832203-313-39';
    scope.gender = 'FEMALE';
    scope.$digest();
    expect(form.inszNumber.$error.dateOfBirth).toBeUndefined();
    expect(form.inszNumber.$error.gender).toBeUndefined();
    expect(form.$valid).toBeTruthy();

    // Valid, known gender
    scope.inszNumber = '834203-313-82';
    scope.gender = 'MALE';
    scope.$digest();
    expect(form.$valid).toBeTruthy();

    // Valid, no known birth month & day
    scope.inszNumber = '830000-313-72';
    scope.dateOfBirth = new Date('1991-01-01');
    scope.$digest();
    expect(form.$valid).toBeTruthy();

    // Valid, no known birth day
    scope.inszNumber = '830200-313-86';
    scope.$digest();
    expect(form.$valid).toBeTruthy();

    // Valid, no known birth month
    scope.inszNumber = '830003-313-79';
    scope.$digest();
    expect(form.$valid).toBeTruthy();

    // Valid, no known gender, no known birth month & day
    scope.inszNumber = '832000-313-18';
    scope.gender = 'FEMALE';
    scope.$digest();
    //expect(form.$valid).toBeTruthy();

    // Valid, no known gender, no known birth day
    scope.inszNumber = '832200-313-32';
    scope.$digest();
    expect(form.$valid).toBeTruthy();

    // Valid, no known gender, no known birth month
    scope.inszNumber = '832003-313-25';
    scope.$digest();
    expect(form.$valid).toBeTruthy();

    // Valid, known gender, no known birth month & day
    scope.inszNumber = '834000-313-61';
    scope.gender = 'MALE';
    scope.$digest();
    expect(form.$valid).toBeTruthy();

    // Valid, known gender, no known birth day
    scope.inszNumber = '834200-313-75';
    scope.$digest();
    expect(form.$valid).toBeTruthy();

    // Valid, known gender, no known birth month
    scope.inszNumber = '834003-313-68';
    scope.$digest();
    expect(form.$valid).toBeTruthy();
  });
});
