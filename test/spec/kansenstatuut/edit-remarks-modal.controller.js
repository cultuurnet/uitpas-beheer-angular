'use strict';

describe('Controller: EditRemarksModalController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, $scope, $rootScope, $httpBackend, $uibModal, $q, deferredResponse,
      passholderService;

  // Setup mocking data
  var passholder = {
    passNumber: '01234567891234',
    points: 123
  };
  var fakeModal = {
    close: function (item) {
      //The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
      this.result.confirmCallBack(item);
    },
    dismiss: function (type) {
      //The user clicked cancel on the modal dialog, call the stored cancel callback
      this.result.cancelCallback(type);
    },
    resolve: {
      association: jasmine.any(Function),
      passholder: jasmine.any(Function),
      recentlyExpired: jasmine.any(Function),
      membership: jasmine.any(Function)
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, _$rootScope_, _$uibModal_) {

    $q = $injector.get('$q');
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    $httpBackend = $injector.get('$httpBackend');
    $uibModal = _$uibModal_;

    passholderService  = jasmine.createSpyObj('passholderService', ['updateRemarks']);
    deferredResponse = $q.defer();
    passholderService.updateRemarks.and.returnValue(deferredResponse.promise);

    controller = $controller('EditRemarksModalController', {
      passholder: passholder,
      passholderService: passholderService,
      $rootScope: $rootScope,
      $scope: $scope,
      $uibModalInstance: fakeModal
    });
  }));

  it('should close the modal', function () {
    spyOn(fakeModal, 'dismiss');

    controller.cancelModal();
    $scope.$digest();

    expect(fakeModal.dismiss).toHaveBeenCalled();
  });

  it('should submit remarks', function () {
    var remarks = {};
    controller.remarks = remarks;
    spyOn(fakeModal, 'close');
    controller.updateRemarks({ remarks: { $valid: true }});
    deferredResponse.resolve();
    $scope.$digest();
    expect(passholderService.updateRemarks).toHaveBeenCalledWith(passholder, remarks);
    expect(fakeModal.close).toHaveBeenCalled();
  });

  it('should not submit remarks when field is invalid', function () {
    var remarks = {};
    controller.remarks = remarks;
    spyOn(fakeModal, 'close');
    controller.updateRemarks({ remarks: { $valid: false }});
    deferredResponse.resolve();
    $scope.$digest();
    expect(passholderService.updateRemarks).not.toHaveBeenCalledWith();
    expect(fakeModal.close).not.toHaveBeenCalled();
  });

  it('should respond to errors', function () {
    var remarks = {};
    var error = {
      data: { message: 'Incorrect data' }
    };
    controller.remarks = remarks;
    spyOn(fakeModal, 'close');
    controller.updateRemarks({ remarks: { $valid: true }});
    deferredResponse.reject(error);
    $scope.$digest();
    expect(controller.asyncError).not.toBe(null);
    controller.remarks = {};
    $scope.$digest();
    expect(controller.asyncError).toBe(null);
  });
});
