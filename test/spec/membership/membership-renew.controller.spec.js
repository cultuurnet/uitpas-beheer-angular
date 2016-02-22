'use strict';

describe('Controller: PassholderMembershipRenewController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var $scope, $httpBackend, $q, $controller, membershipService, modalInstance, controller;

  var association = {
    id: 124,
    enddateCalculation: 'BASED_ON_DATE_OF_BIRTH' // or BASED_ON_REGISTRATION_DATE or FREE
  };
  var passholder = {
    passNumber: '1234567899912345',
    dateOfBirth: 700354800
  };
  var membership = {
    newEndDate: 1451602799,
    dateOfBirth: 700354800
  };
  var expectedError = {
    type: 'error',
    exception: 'CultuurNet\\UiTPASBeheer\\Counter\\CounterNotSetException',
    message: 'No active counter set for the current user.',
    code: 'COUNTER_NOT_SET'
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
    controller = $controller('PassholderMembershipRenewController', {
      $scope: $scope,
      $uibModalInstance: modalInstance,
      association: association,
      passholder: passholder,
      membership: membership,
      membershipService: membershipService
    });
  }));


  it('can dismiss the modal', function () {
    $scope.cancel();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('can renew a membership', function () {
    var deferredRequest = $q.defer();
    var requestPromise = deferredRequest.promise;

    spyOn(membershipService, 'register').and.returnValue(requestPromise);

    $scope.register($scope.endDate);

    expect($scope.waiting).toBe(true);

    deferredRequest.resolve();
    $scope.$digest();

    expect(membershipService.register).toHaveBeenCalledWith(passholder.passNumber, association.id, $scope.endDate);

    expect($scope.waiting).toBe(false);
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('can handle errors during form submit', function () {
    var deferredRequest = $q.defer();
    var requestPromise = deferredRequest.promise;

    spyOn(membershipService, 'register').and.returnValue(requestPromise);

    $scope.register($scope.endDate);

    expect($scope.waiting).toBe(true);

    // TODO: since when does an api error return an array?
    deferredRequest.reject({errors: [expectedError]});
    $scope.$digest();

    expect($scope.waiting).toBe(false);
    expect(modalInstance.close).not.toHaveBeenCalled();
    expect($scope.errors[0]).toBe(expectedError.message);
  });
});
