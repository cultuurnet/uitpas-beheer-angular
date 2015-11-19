'use strict';

describe('Controller: CreateMembershipModalController', function () {

  beforeEach(module('ubr.counter.membership'));

  var controller, counterService, form, $controller, $q, $scope, modalInstance;

  var membership = {
    uid: 'new-id-for-now-user',
    nick: 'e@mail',
    role: 'member'
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, $rootScope) {
    counterService = jasmine.createSpyObj('counterService', ['createMembership']);
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
      $uibModalInstance: modalInstance
    });
    controller.email = 'e@mail';

    form = {
      '$invalid': false
    };
  }));

  it('can create a new membership', function () {
    counterService.createMembership.and.returnValue($q.resolve(membership));

    controller.createMembership(form);
    $scope.$digest();

    expect(counterService.createMembership).toHaveBeenCalledWith('e@mail');
    expect(controller.creationPending).toBeFalsy();
  });

  it('does not create a new membership when the form is invalid', function () {
    counterService.createMembership.and.returnValue($q.resolve(membership));
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
    counterService.createMembership.and.returnValue($q.reject(apiErrorResponse));

    controller.createMembership(form);
    $scope.$digest();

    expect(counterService.createMembership).toHaveBeenCalledWith('e@mail');
    expect(controller.creationPending).toBeFalsy();
    expect(controller.asyncError).toEqual(errorResponse);
  });

  it('should return an error message when the API returns an error when creating a new membership', function () {
    var apiErrorResponse = {};
    var errorResponse = {
      message: 'Er werd niemand gevonden met het e-mail adres <em>e@mail</em>.<br>'+
        'Gelieve de persoon die je wenst toe te voegen te vragen om zich eerst te registeren op UiTinVlaanderen.be.'
    };
    counterService.createMembership.and.returnValue($q.reject(apiErrorResponse));

    controller.createMembership(form);
    $scope.$digest();

    expect(counterService.createMembership).toHaveBeenCalledWith('e@mail');
    expect(controller.creationPending).toBeFalsy();
    expect(controller.asyncError).toEqual(errorResponse);
  });
});
