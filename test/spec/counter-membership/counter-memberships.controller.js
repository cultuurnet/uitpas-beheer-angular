'use strict';

describe('Controller: CounterMembershipsController', function () {

  beforeEach(module('ubr.counter-membership'));

  var controller, counterService, $state, $controller, $q, $scope;
  var memberships = [
    {
      uid: 'dirk-dirkington',
      nick: 'Dirk Dirkington',
      role: 'admin'
    },
    {
      uid: 'foo-bar',
      nick: 'Foo Bar',
      role: 'admin'
    },
    {
      uid: 'jane-doe',
      nick: 'Jane Doe',
      role: 'member'
    },
    {
      uid: 'some-made-up-id3',
      nick: 'John Doe',
      role: 'member'
    }
  ];


  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, $rootScope) {
    $controller = $injector.get('$controller');
    counterService = jasmine.createSpyObj('counterService', ['getMemberships', 'deleteMembership']);
    $state = jasmine.createSpyObj('$state', ['go']);
    $q = $injector.get('$q');
    $scope = $rootScope;
  }));

  it('should have a members collection after initialisation', function () {
    counterService.getMemberships.and.returnValue($q.when(memberships));
    controller = $controller('CounterMembershipsController', {
      newMember: null,
      counterService: counterService,
      $state: $state
    });

    $scope.$digest();

    expect(counterService.getMemberships).toHaveBeenCalled();
    expect(controller.members.length).toEqual(4);
  });

  it('should be able to handle errors when getting memberships', function () {
    counterService.getMemberships.and.returnValue($q.reject());
    controller = $controller('CounterMembershipsController', {
      newMember: null,
      counterService: counterService,
      $state: $state
    });

    controller.init();
    $scope.$digest();

    expect(counterService.getMemberships).toHaveBeenCalled();
    expect(controller.noMembersError).toBeTruthy();
  });

  it('should delete a member and refresh the members list', function () {
    counterService.deleteMembership.and.returnValue($q.when());
    counterService.getMemberships.and.returnValue($q.when(memberships));
    controller = $controller('CounterMembershipsController', {
      newMember: null,
      counterService: counterService,
      $state: $state
    });

    controller.deleteMember(memberships[0]);
    $scope.$digest();

    expect(counterService.deleteMembership).toHaveBeenCalledWith(memberships[0].uid);
    expect(counterService.getMemberships).toHaveBeenCalled();
  });

  it('should be able to handle an error when deleting a member', function () {
    var memberToDelete = memberships[0];
    counterService.getMemberships.and.returnValue($q.when(memberships));
    counterService.deleteMembership.and.returnValue($q.reject());
    controller = $controller('CounterMembershipsController', {
      newMember: null,
      counterService: counterService,
      $state: $state
    });

    controller.deleteMember(memberToDelete);
    $scope.$digest();

    expect(counterService.deleteMembership).toHaveBeenCalledWith(memberToDelete.uid);
    expect(memberToDelete.deleteError).toBeTruthy();
  });

  it('should redirect to th state to create a member', function () {
    counterService.getMemberships.and.returnValue($q.when(memberships));
    controller = $controller('CounterMembershipsController', {
      newMember: null,
      counterService: counterService,
      $state: $state
    });

    controller.createMembership();
    $scope.$digest();

    expect($state.go).toHaveBeenCalledWith('counter.memberships.create');
  });

  it('should guide the user throught a member delete confirmation', function () {
    var memberToDelete = memberships[0];
    counterService.getMemberships.and.returnValue($q.when(memberships));
    controller = $controller('CounterMembershipsController', {
      newMember: null,
      counterService: counterService,
      $state: $state
    });

    controller.initiateDelete(memberToDelete);
    expect(memberToDelete.confirmingDelete).toBeTruthy();

    controller.cancelDelete(memberToDelete);
    expect(memberToDelete.confirmingDelete).toBeFalsy();
  });
});
