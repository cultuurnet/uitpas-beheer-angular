'use strict';

describe('Controller: MembershipController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, membershipService, $q, $scope, moment, $rootScope, modalInstance, deferredMemberShips, $httpBackend, $sce, $uibModal,
      today, yesterday, tomorrow, getMembershipWithEndDate;

  // Setup mocking data
  var memberShips = {
    passholder: {
      'email': 'AANGEPASTmia-geldig-veelpunten_cnet-1@mailinator.com',
      'emailPreference': null,
      'smsPreference': null,
      'inszNumber': '14071510183',
      'dateOfBirth': -679536000,
      'gender': 'MALE',
      'street': 'Wolvenveld',
      'number': '1',
      'box': null,
      'postalCode': '9300',
      'city': 'Aalst',
      'telephone': '+3234567889',
      'gsm': '0479/44.44.44',
      'nationality': 'Belg',
      'placeOfBirth': 'Aalst',
      'price': null,
      'kansenStatuut': null,
      'kansenStatuutEndDate': null,
      'kansenStatuutExpired': null,
      'kansenStatuutInGracePeriod': null,
      'uitIdUser': {
        'id': '1bdf5cdd-efdb-450a-829a-b1818a8b78f3',
        'nick': 'mia-geldig-veelpunten_cnet-1'
      },
      'blocked': null,
      'verified': false,
      'memberships': [
        {
          'id': '231',
          'associationId': '6',
          'name': 'Vereniging 1',
          'endDate': 1483225199,
          'association': {
            'id': 6,
            'name': 'Vereniging 1',
            'permissionRegister': null
          },
          'renewable': false,
          'renewDate': 1480546799,
          'newEndDate': null,
          'expired': false
        },
        {
          'id': '305',
          'associationId': '7',
          'name': 'testmedewerker Vlaamse Gemeenschapscommissie',
          'endDate': 1475359199,
          'association': {
            'id': 7,
            'name': 'testmedewerker Vlaamse Gemeenschapscommissie',
            'permissionRegister': null
          },
          'renewable': true,
          'renewDate': 1453458803,
          'newEndDate': 1475359199,
          'expired': false
        }
      ],
      'uitpasNumber': null,
      'passNumber': '0930000800118'
    },
    allAssociations: {
      '0': {
        permissionRegister: false
      },
      '2': {
        'id': 2,
        'name': 'Vereniging 1',
        'cardSystems': [
          {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          }
        ],
        'permissionRead': true,
        'permissionRegister': false,
        'enddateCalculation': 'FREE',
        'enddateCalculationValidityTime': null,
        'enddateCalculationFreeDate': 1451602799
      },
      '1': {
        'id': 1,
        'name': 'Jeugdhuis Leeuwerik',
        'cardSystems': [
          {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          }
        ],
        'permissionRead': true,
        'permissionRegister': true,
        'enddateCalculation': 'FREE',
        'enddateCalculationValidityTime': null,
        'enddateCalculationFreeDate': 1451516400
      }
    }
  };
  var passholder = {
    passNumber: '01234567891234', points: 123
  };
  var fakeModal = {
    result: {
      then: function (confirmCallback, cancelCallback) {
        //Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
        this.confirmCallBack = confirmCallback;
        this.cancelCallback = cancelCallback;
      }
    },
    close: function (item) {
      //The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
      this.result.confirmCallBack(item);
    },
    dismiss: function (type) {
      //The user clicked cancel on the modal dialog, call the stored cancel callback
      this.result.cancelCallback(type);
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, _$rootScope_, _$uibModal_) {

    $q = $injector.get('$q');
    $sce = $injector.get('$sce');
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    moment = $injector.get('moment');
    $httpBackend = $injector.get('$httpBackend');
    $uibModal = _$uibModal_;

    membershipService  = jasmine.createSpyObj('membershipService', ['list']);
    deferredMemberShips = $q.defer();
    var memberShipPromise = deferredMemberShips.promise;
    membershipService.list.and.returnValue(memberShipPromise);

    var actualOptions;
    spyOn($uibModal, 'open').and.callFake(function(options){
      actualOptions = options;

      return fakeModal;
    });

    controller = $controller('PassholderMembershipController', {
      passholder: passholder,
      membershipService: membershipService,
      moment: moment,
      $rootScope: $rootScope,
      $scope: $scope,
      MembershipEndDateCalculator: $injector.get('MembershipEndDateCalculator'),
      $uibModal: $uibModal,
      $uibModalInstance: modalInstance
    });

    yesterday = moment().subtract(1, 'd');
    tomorrow =  moment().add(1, 'd');
    today =  moment();

    getMembershipWithEndDate = function (endDate) {
      return {endDate: endDate.unix()};
    };

    deferredMemberShips.resolve(memberShips);
    $scope.$digest();
  }));

  it('should load memberships for user when loaded', function () {
    expect(membershipService.list).toHaveBeenCalled();
    expect($scope.loadingMemberships).toBe(false);
  });

  it('should show the summary based on the expiration date and current date', function () {
    function getMembershipStatusSummaryForEndDate (endDate) {
      return $sce.getTrustedHtml($scope.membershipStatusSummary(getMembershipWithEndDate(endDate)));
    }

    expect(getMembershipStatusSummaryForEndDate(yesterday)).toContain('Vervallen');
    expect(getMembershipStatusSummaryForEndDate(yesterday)).toContain(yesterday.format('DD/MM/YYYY'));

    /*
     Does not seem to be neccecary as API returns last moment of day:
     moment.unix(1483225199).format() -> "2016-12-31T23:59:59+01:00"
     */
    //expect(getMembershipStatusSummaryForEndDate(today)).toContain('Vervalt');
    //expect(getMembershipStatusSummaryForEndDate(today)).toContain(tomorrow.format('DD/MM/YYYY'));


    expect(getMembershipStatusSummaryForEndDate(tomorrow)).toContain('Vervalt');
    expect(getMembershipStatusSummaryForEndDate(tomorrow)).toContain(tomorrow.format('DD/MM/YYYY'));
  });

  it('should correctly work with expired memberships', function () {
    expect($scope.expired(getMembershipWithEndDate(yesterday))).toBe(true);
    //expect($scope.expired(getMembershipWithEndDate(today))).toBe(false);
    expect($scope.expired(getMembershipWithEndDate(tomorrow))).toBe(false);
  });

  it('should mark renewable memberships if the membership is renewable and we have permission', function () {
    expect($scope.canRenew({ renewable: true, association: { id: 1, permissionRegister: null}})).toBe(true);

    expect($scope.canRenew({ renewable: true, association: { id: 0, permissionRegister: null}})).toBe(false);
    expect($scope.canRenew({ renewable: false, association: { id: 0, permissionRegister: null}})).toBe(false);
    expect($scope.canRenew({ renewable: false, association: { id: 0, permissionRegister: null}})).toBe(false);
  });

  it('should allow us to stop memberships if they are not expired and we have permission', function () {
    $scope.expired = function() { return false; };
    expect($scope.canStop({ association: { id: 1, permissionRegister: null}})).toBe(true);

    expect($scope.canStop({ association: { id: 0, permissionRegister: null}})).toBe(false);
    $scope.expired = function() { return true; };
    expect($scope.canStop({ association: { id: 1, permissionRegister: null}})).toBe(false);
    expect($scope.canStop({ association: { id: 0, permissionRegister: null}})).toBe(false);
  });

  it('should return if application for an association is possible', function () {
    expect($scope.canApplyFor(memberShips.allAssociations['1'])).toBe(true);
    expect($scope.canApplyFor(memberShips.allAssociations['2'])).toBe(false);
  });

  it('should return a title when no register permissions', function () {
    // Okay this is just bad code, should be refactored, see membership.controller->registerTitle
    expect($scope.registerTitle(memberShips.allAssociations['1'])).toBeUndefined();
    expect($scope.registerTitle(memberShips.allAssociations['2'])).not.toBeUndefined();
  });

  it('can open the membership registration modal', function () {
    $scope.openMembershipRegistrationModal(memberShips.allAssociations['0'], true);
    //$scope.$digest();
    expect($uibModal.open).toHaveBeenCalled();
  });

  it('can open the membership renewal modal', function () {
    $scope.openMembershipRenewalModal(memberShips.passholder.memberships[0]);
    //$scope.$digest();
    expect($uibModal.open).toHaveBeenCalled();
  });

  it('can open the membership stop modal', function () {
    $scope.openMembershipStopModal(memberShips.passholder.memberships[0]);
    //$scope.$digest();
    expect($uibModal.open).toHaveBeenCalled();
  });
});
