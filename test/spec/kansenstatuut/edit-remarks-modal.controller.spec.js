'use strict';

 fdescribe('Controller: EditRemarksModalController', function () {

  // load the controller's module
  beforeEach(module('ubr.kansenstatuut'));

  var controller, passholder, uibModalInstance, passholderService, $q, scope;

  var newRemarks = 'New remarks';

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, Passholder, $injector, $rootScope) {
    uibModalInstance = {
      close: jasmine.createSpy('uibModalInstance.close'),
      dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('uibModalInstance.result.then')
      }
    };

    passholderService = jasmine.createSpyObj('passholderService', ['updateRemarks']);
    $q = $injector.get('$q');
    scope = $rootScope.$new();
    passholder = new Passholder(
      {
        passNumber: '01234567891234',
        remarks: 'They gave remarks'
      }
    );

    controller = $controller('EditRemarksModalController', {
      passholder: passholder,
      $uibModalInstance: uibModalInstance,
      passholderService: passholderService,
      $scope: scope
    });
  }));

  it('can dismiss the modal', function () {
    controller.cancelModal();
    expect(uibModalInstance.dismiss).toHaveBeenCalled();
  });

  it('can clear async errors', function () {
    controller.asyncError = { message: 'It did not do what is was supposed to do.' };
    scope.$apply();

    controller.remarks = newRemarks;
    scope.$apply();

    expect(controller.asyncError).toBeNull();
    expect(controller.updatePending).toBeFalsy();
  });

  it('can update the remarks of the passholder', function () {
    passholderService.updateRemarks.and.returnValue($q.when({
      passNumber: '01234567891234',
      remarks: 'text'
    }));
    var formStub = {
      remarks: {
        $valid: true
      }
    };

    controller.remarks = newRemarks;

    controller.updateRemarks(formStub);
    expect(controller.updatePending).toBeTruthy();

    scope.$digest();

    expect(passholderService.updateRemarks)
      .toHaveBeenCalledWith(
        passholder,
        newRemarks
      );
    expect(controller.updatePending).toBeFalsy();
    expect(uibModalInstance.close).toHaveBeenCalled();
  });

  it('can set an error when updating the remarks fails', function () {
    passholderService.updateRemarks.and.returnValue($q.reject({
      data: { message: 'It failed.' }
    }));
    var formStub = {
      remarks: {
        $valid: true
      }
    };

    controller.remarks = newRemarks;

    controller.updateRemarks(formStub);
    scope.$digest();

    expect(passholderService.updateRemarks)
      .toHaveBeenCalledWith(
        passholder,
        newRemarks
      );
    expect(controller.updatePending).toBeFalsy();
    expect(controller.asyncError.message).toBe('It failed.');
  });
});
