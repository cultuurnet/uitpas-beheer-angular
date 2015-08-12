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

    var templateHtml = $templateCache.get('views/modal-passholder-edit.html');
    formElement = angular.element('<div>' + templateHtml + '</div>');
    $compile(formElement)(scope);
    scope.pec = {
      passholder: {
        'name': {
          'first': 'Cassandra Ama',
          'last': 'Boadu'
        },
        'address': {
          'street': 'Steenweg op Aalst 94',
          'postalCode': '9308',
          'city': 'Aalst'
        },
        'birth': {
          'date': new Date('1993-05-18'),
          'place': 'Sint-Agatha-Berchem'
        },
        'gender': 'MALE',
        'nationality': 'Belg',
        'privacy': {
          'email': false,
          'sms': false
        },
        'inszNumber': '930518-223-61',
        'points': 123
      }
    };
    scope.$digest();

    form = scope.passholderEdit;
  }));

  it('should start out in a valid state', function () {
    expect(form.$valid).toBeTruthy();
  });

  it('should set and remove errors on inszNumber, gender and dateOfBirth fields', function () {
    // Change the inszNumber so there have to be a lot of errors.
    scope.pec.passholder.inszNumber = '930517-224-61';
    scope.$digest();
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
    scope.pec.passholder.birth.date = new Date('1993-05-17');
    scope.$digest();
    expect(form.dateOfBirth.$error.inszNumber).toBeUndefined();
    expect(form.inszNumber.$error.dateOfBirth).toBeUndefined();

    // Change the gender value so these errors should be gone.
    scope.pec.passholder.gender = 'FEMALE';
    scope.$digest();
    expect(form.gender.$error.inszNumber).toBeUndefined();
    expect(form.inszNumber.$error.gender).toBeUndefined();

    // Change the inszNumber check digit so that error should be gone.
    scope.pec.passholder.inszNumber = '930517-224-90';
    scope.$digest();
    expect(form.inszNumber.$error.checkDigit).toBeUndefined();
    // The form should be error free now.
    expect(form.$valid).toBeTruthy();
  });
});
