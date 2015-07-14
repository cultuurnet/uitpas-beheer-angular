'use strict';

describe('Controller: PassholderSearchController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));
  beforeEach(module('uitpasbeheerAppViews'));

  var rootScope, $controller, passholderService, sharedDataService, $state, $stateParams, $q;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, _$rootScope_, _$q_) {
    rootScope = _$rootScope_;
    $controller = $injector.get('$controller');
    passholderService = $injector.get('passholderService');
    sharedDataService = $injector.get('sharedDataService');
    $state = $injector.get('$state');
    $stateParams = $injector.get('$stateParams');
    $q = _$q_;
  }));

  beforeEach(function () {
    PassholderSearchController = $controller(
      'PassholderSearchController', {
        $rootScope: rootScope,
        passholderService: passholderService,
        sharedDataService:  sharedDataService,
        $state: $state,
        $stateParams: $stateParams
      }
    );
  });

  it('should have some presetdata variables', function () {
    expect(PassholderSearchController.passholderIdentification).toEqual('');
    expect(PassholderSearchController.passholderNotFound).toEqual(false);
  });

  it('redirects to a passholder detail page with a valid number', function() {
    var passholderDeferred = $q.defer();
    passholderDeferred.resolve(
      {
        passholder: 'object'
      }
    );
    spyOn(passholderService, 'find').and.returnValue(passholderDeferred.promise);
    spyOn($state, 'go');
    PassholderSearchController.searchPassholder('valid identification number');

    rootScope.$digest();
    expect($state.go).toHaveBeenCalled();
    expect(passholderService.find).toHaveBeenCalledWith('valid identification number');
  });

  it('sets variables for an error message with an invalid number', function() {
    var passholderDeferred = $q.defer();
    passholderDeferred.reject(
      {
        code: 'WHATEVER_CODE',
        title: 'A useful title',
        message: 'A useful description'
      }
    );
    spyOn(passholderService, 'find').and.returnValue(passholderDeferred.promise);
    spyOn($state, 'go');
    PassholderSearchController.searchPassholder('invalid identification number');

    rootScope.$digest();
    expect($state.go).toHaveBeenCalledWith(
      'counter.main.error',
      {
        title: 'A useful title',
        description: 'A useful description'
      },
      {
        reload: true
      }
    );
    expect(passholderService.find).toHaveBeenCalledWith('invalid identification number');
    expect(PassholderSearchController.passholder).toEqual(undefined);
    expect(PassholderSearchController.passholderNotFound).toEqual(true);
  });
});
