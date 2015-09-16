'use strict';

describe('Controller: PassholderKansenStatuutController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, activeCounter, modalInstance;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller) {
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
      passholder: { passNumber: '01234567891234' },
      activeCounter: activeCounter,
      $modalInstance: modalInstance
    });
  }));

  it('can dismiss the modal', function () {
    controller.cancelModal();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });
});
