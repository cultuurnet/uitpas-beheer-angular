'use strict';

describe('Directive: inszNumberValidation', function () {

  // load the directive's module
  beforeEach(module('uitpasbeheerApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  xit('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ubr-insz-number-validation></ubr-insz-number-validation>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the inszNumberValidation directive');
  }));
});
