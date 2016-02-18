'use strict';

describe('Controller: EditSchoolModalController', function () {

  // load the controller's module
  beforeEach(module('ubr.kansenstatuut'));

  var controller, passholder, uibModalInstance, passholderService, $q, scope, counterService, schools;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, Passholder, $injector, $rootScope) {
    uibModalInstance = {
      close: jasmine.createSpy('uibModalInstance.close'),
      dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('uibModalInstance.result.then')
      }
    };
    $q = $injector.get('$q');
    scope = $rootScope.$new();
    schools = [
      {
        id: 'unique-id-a',
        name: 'School A'
      },
      {
        id: 'unique-id-b',
        name: 'School B'
      },
      {
        id: 'unique-id-c',
        name: 'School C'
      },
      {
        id: 'unique-id-d',
        name: 'School D'
      }
    ];
    passholder = new Passholder(
      {
        passNumber: '01234567891234',
        school: {
          id: 'unique-id-a',
          name: 'School A'
        }
      }
    );

    passholderService = jasmine.createSpyObj('passholderService', ['updateSchool']);
    counterService = jasmine.createSpyObj('counterService', ['getSchools']);
    counterService.getSchools.and.returnValue($q.when(schools));

    controller = $controller('EditSchoolModalController', {
      passholder: passholder,
      $uibModalInstance: uibModalInstance,
      passholderService: passholderService,
      $scope: scope,
      counterService: counterService
    });
  }));

  it('loads schools when initiated', function () {
    expect(controller.schools).toEqual([]);
    scope.$digest();

    expect(controller.schools).toEqual(schools);
  });

  it('can dismiss the modal', function () {
    controller.cancelModal();
    expect(uibModalInstance.dismiss).toHaveBeenCalled();
  });

  it('can clears async errors', function () {
    controller.asyncError = { message: 'It did not do what is was supposed to do.' };
    scope.$apply();

    controller.school = {
      id: 'unique-id-b',
      name: 'School B'
    };
    scope.$apply();

    expect(controller.asyncError).toBeNull();
    expect(controller.updatePending).toBeFalsy();
  });

  it('can update the school of the passholder', function () {
    passholderService.updateSchool.and.returnValue($q.when({
      passNumber: '01234567891234',
      school: {
        id: 'unique-id-a',
        name: 'School A'
      }
    }));
    var formStub = {
      editSchool: {
        $valid: true
      }
    };

    controller.updateSchool(formStub);
    expect(controller.updatePending).toBeTruthy();

    scope.$digest();

    expect(passholderService.updateSchool).toHaveBeenCalled();
    expect(controller.updatePending).toBeFalsy();
    expect(uibModalInstance.close).toHaveBeenCalled();
  });

  it('can set an error when updating the school fails', function () {
    passholderService.updateSchool.and.returnValue($q.reject({
      data: { message: 'It failed.' }
    }));
    var formStub = {
      editSchool: {
        $valid: true
      }
    };

    controller.updateSchool(formStub);
    scope.$digest();

    expect(passholderService.updateSchool).toHaveBeenCalled();
    expect(controller.updatePending).toBeFalsy();
    expect(controller.asyncError.message).toBe('It failed.');
  });
});
