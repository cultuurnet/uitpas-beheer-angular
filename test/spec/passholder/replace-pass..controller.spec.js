'use strict';

describe('Controller: PassholderReplacePassController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var $state, passholderService, $uibModalInstance, $scope, counterService, controller, $q;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, $rootScope) {
    $state = jasmine.createSpyObj('$state', ['go']);
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);
    passholderService = jasmine.createSpyObj('passholderService', ['findPass', 'newPass']);
    counterService = jasmine.createSpyObj('counterService', ['getRegistrationPriceInfo']);
    $q = $injector.get('$q');
    $scope = $rootScope.$new();
    var pass = {
      number: '182',
      cardSystem: {
        id: '1'
      },
      isKansenstatuut: function () {
        return true;
      }
    };
    var passholder =  {
      uid: '45645612-afs45safd46-asdf545asdf4asdf56-asdf4sdaf546',
      passNumber: '182',
      getKansenstatuutByCardSystemID: function () {
        return {
          endDate: new Date('2055-05-05')
        };
      }
    };

    controller = $controller('PassholderReplacePassController', {
      $scope: $scope,
      pass: pass,
      passholder: passholder,
      passholderService: passholderService,
      $uibModalInstance: $uibModalInstance,
      counterService: counterService,
      $rootScope: $rootScope
    });

    controller.form = {
      UiTPASNumber: {
        $valid: true,
        $setDirty:  jasmine.createSpy('$setDirty')
      },
      voucherNumber: jasmine.createSpyObj('voucherNumber', ['$setValidity'])
    };
  }));

  it('should auto-fill the UiTPAS number field when a pass is scanned', function () {
    passholderService.findPass.and.returnValue($q.reject());
    controller.passScanned({}, 'chipnumber');
    expect(controller.card.id).toBeNull();
    expect(controller.formAlert).toEqual({
      message: 'De gescande UiTPAS kan niet gevonden worden.',
      type: 'danger'
    });

    var somePass = {
      number: '1234567891234'
    };
    passholderService.findPass.and.returnValue($q.resolve(somePass));
    controller.passScanned({}, 'chipnumber');
    expect(controller.card.id).toEqual('1234567891234');
  });

  it('should allow "loss" or "removal" as a reason for replacing an UiTPAS when kansenstatuut remains the same', function () {
    var expectedReasons = [
      {
        description: 'Kaart verloren of gestolen',
        code: 'LOSS_THEFT'
      },
      {
        description: 'Verhuis',
        code: 'REMOVAL'
      }
    ];
    controller.newPass = {
      isKansenstatuut: function () {
        return false;
      }
    };
    controller.pass = {
      isKansenstatuut: function () {
        return false;
      }
    };

    controller.refreshReasonOptions();
    expect(controller.reasons).toEqual(expectedReasons);
  });

  it('should include the "loss of kansenstatuut" reason when kansenstatuut is no longer set for the new pass', function () {
    var expectedReasons = [
      {
        description: 'Verlies kansenstatuut',
        code: 'LOSS_KANSENSTATUUT'
      }
    ];
    controller.newPass = {
      isKansenstatuut: function () {
        return false;
      }
    };
    controller.pass = {
      isKansenstatuut: function () {
        return true;
      }
    };
    spyOn(controller, 'updatePriceInfo');

    controller.refreshReasonOptions();
    expect(controller.reasons).toEqual(expectedReasons);
  });

  it('should include "obtaining kansenstatuut" as a reason when kansenstatuut changes for the new pass', function () {
    var expectedReasons = [
      {
        description: 'Kansenstatuut verkrijgen',
        code: 'OBTAIN_KANSENSTATUUT'
      }
    ];
    controller.newPass = {
      isKansenstatuut: function () {
        return true;
      }
    };
    controller.pass = {
      isKansenstatuut: function () {
        return false;
      }
    };
    spyOn(controller, 'updatePriceInfo');

    controller.refreshReasonOptions();
    expect(controller.reasons).toEqual(expectedReasons);
  });

  it('should update the price info and default reason when the pass changed kansenstatuut and reasons are updated', function () {
    controller.newPass = {
      isKansenstatuut: function () {
        return true;
      }
    };
    controller.pass = {
      isKansenstatuut: function () {
        return false;
      }
    };
    spyOn(controller, 'updatePriceInfo');


    controller.refreshReasonOptions();
    expect(controller.card.reason).toEqual('OBTAIN_KANSENSTATUUT');
    expect(controller.updatePriceInfo).toHaveBeenCalled();
  });

  it('should set the new pass info and reason options when refreshing pass data', function () {
    spyOn(controller, 'refreshReasonOptions');
    var somePass = {
      pass: 'data'
    };
    passholderService.findPass.and.returnValue($q.resolve(somePass));

    controller.refreshNewPassInfo();
    $scope.$digest();

    expect(controller.newPass).toEqual(somePass);
    expect(controller.refreshReasonOptions).toHaveBeenCalled();
  });

  it('should know when kansenstatuut is obtained when the new pass is selected', function () {
    controller.newPass = {
      isKansenstatuut: function () {
        return true;
      }
    };
    controller.pass = {
      isKansenstatuut: function () {
        return false;
      }
    };

    var whenNewPassIsKansenstatuut = controller.obtainingKansenstatuut();
    expect(whenNewPassIsKansenstatuut).toEqual(true);


    controller.newPass = {
      isKansenstatuut: function () {
        return false;
      }
    };
    var whenNewPassIsNotKansenstatuut = controller.obtainingKansenstatuut();
    expect(whenNewPassIsNotKansenstatuut).toEqual(false);
  });

  it('should use the old end date when both the old and new pass are kansenstatuut', function () {
    controller.newPass = {
      isKansenstatuut: function () {
        return true;
      },
      cardSystem: {
        id: '1'
      }
    };
    controller.card.voucherNumber = 'v-o-u-c-h-e-r';
    controller.card.reason = 'I_ATE_IT_MY_OTHER_PASS';
    spyOn(controller, 'requireEndDate').and.returnValue(false);
    passholderService.newPass.and.returnValue($q.resolve());
    var expectedEndDate = new Date('2055-05-05');

    controller.submitForm();

    expect(passholderService.newPass).toHaveBeenCalledWith(
      controller.newPass,
      '45645612-afs45safd46-asdf545asdf4asdf56-asdf4sdaf546',
      'I_ATE_IT_MY_OTHER_PASS',
      expectedEndDate,
      'v-o-u-c-h-e-r'
    );
  });

  it('should redirect to the new pass page after replacement', function () {
    controller.newPass = {
      isKansenstatuut: function () {
        return true;
      },
      cardSystem: {
        id: '1'
      }
    };
    controller.card.voucherNumber = 'v-o-u-c-h-e-r';
    controller.card.reason = 'I_ATE_IT_MY_OTHER_PASS';
    var newPassResponse = {
      number: '1234567890'
    };

    spyOn(controller, 'requireEndDate').and.returnValue(false);
    passholderService.newPass.and.returnValue($q.when(newPassResponse));
    var expectedEndDate = new Date('2055-05-05');

    controller.submitForm();
    $scope.$digest();

    expect(passholderService.newPass).toHaveBeenCalledWith(
      controller.newPass,
      '45645612-afs45safd46-asdf545asdf4asdf56-asdf4sdaf546',
      'I_ATE_IT_MY_OTHER_PASS',
      expectedEndDate,
      'v-o-u-c-h-e-r'
    );
    expect($uibModalInstance.close).toHaveBeenCalledWith(newPassResponse.number);
  });

  it('should set an error when it can not replace a pass', function () {
    controller.newPass = {
      isKansenstatuut: function () {
        return true;
      },
      cardSystem: {
        id: '1'
      }
    };
    controller.card.voucherNumber = 'v-o-u-c-h-e-r';
    controller.card.reason = 'I_ATE_IT_MY_OTHER_PASS';

    spyOn(controller, 'requireEndDate').and.returnValue(false);
    passholderService.newPass.and.returnValue($q.reject());
    var expectedEndDate = new Date('2055-05-05');

    controller.submitForm();
    $scope.$digest();

    expect(passholderService.newPass).toHaveBeenCalledWith(
      controller.newPass,
      '45645612-afs45safd46-asdf545asdf4asdf56-asdf4sdaf546',
      'I_ATE_IT_MY_OTHER_PASS',
      expectedEndDate,
      'v-o-u-c-h-e-r'
    );
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should make sure an end date is provided when obtaining a kansenstatuut pass', function () {
    spyOn(controller, 'requireEndDate').and.returnValue(true);
    controller.submitForm();
    expect(controller.requireEndDate).toHaveBeenCalled();
  });

  it('should be able to tell if the end date is required', function () {
    spyOn(controller, 'obtainingKansenstatuut').and.returnValue(true);
    controller.kansenstatuut.endDate = false;

    var checkResponse = controller.requireEndDate();
    var formAlert = {
      message: 'Een geldigheidsdatum is verplicht bij het toekennen van een kansenstatuut.',
      type: 'danger'
    };

    expect(checkResponse).toBeTruthy();
    expect(controller.formAlert).toEqual(formAlert);
  });

  it('should be able to tell if the end date is not required', function () {
    spyOn(controller, 'obtainingKansenstatuut').and.returnValue(true);
    controller.kansenstatuut.endDate = true;

    var checkResponse = controller.requireEndDate();

    expect(checkResponse).toBeFalsy();
    expect(controller.formAlert).toBeUndefined();
  });

  it('can update the price info', function () {
    var form = {
      voucherNumber: jasmine.createSpyObj('voucherNumber', ['$setValidity', 'newPass'])
    };
    controller.card.reason = 'I_AM_GROOT';
    counterService.getRegistrationPriceInfo.and.returnValue($q.when({price: 10}));

    controller.updatePriceInfo(form);
    $scope.$digest();

    expect(form.voucherNumber.$setValidity).toHaveBeenCalled();
    expect(controller.price).toEqual(10);
  });

  it('can handle errors when updating the price info', function () {
    var form = {
      voucherNumber: jasmine.createSpyObj('voucherNumber', ['$setValidity'])
    };
    controller.card.reason = 'I_AM_GROOT';
    counterService.getRegistrationPriceInfo.and.returnValue($q.reject({code: 'UNKNOWN_VOUCHER'}));

    controller.updatePriceInfo(form);
    $scope.$digest();

    expect(form.voucherNumber.$setValidity).toHaveBeenCalled();
    expect(controller.price).toEqual(-1);
  });

  it('watches the change of the UiTPAS number', function () {
    controller.form.UiTPASNumber.$valid = false;
    $scope.$digest();
    spyOn(controller, 'refreshNewPassInfo');
    controller.form.UiTPASNumber.$valid = true;
    $scope.$digest();

    expect(controller.refreshNewPassInfo).toHaveBeenCalled();
  });

  it('can close the modal', function () {
    controller.cancelModal();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });
});
