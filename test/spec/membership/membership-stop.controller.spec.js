'use strict';

describe('Controller: PassholderMembershipStopController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var $scope, $httpBackend, $q, $controller, membershipService, modalInstance, controller;

  var expectedError = {
    type: 'error',
    exception: 'CultuurNet\\UiTPASBeheer\\Counter\\CounterNotSetException',
    message: 'No active counter set for the current user.',
    code: 'COUNTER_NOT_SET'
  };

  var passholder = {
    passNumber: '1234567891234'
  };
  var membership = {
    association: {
      id: 23
    }
  };

  beforeEach(inject(function ($injector, $rootScope){
    $controller = $injector.get('$controller');

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    $q = $injector.get('$q');
    membershipService = $injector.get('membershipService');

    $scope = $rootScope.$new();
    $httpBackend = $injector.get('$httpBackend');
    controller = $controller('PassholderMembershipStopController', {
      $scope: $scope,
      $uibModalInstance: modalInstance,
      passholder: passholder,
      membership: membership,
      membershipService: membershipService
    });
  }));


  it('can dismiss the modal', function () {
    $scope.cancel();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('can stop a membership', function () {
    var deferredRequest = $q.defer();
    var requestPromise = deferredRequest.promise;

    spyOn(membershipService, 'stop').and.returnValue(requestPromise);

    $scope.stop();

    expect($scope.waiting).toBe(true);

    deferredRequest.resolve();
    $scope.$digest();

    expect(membershipService.stop).toHaveBeenCalledWith(passholder.passNumber, membership.association.id);

    expect($scope.waiting).toBe(false);
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('can handle errors during form submit', function () {
    var deferredRequest = $q.defer();
    var requestPromise = deferredRequest.promise;

    spyOn(membershipService, 'stop').and.returnValue(requestPromise);

    $scope.stop();

    expect($scope.waiting).toBe(true);

    // TODO: since when does an api error return an array?
    deferredRequest.reject({errors: [expectedError]});
    $scope.$digest();

    expect($scope.waiting).toBe(false);
    expect(modalInstance.close).not.toHaveBeenCalled();
    expect($scope.errors[0]).toBe(expectedError.message);
  });
});
