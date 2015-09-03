'use strict';

describe('Service: nfcService', function () {

  beforeEach(module('uitpasbeheerApp', function($provide) {
    var $window = jasmine.createSpy();
    $provide.value('$window', $window);
  }));

  // Instantiate service.
  var service, $window, $scope;

  beforeEach(inject(function ($injector, $rootScope) {
    $scope = $rootScope;
    $window = $injector.get('$window');
    service = $injector.get('nfcService');
  }));

  it('should add the readNfc function to $window on init', function () {
    service.init();
    expect($window.readNfc).toBeDefined();
  });

  it('should emit when the readNfc function is called', function () {
    var number = '123456789';
    service.init();
    spyOn($scope, '$emit');
    $window.readNfc(number);
    expect($scope.$emit).toHaveBeenCalledWith('nfcNumberReceived', '123456789');
  });

});
