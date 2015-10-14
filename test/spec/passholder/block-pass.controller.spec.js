'use strict';

describe('Controller: PassholderBlockPassController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var $state, passholderService, $modalInstance, $q, blockPassCtrl, $scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, $rootScope) {
    $state = jasmine.createSpyObj('$state', ['go']);
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
    passholderService = jasmine.createSpyObj('passholderService', ['blockPass']);
    $q = $injector.get('$q');
    $scope = $rootScope.$new();

    blockPassCtrl = $controller('PassholderBlockPassController', {
      pass: { number: '182' },
      passholder: { passNumber: '182' },
      passholderService: passholderService,
      $modalInstance: $modalInstance,
      $q: $q,
      $state: $state
    });
  }));

  it('should refresh the passholder page after blocking a pass', function () {
    var pass = { number: '182' };
    passholderService.blockPass.and.returnValue($q.resolve(pass));

    blockPassCtrl.blockAndRefresh();
    $scope.$apply();

    expect(passholderService.blockPass).toHaveBeenCalledWith('182');
    expect($state.go).toHaveBeenCalledWith(
      'counter.main.passholder',
      { identification: pass.number },
      { reload: true }
    );
  });

  it('should display a custom message for any known errors', function () {
    var errorCode = 'UNKNOWN_UITPASNUMBER';
    passholderService.blockPass.and.returnValue($q.reject(errorCode));

    blockPassCtrl.block();
    $scope.$digest();

    expect(blockPassCtrl.asyncError).toEqual('Dit uitpas nummer is onbekend.');
  });

  it('should not try to block when already blocking', function (done) {
    blockPassCtrl.busyBlocking = true;
    blockPassCtrl
      .block()
      .catch(done);
    $scope.$digest();
  });

  it('should prompt the user to add a new card when blocking and replacing', function () {
    var pass = { number: '182' };
    var expectedReplacementParameters = {
      identification: '182',
      justBlocked: true
    };
    passholderService.blockPass.and.returnValue($q.resolve(pass));

    blockPassCtrl.blockAndReplace();
    $scope.$apply();

    expect($state.go).toHaveBeenCalledWith('counter.main.passholder.replacePass', expectedReplacementParameters);
  });

  it('can close the modal', function () {
    blockPassCtrl.cancelModal();
    expect($modalInstance.dismiss).toHaveBeenCalled();
  });
});
