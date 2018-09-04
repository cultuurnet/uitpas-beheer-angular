'use strict';

describe('Controller: PassholderDetailController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var detailController, $rootScope, advantage, $q, moment, $scope, passholderService, deferredPassholder,
      membershipService, $controller, $window, $state, activeCounter, Counter;

  function getJsonCounter(){
    var jsonCounter = {
      'id': '452',
      'consumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'name': 'Vierdewereldgroep Mensen voor Mensen',
      'role': 'admin',
      'actorId': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'cardSystems': {
        '1': {
          'permissions': ['registratie', 'kansenstatuut toekennen'],
          'groups': ['Geauthorizeerde registratie balies'],
          'id': 1,
          'name': 'UiTPAS Regio Aalst',
          'distributionKeys': []
        }
      },
      'permissions': ['registratie', 'kansenstatuut toekennen'],
      'groups': ['Geauthorizeerde registratie balies']
    };

    return jsonCounter;
  }

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, $injector, _$rootScope_) {
    advantage = {
      exchangeable: true,
      id: 'advantage-id',
      points: 23,
      title: 'untitled'
    };

    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $window = {history: jasmine.createSpyObj('history', ['back'])};

    $state = jasmine.createSpyObj('$state', ['go']);
    $q = $injector.get('$q');
    moment = $injector.get('moment');

    passholderService = $injector.get('passholderService');
    membershipService = jasmine.createSpyObj('membershipService', ['list']);
    membershipService.list.and.returnValue($q.reject());
    Counter = $injector.get('Counter');
    activeCounter = new Counter(getJsonCounter());

    spyOn(passholderService, 'getCoupons').and.returnValue($q.reject());

    detailController = getController();

    deferredPassholder = $q.defer();
    deferredPassholder.resolve(angular.copy(detailController.passholder));
    spyOn(passholderService, 'findPassholder').and.returnValue(
      deferredPassholder.promise
    );
  }));

  function getController() {
    return $controller('PassholderDetailController', {
      pass: {
        number: '01234567891234',
        passholder: { passNumber: '01234567891234', points: 123, name: {first: 'Fred'} }
      },
      $rootScope: $rootScope,
      membershipService: membershipService,
      $scope: $scope,
      moment: moment,
      passholderService: passholderService,
      activeCounter: activeCounter,
      $window: $window,
      $state: $state,
      destination: null
    });
  }

  it('should update passholder points when an advantage is exchanged', function () {
    $rootScope.$emit('advantageExchanged', advantage, detailController.passholder.passNumber);
    $rootScope.$digest();

    expect(detailController.passholder.points).toEqual(100);
  });

  it('should add activity points when checking in', function () {
    $rootScope.$emit('activityCheckedIn', { act: 'ivity', points: 27});
    $rootScope.$digest();

    expect(detailController.passholder.points).toEqual(150);
  });

  it('makes sure a passholder does not end up with negative points', function () {
    var expensiveAdvantage = advantage;
    expensiveAdvantage.points = 222;

    $rootScope.$emit('advantageExchanged', expensiveAdvantage);
    $rootScope.$digest();

    expect(detailController.passholder.points).toEqual(0);
  });

  it('should update the passholder in the sidebar after the passholder is edited', function () {
    $rootScope.$emit('passholderUpdated', { passNumber: '01234567891234', points: 123, name: {first: 'Karel'} });
    expect(detailController.passholder.name.first).toEqual('Karel');
  });

  it('should update the coupons in the sidebar after an activity tariff is claimed', function () {
    $rootScope.$emit('activityTariffClaimed', { activity: 'is fake' });
    expect(passholderService.getCoupons).toHaveBeenCalled();
  });

  it('should get a list of coupons for the passholder', function () {
    var expectedCoupons = [
      {
        'id': '0',
        'name': 'Cultuurbon',
        'conditions': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
        'date': '2015-12-26',
        'remainingTotal': 4
      },
      {
        'id': '1',
        'name': 'Cultuurbon2',
        'conditions': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
        'date': '2015-11-26',
        'remainingTotal': 5
      },
      {
        'id': '2',
        'name': 'Cultuurbon3',
        'conditions': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
        'date': '2016-01-26',
        'remainingTotal': 3
      }
    ];
    passholderService.getCoupons.and.returnValue($q.resolve(expectedCoupons));

    var controller = getController();
    $scope.$digest();

    expect(passholderService.getCoupons).toHaveBeenCalledWith('01234567891234', -1);
    expect(controller.coupons).toEqual(expectedCoupons);
    expect(controller.couponsLoading).toEqual(false);
  });

  it('can go back in browser history', function () {
    detailController = getController();

    detailController.goBack();

    expect($window.history.back).toHaveBeenCalled();
  });

  it('should start with the kansenstatuut modal for authorised counters', function () {
    var cardSystem = { id: 1 };
    detailController.showModalForCardSystem(cardSystem);
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder.upgrade.kansenStatuut', { cardSystem: { id: 1 } });
  });

  it('should start with the new card modal for unauthorised counters', function () {
    var cardSystem = { id: 5 };
    detailController.showModalForCardSystem(cardSystem);
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder.upgrade.newCard', { cardSystem: { id: 5 } });
  });

  it('should set the show all coupons variable', function () {
    expect(detailController.showAllCoupons).toEqual(false);
    detailController.toggleCoupons();
    expect(detailController.showAllCoupons).toEqual(true);
  });
});
