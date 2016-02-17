'use strict';

describe('Directive: confirmOnExit', function () {

  beforeEach(module('ubr.help'));
  beforeEach(module('uitpasbeheerAppViews'));

  var $rootscope, $state, $window, directiveElement, element, scope;

  beforeEach(inject(function(_$rootScope_, _$state_, _$window_, $compile){
    $rootscope = _$rootScope_;
    $state = _$state_;
    $window = _$window_;

    spyOn($window, 'onbeforeunload');

    scope = $rootscope.$new();

    directiveElement = '<div confirm-on-exit="true" confirm-message-window="Al je wijzigingen zullen verloren gaan. Ben je zeker dat je wil doorgaan?" confirm-message-route="Al je wijzigingen zullen verloren gaan. Ben je zeker dat je wil doorgaan?">';
    element = $compile(directiveElement)(scope);
  }));

  it('should be called on url/refresh change', function () {
    var result = $window.onbeforeunload();

    expect(result).toBe('Al je wijzigingen zullen verloren gaan. Ben je zeker dat je wil doorgaan?');
  });

  it('should be called when the scope is been destroyed', function () {
    scope.$broadcast('$destroy');

    expect(window.onbeforeunload).toBe(null);
  });

  it('should be called when the state is going to change', function () {
    scope.$broadcast('$stateChangeStart');

    expect($rootscope.appBusy).toBeFalsy();
  });
});