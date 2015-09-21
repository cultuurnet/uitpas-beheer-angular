'use strict';

describe('Controller: PassholderKansenStatuutController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, activeCounter, modalInstance, passholderService, $q, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, Passholder, $injector, $rootScope) {
    activeCounter = {
      cardSystems: {
        1: {
          'permissions': ['registratie', 'kansenstatuut toekennen']
        }
      }
    };

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    passholderService = jasmine.createSpyObj('passholderService', ['renewKansenstatuut']);
    $q = $injector.get('$q');
    scope = $rootScope.$new();

    controller = $controller('PassholderKansenStatuutController', {
      passholder: new Passholder({ passNumber: '01234567891234' }),
      activeCounter: activeCounter,
      $modalInstance: modalInstance,
      cardSystemId: 1,
      passholderService: passholderService,
      $scope: scope
    });
  }));

  it('can dismiss the modal', function () {
    controller.cancelModal();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('can verify if the active counter can edit a kansenstatuut', function () {
    var kansenStatuutTrue = {
      cardSystem: {
        id: 1
      }
    };
    expect(controller.counterCanAlterKansenStatuut(kansenStatuutTrue)).toBeTruthy();

    var kansenStatuutFalse = {
      cardSystem: {
        id: 2
      }
    };
    expect(controller.counterCanAlterKansenStatuut(kansenStatuutFalse)).toBeFalsy();
  });

  it('should renew a kansenstatuut and close the edit modal when updating the end date', function () {
    var editForm = {
      endDate: {
        $valid: true
      }
    };
    var expectedEndDate = new Date('1922-02-02');
    controller.kansenstatuut = {
      endDate: new Date('1922-02-02')
    };
    passholderService.renewKansenstatuut.and.returnValue($q.resolve());

    controller.updateKansenstatuut(editForm);
    scope.$digest();

    expect(passholderService.renewKansenstatuut)
      .toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), expectedEndDate);
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('should display any errors that occur when updating a kansenstatuut', function () {
    var editForm = {
      endDate: {
        $valid: true
      }
    };
    var expectedEndDate = new Date('1922-02-02');
    var errorResponse = {
      data: {
        code: "TOTALLY_UNACCEPTABLE_DUDE",
        exception: "CultuurNet\UiTPASBeheer\Exception\ReadableCodeResponseException",
        message: "You did something wrong!",
        type: "error"
      }
    };
    var expectedAsyncError = {
      message: "You did something wrong!"
    };
    controller.kansenstatuut = {
      endDate: new Date('1922-02-02')
    };
    passholderService.renewKansenstatuut.and.returnValue($q.reject(errorResponse));

    controller.updateKansenstatuut(editForm);
    scope.$digest();

    expect(passholderService.renewKansenstatuut)
      .toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), expectedEndDate);
    expect(modalInstance.close).not.toHaveBeenCalled();
    expect(controller.asyncError).toEqual(expectedAsyncError);
  });
});
