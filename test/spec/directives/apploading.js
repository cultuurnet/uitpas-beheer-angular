'use strict';

describe('Directive: appLoading', function () {

  // load the directive's module
  beforeEach(module('uitpasbeheerApp'));
  beforeEach(module('uitpasbeheerAppViews'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should stop loading when the app is ready', inject(function ($rootScope, $compile) {
    element = $compile('<app-loading></app-loading>')(scope);
    scope.$digest();

    expect(scope.loading).toBeTruthy();

    $rootScope.appBusy = false;
    $rootScope.$digest();

    expect(scope.loading).toBeFalsy();
  }));

  it('should not show up if the app is already ready', inject(function($rootScope, $compile) {
    $rootScope.appBusy = false;
    $rootScope.$digest();

    element = $compile('<app-loading></app-loading>')(scope);
    scope.$digest();

    expect(scope.loading).toBeFalsy();
  }));
});
