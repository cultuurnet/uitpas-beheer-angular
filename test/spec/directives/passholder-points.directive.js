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

    $rootScope.$emit('advantageExchanged', {id: 'advantageId', points: 2});
    scope.$digest();

    expect($animate.removeClass).toHaveBeenCalledWith(jasmine.any(Object), 'animated pulse');
    expect($animate.addClass).toHaveBeenCalledWith(jasmine.any(Object), 'animated pulse');

    deferredAnimation.resolve();
    scope.$digest();
    expect($animate.removeClass.calls.count()).toEqual(2);
  }));

  it('should pulse when the passholder saves points', inject(function ($rootScope, $compile) {
    var deferredAnimation = $q.defer();
    var animationPromise = deferredAnimation.promise;

    element = $compile('<span ubr-passholder-points></span>')(scope);
    scope.$digest();

    spyOn($animate, 'removeClass').and.callThrough();
    spyOn($animate, 'addClass').and.returnValue(animationPromise);

    $rootScope.$emit('activityCheckedIn', {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'points': 182,
      'checkinConstraint': {
        'allowed': true,
        'startDate': '2015-09-01T00:00:00+00:00',
        'endDate': '2015-09-01T23:59:59+00:00',
        'reason': ''
      }
    });
    scope.$digest();

    expect($animate.removeClass).toHaveBeenCalledWith(jasmine.any(Object), 'animated pulse');
    expect($animate.addClass).toHaveBeenCalledWith(jasmine.any(Object), 'animated pulse');

    deferredAnimation.resolve();
    scope.$digest();
    expect($animate.removeClass.calls.count()).toEqual(2);
  }));

  it('should not pulse when a free advantage is exchanged', inject(function ($rootScope, $compile) {
    var deferredAnimation = $q.defer();
    var animationPromise = deferredAnimation.promise;

    element = $compile('<span ubr-passholder-points></span>')(scope);
    scope.$digest();

    spyOn($animate, 'removeClass').and.callThrough();
    spyOn($animate, 'addClass').and.returnValue(animationPromise);

    $rootScope.$emit('advantageExchanged', {id: 'advantageId', points: 0});
    scope.$digest();

    expect($animate.removeClass).not.toHaveBeenCalledWith(jasmine.any(Object), 'animated pulse');
    expect($animate.addClass).not.toHaveBeenCalledWith(jasmine.any(Object), 'animated pulse');
  }));
});
