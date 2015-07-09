'use strict';

describe('Controller: PassholderController', function () {

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
    PassholderController = $controller(
      'PassholderController', {
        $rootScope: rootScope,
        passholderService: passholderService,
        sharedDataService:  sharedDataService,
        $state: $state,
        $stateParams: $stateParams
      }
    );
  });

  it('should have some shared data variables', function () {
    expect(PassholderController.shared.data.passholder).toEqual({});
    expect(PassholderController.shared.data.passholderIdentification).toEqual('');
    expect(PassholderController.shared.data.passholderNotFound).toEqual(false);
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
    PassholderController.searchPassholder('valid identification number');

    rootScope.$digest();
    expect($state.go).toHaveBeenCalled();
    expect(passholderService.find).toHaveBeenCalledWith('valid identification number');
  });

  it('sets variables for an error message with an invalid number', function() {
    var passholderDeferred = $q.defer();
    passholderDeferred.reject(
      {
        passholder: 'object'
      }
    );
    spyOn(passholderService, 'find').and.returnValue(passholderDeferred.promise);
    spyOn($state, 'go');
    PassholderController.searchPassholder('invalid identification number');

    rootScope.$digest();
    expect($state.go).not.toHaveBeenCalled();
    expect(passholderService.find).toHaveBeenCalledWith('invalid identification number');
    expect(PassholderController.shared.data.passholder).toEqual(undefined);
    expect(PassholderController.shared.data.passholderNotFound).toEqual(true);
  });

  it('sets variables for an error message when required', function() {
    spyOn($state, 'is').and.returnValue('counter.main');
    $state.params.passholdernotfound = true;
    $state.params.identification = 'identification';

    var newPassholderController = $controller(
      'PassholderController', {
        $rootScope: rootScope,
        passholderService: passholderService,
        sharedDataService:  sharedDataService,
        $state: $state,
        $stateParams: $stateParams
      }
    );

    expect(newPassholderController.shared.data.passholderNotFound).toEqual(true);
    expect(newPassholderController.shared.data.passholderIdentification).toEqual('identification');
  });

  it('sets the passholder data', function() {
    spyOn($state, 'is').and.returnValue('counter.passholder');
    $state.params.identification = 'valid identification number';

    var passholderDeferred = $q.defer();
    passholderDeferred.resolve(
      {
        passholder: 'object'
      }
    );
    spyOn(passholderService, 'find').and.returnValue(passholderDeferred.promise);

    var newPassholderController = $controller(
      'PassholderController', {
        $rootScope: rootScope,
        passholderService: passholderService,
        sharedDataService:  sharedDataService,
        $state: $state,
        $stateParams: $stateParams
      }
    );

    rootScope.$digest();

    expect(newPassholderController.shared.data.passholder).toEqual({
      passholder: 'object'
    });
    expect(passholderService.find).toHaveBeenCalledWith('valid identification number');
  });

  it('redirects to the search page', function() {
    spyOn($state, 'is').and.returnValue('counter.passholder');
    $state.params.identification = 'invalid identification number';

    var passholderDeferred = $q.defer();
    passholderDeferred.reject(
      {
        passholder: 'object'
      }
    );
    spyOn(passholderService, 'find').and.returnValue(passholderDeferred.promise);
    spyOn($state, 'go');

    var newPassholderController = $controller(
      'PassholderController', {
        $rootScope: rootScope,
        passholderService: passholderService,
        sharedDataService:  sharedDataService,
        $state: $state,
        $stateParams: $stateParams
      }
    );

    rootScope.$digest();
    expect(passholderService.find).toHaveBeenCalledWith('invalid identification number');
    expect($state.go).toHaveBeenCalled();
  });
});
