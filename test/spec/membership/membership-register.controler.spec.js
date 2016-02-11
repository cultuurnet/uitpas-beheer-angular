'use strict';

describe('Controller: PassholderMembershipRegisterController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var $scope, $httpBackend, $q, $controller, association, passholder, membershipService, modalInstance, controller, moment;
  var endDate, isRecentlyExpired, mockedMembershipEndDateCalculator;

  isRecentlyExpired = false;

  association = {
    id: 124,
    enddateCalculation: 'BASED_ON_DATE_OF_BIRTH', // or BASED_ON_REGISTRATION_DATE or FREE
    enddateCalculationFreeDate: 1451602799,
    enddateCalculationValidityTime: 12
  };
  passholder = {
    passNumber: '1234567899912345',
    dateOfBirth: 700354800
  };
  var expectedError = {
    type: 'error',
    exception: 'CultuurNet\\UiTPASBeheer\\Counter\\CounterNotSetException',
    message: 'No active counter set for the current user.',
    code: 'COUNTER_NOT_SET'
  };

  function setMembershipEndDateOnDateOfBirth (isValid) {
    association.enddateCalculation = 'BASED_ON_DATE_OF_BIRTH';
    association.enddateCalculationValidityTime = isValid ? 11 : 13;
    passholder.dateOfBirth = (Date.now()/1000)-(31536000*12); // born exactly 12 years ago
  }

  function setMembershipEndDateOnRegistrationDate () {
    association.enddateCalculation = 'BASED_ON_REGISTRATION_DATE';
    association.enddateCalculationValidityTime = 5;
  }

  function setMembershipEndDateOnFree () {
    association.enddateCalculation = 'FREE';
    association.enddateCalculationFreeDate = (Date.now()/1000)+(31536000/52); // one week from now
  }

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
    moment = $injector.get('moment');
    membershipService = $injector.get('membershipService');
    endDate = {
      date: moment().toDate(),
      fixed: true
    };

    $scope = $rootScope.$new();
    $httpBackend = $injector.get('$httpBackend');
    controller = $controller('PassholderMembershipRegisterController', {
      $scope: $scope,
      $uibModalInstance: modalInstance,
      association: association,
      passholder: passholder,
      recentlyExpired: isRecentlyExpired,
      membershipService: membershipService
    });
  }));


  it('can register a new membership', function() {
    $scope.register($scope.endDate);
    expect($scope.waiting).toBe(true);
  });

  it('can dismiss the modal', function () {
    $scope.cancel();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('can submit a new membership', function () {
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
