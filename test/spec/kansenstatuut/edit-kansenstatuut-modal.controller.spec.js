'use strict';

describe('Controller: EditKansenstatuutModalController', function () {

  // load the controller's module
  beforeEach(module('ubr.kansenstatuut'));

  var controller, activeCounter, modalInstance, passholderService, $q, scope, passholder;

  var cardSystemId = 1;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, Passholder, $injector, $rootScope) {
    passholder = new Passholder(
      {
        passNumber: '01234567891234',
        kansenStatuten: [
          {
            cardSystem: {
              id: 1,
              name: 'UiTPAS Dender'
            },
            status: 'ACTIVE',
            endDate: '1921-02-02'
          }
        ]
      }
    );

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

    controller = $controller('EditKansenstatuutModalController', {
      passholder: passholder,
      activeCounter: activeCounter,
      $uibModalInstance: modalInstance,
      cardSystemId: cardSystemId,
      passholderService: passholderService,
      $scope: scope
    });
  }));

  it('can dismiss the modal', function () {
    controller.cancelModal();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('should renew a kansenstatuut and close the edit modal when updating the end date', function () {
    var editForm = {
      endDate: {
        $valid: true
      }
    };
    var expectedEndDate = new Date('1922-02-02');

    passholderService.renewKansenstatuut.and.returnValue($q.resolve());

    controller.kansenstatuut.endDate = expectedEndDate;

    controller.updateKansenstatuut(editForm);
    scope.$digest();

    expect(passholderService.renewKansenstatuut)
      .toHaveBeenCalledWith(
        passholder,
        controller.kansenstatuut,
        expectedEndDate
      );

    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('should display any errors that occur when updating a kansenstatuut', function () {
    var editForm = {
      endDate: {
        $valid: true
      }
    };
    var expectedEndDate = new Date('1922-02-02');

    controller.kansenstatuut.endDate = expectedEndDate;

    var errorResponse = {
      data: {
        code: 'TOTALLY_UNACCEPTABLE_DUDE',
        exception: 'CultuurNet\UiTPASBeheer\Exception\ReadableCodeResponseException',
        message: 'You did something wrong!',
        type: 'error'
      }
    };
    var expectedAsyncError = {
      message: 'You did something wrong!'
    };
    controller.kansenstatuut = {
      endDate: new Date('1922-02-02')
    };
    passholderService.renewKansenstatuut.and.returnValue($q.reject(errorResponse));

    controller.updateKansenstatuut(editForm);
    scope.$digest();

    expect(passholderService.renewKansenstatuut)
      .toHaveBeenCalledWith(
        passholder,
        controller.kansenstatuut,
        expectedEndDate
      );
    expect(modalInstance.close).not.toHaveBeenCalled();
    expect(controller.asyncError).toEqual(expectedAsyncError);
  });
});
