'use strict';

describe('Controller: PassholderReplacePassController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var $state, passholderService, $modalInstance, $scope, counterService, controller, $q, kansenstatuutEndDate;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, $rootScope) {
    $state = jasmine.createSpyObj('$state', ['go']);
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
    passholderService = jasmine.createSpyObj('passholderService', ['findPass']);
    counterService = jasmine.createSpyObj('counterService', ['getRegistrationPriceInfo']);
    $q = $injector.get('$q');
    $scope = $rootScope.$new();
    kansenstatuutEndDate = new Date();
    var pass = {
      number: '182',
      cardSystem: {
        id: '1'
      }
    };
    var passholder =  {
      passNumber: '182',
        getKansenstatuutByCardSystemID: function () {
        return {
          endDate: kansenstatuutEndDate
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

  it('should auto-fill the end date if the old card was kansenstatuut', function () {
    expect(controller.kansenstatuut.endDate).toEqual(kansenstatuutEndDate);
  });
});
