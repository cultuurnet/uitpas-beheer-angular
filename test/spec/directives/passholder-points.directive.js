'use strict';

describe('Directive: udbPassholderPoints', function () {

  beforeEach(module('uitpasbeheerApp'));

  var element, scope, $animate, $q;

  beforeEach(inject(function ($rootScope, $injector) {
    scope = $rootScope.$new();
    $animate = $injector.get('$animate');
    $q = $injector.get('$q');
  }));

  it('should pulse when the passholder point count is updated', inject(function ($rootScope, $compile) {
    var deferredAnimation = $q.defer();
    var animationPromise = deferredAnimation.promise;

    element = $compile('<span ubr-passholder-points></span>')(scope);
    scope.$digest();

    spyOn($animate, 'removeClass').and.callThrough();
    spyOn($animate, 'addClass').and.returnValue(animationPromise);

    $rootScope.$emit('advantageExchanged', {id: 'advantageId'});
    scope.$digest();

    expect($animate.removeClass).toHaveBeenCalledWith(jasmine.any(Object), 'animated pulse');
    expect($animate.addClass).toHaveBeenCalledWith(jasmine.any(Object), 'animated pulse');

    deferredAnimation.resolve();
    scope.$digest();
    expect($animate.removeClass.calls.count()).toEqual(2);
  }));
});
