'use strict';

describe('Controller: PassholderKansenStatuutController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, activeCounter, modalInstance;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, Passholder) {
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

    controller = $controller('PassholderKansenStatuutController', {
      passholder: new Passholder({ passNumber: '01234567891234' }),
      activeCounter: activeCounter,
      $modalInstance: modalInstance,
      cardSystemId: 1
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
