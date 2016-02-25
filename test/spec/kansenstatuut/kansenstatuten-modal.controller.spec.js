'use strict';

describe('Controller: KansenstatutenModalController', function () {

  // load the controller's module
  beforeEach(module('ubr.kansenstatuut'));

  var controller, activeCounter, modalInstance, passholderService, $q, scope, Counter, passholder;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, Passholder, $injector, $rootScope) {
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    passholderService = jasmine.createSpyObj('passholderService', ['renewKansenstatuut', 'update', 'findPassholder']);
    $q = $injector.get('$q');
    scope = $rootScope.$new();
    Counter = $injector.get('Counter');
    passholder = new Passholder(
      {
        passNumber: '01234567891234',
        school: {
          id: 'unique-id-a',
          name: 'School A'
        }
      }
    );

    activeCounter = new Counter({
      'id': '452',
      'consumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'name': 'Vierdewereldgroep Mensen voor Mensen',
      'role': 'admin',
      'actorId': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'cardSystems': {
        '1': {
          'permissions': ['registratie', 'kansenstatuut toekennen'],
          'groups': ['Geauthorizeerde registratie balies'],
          'id': 1,
          'name': 'UiTPAS Regio Aalst',
          'distributionKeys': []
        }
      },
      'permissions': ['registratie', 'kansenstatuut toekennen'],
      'groups': ['Geauthorizeerde registratie balies']
    });

    controller = $controller('KansenstatutenModalController', {
      passholder: passholder,
      activeCounter: activeCounter,
      $uibModalInstance: modalInstance,
      cardSystemId: 1,
      passholderService: passholderService,
      $scope: scope
    });
  }));

  it('can dismiss the modal', function () {
    controller.cancelModal();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('can remove the school from the passholder', function () {
    passholderService.update.and.returnValue($q.resolve(passholder));
    var passholderData = angular.copy(passholder);
    passholderData.school = null;

    controller.removeSchool();

    expect(controller.updatePending).toBe(true);

    expect(passholderService.update).toHaveBeenCalledWith(passholderData, passholderData.passNumber);
    scope.$digest();
    expect(controller.updatePending).toBe(false);
  });

  it('refreshes the passholder when an event is emitted', function() {
    var newPassholder = {};
    passholderService.findPassholder.and.returnValue($q.resolve(newPassholder));
    scope.$emit('kansenStatuutRenewed');
    scope.$digest();
    expect(passholderService.findPassholder).toHaveBeenCalledWith(passholder.passNumber);
    expect(controller.passholder).toBe(newPassholder);
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
});
