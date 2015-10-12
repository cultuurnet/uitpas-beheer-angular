'use strict';

describe('Controller: PassholderReplacePassController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var $state, passholderService, $modalInstance, $scope, counterService, controller, $q;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, $rootScope) {
    $state = jasmine.createSpyObj('$state', ['go']);
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
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
      $modalInstance: $modalInstance,
      counterService: counterService,
      $rootScope: $rootScope
    });

    controller.form = {
      UiTPASNumber: {
        $valid: true
      },
      voucherNumber: {}
    };
  }));

  it('should auto-fill the UiTPAS number field when a pass is scanned', function () {
    controller.passScanned({}, '1234567891234');
    expect(controller.card.id).toEqual('1234567891234');
  });

  it('should always allow "loss" or "removal" as a reason for replacing an UiTPAS', function () {
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
        description: 'Kaart verloren of gestolen',
        code: 'LOSS_THEFT'
      },
      {
        description: 'Verhuis',
        code: 'REMOVAL'
      },
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
        description: 'Kaart verloren of gestolen',
        code: 'LOSS_THEFT'
      },
      {
        description: 'Verhuis',
        code: 'REMOVAL'
      },
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

  it('should make sure an end date is provided when obtaining a kansenstatuut pass', function () {
    spyOn(controller, 'requireEndDate').and.returnValue(true);
    controller.submitForm();
    expect(controller.requireEndDate).toHaveBeenCalled();
  });
});
