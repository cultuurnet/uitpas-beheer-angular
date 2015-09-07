'use strict';

describe('Controller: PassholderSearchController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));
  beforeEach(module('uitpasbeheerAppViews'));

  var rootScope, $controller, passholderService, sharedDataService, $state, $stateParams, $q, passholderSearchController;

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
    passholderSearchController = $controller(
      'PassholderSearchController', {
        $scope: rootScope.$new(),
        $rootScope: rootScope,
        passholderService: passholderService,
        sharedDataService:  sharedDataService,
        $state: $state,
        $stateParams: $stateParams
      }
    );
  });

  it('should have some presetdata variables', function () {
    expect(passholderSearchController.passholderIdentification).toEqual('');
    expect(passholderSearchController.passholderNotFound).toEqual(false);
  });

  it('redirects to a passholder detail page with a valid number', function() {
    var passholderDeferred = $q.defer();
    var expectedStateParameters = {
      passholder: {
        name: 'Dude Man',
        passNumber: 'itsme-123456789'
      },
      identification: 'itsme-123456789'
    };
    spyOn(passholderService, 'find').and.returnValue(passholderDeferred.promise);
    spyOn($state, 'go');
    passholderSearchController.searchPassholder('valid identification number');

    passholderDeferred.resolve(
      {
        name: 'Dude Man',
        passNumber: 'itsme-123456789'
      }
    );
    rootScope.$digest();
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder', expectedStateParameters);
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
    passholderSearchController.searchPassholder('invalid identification number');

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
    expect(passholderSearchController.passholder).toEqual(undefined);
    expect(passholderSearchController.passholderNotFound).toEqual(true);
  });

  it('should submit the search form when a nfc number is emited', function() {
    var number = '123456789';
    spyOn(passholderSearchController, 'searchPassholder');
    rootScope.$emit('nfcNumberReceived', number);

    rootScope.$digest();
    expect(passholderSearchController.searchPassholder).toHaveBeenCalledWith(number);
  });
});
