'use strict';

describe('Controller: CreateMembershipModalController', function () {

  beforeEach(module('ubr.counter-membership'));

  var controller, counterService, form, $controller, $q, $scope, modalInstance;

  var membership = {
    uid: 'new-id-for-now-user',
    nick: 'e@mail',
    role: 'member'
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, $rootScope) {
    counterService = $injector.get('counterService');
    $scope = $rootScope;
    $controller = $injector.get('$controller');
    $q = $injector.get('$q');
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };
    controller = $controller('CreateMembershipModalController', {
      counterService: counterService,
      $modalInstance: modalInstance
    });
    controller.email = 'e@mail';

    form = {
      '$invalid': false
    };
  }));

  it('can create a new membership', function () {
    spyOn(counterService, 'createMembership').and.returnValue($q.resolve(membership));

    controller.createMembership(form);
    $scope.$digest();

    expect(counterService.createMembership).toHaveBeenCalledWith('e@mail');
    expect(controller.creationPending).toBeFalsy();
  });

  it('does not create a new membership when the form is invalid', function () {
    spyOn(counterService, 'createMembership').and.returnValue($q.resolve(membership));
    form.$invalid = true;

    controller.createMembership(form);
    $scope.$digest();

    expect(counterService.createMembership).not.toHaveBeenCalled();
    expect(controller.creationPending).toBeFalsy();
  });

  it('should dismiss the modal when canceling membership creation', function () {
    controller.cancelCreation();

    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('should return an error message when the API does not know the user when creating a new membership', function () {
    var apiErrorResponse = {code: 'UNKNOWN_USER'};
    var errorResponse = {message: 'De gebruiker met email <em>e@mail</em> kan niet gevonden worden in het systeem.'};
    spyOn(counterService, 'createMembership').and.returnValue($q.reject(apiErrorResponse));

    controller.createMembership(form);
    $scope.$digest();

    expect(counterService.createMembership).toHaveBeenCalledWith('e@mail');
    expect(controller.creationPending).toBeFalsy();
    expect(controller.asyncError).toEqual(errorResponse);
  });

  it('should return an error message when the API returns an error when creating a new membership', function () {
    var apiErrorResponse = {};
    var errorResponse = {message: 'De gebruiker met email <em>e@mail</em> kan niet aangemaakt worden.'};
    spyOn(counterService, 'createMembership').and.returnValue($q.reject(apiErrorResponse));

    controller.createMembership(form);
    $scope.$digest();

    expect(counterService.createMembership).toHaveBeenCalledWith('e@mail');
    expect(controller.creationPending).toBeFalsy();
    expect(controller.asyncError).toEqual(errorResponse);
  });
});
