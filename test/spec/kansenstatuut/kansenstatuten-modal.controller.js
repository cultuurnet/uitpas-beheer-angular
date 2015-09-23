'use strict';

describe('Controller: KansenstatutenModalController', function () {

  // load the controller's module
  beforeEach(module('ubr.kansenstatuut'));

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

    controller = $controller('KansenstatutenModalController', {
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
});
