'use strict';

describe('Controller: MembershipController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, membershipService, $q, $scope, moment, $rootScope, modalInstance, deferredMemberShips, $httpBackend, $sce,
      today, yesterday, tomorrow, getMembershipWithEndDate;

  // Setup mocking data
  var memberShips = {
    'passholder': {
      'name': 'geldig veelpunten_cnet 1',
      'firstName': 'mia',
      'secondName': '',
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
            'cardSystems': [
              {
                'id': 1,
                'name': 'UiTPAS Regio Aalst',
                'distributionKeys': []
              }
            ],
            'permissionRead': null,
            'permissionRegister': null,
            'enddateCalculation': null,
            'enddateCalculationValidityTime': null,
            'enddateCalculationFreeDate': null
          },
          'renewable': false,
          'renewDate': 1480546799,
          'newEndDate': null,
          'expired': false,
          '$$hashKey': 'object:144'
        },
        {
          'id': '305',
          'associationId': '7',
          'name': 'testmedewerker Vlaamse Gemeenschapscommissie',
          'endDate': 1475359199,
          'association': {
            'id': 7,
            'name': 'testmedewerker Vlaamse Gemeenschapscommissie',
            'cardSystems': [
              {
                'id': 1,
                'name': 'UiTPAS Regio Aalst',
                'distributionKeys': []
              }
            ],
            'permissionRead': null,
            'permissionRegister': null,
            'enddateCalculation': null,
            'enddateCalculationValidityTime': null,
            'enddateCalculationFreeDate': null
          },
          'renewable': true,
          'renewDate': 1453458803,
          'newEndDate': 1475359199,
          'expired': false,
          '$$hashKey': 'object:145'
        }
      ],
      'registrationBalieConsumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'points': 15,
      'moreInfo': '',
      'schoolConsumerKey': null,
      'balieConsumerKey': null,
      'picture': null,
      'cardSystemSpecific': {
        '1': {
          'currentCard': {
            'city': null,
            'uitpasNumber': '0930000800118',
            'kansenpas': true,
            'status': 'ACTIVE',
            'type': 'CARD',
            'cardSystem': {
              'id': 1,
              'name': 'UiTPAS Regio Aalst',
              'distributionKeys': []
            }
          },
          'emailPreference': 'NOTIFICATION_MAILS',
          'smsPreference': 'NOTIFICATION_SMS',
          'cardSystem': {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          },
          'kansenStatuut': true,
          'kansenStatuutExpired': false,
          'kansenStatuutEndDate': 1483225199,
          'kansenStatuutInGracePeriod': false,
          'status': 'ACTIVE'
        }
      },
      'numberOfCheckins': 20,
      'inszNumberHash': null,
      'uitpasNumber': null,
      'voucherNumber': null,
      'passNumber': '0930000800118'
    },
    'atLeastOneKansenstatuutExpired': false,
    'otherAssociations': [
      {
        'id': 1,
        'name': 'Jeugdhuis Leeuwerik',
        'cardSystems': [
          {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          }
        ],
        'permissionRead': false,
        'permissionRegister': false,
        'enddateCalculation': 'FREE',
        'enddateCalculationValidityTime': null,
        'enddateCalculationFreeDate': 1451516400
      },
      {
        'id': 8,
        'name': 'Vereniging 3',
        'cardSystems': [
          {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          }
        ],
        'permissionRead': true,
        'permissionRegister': true,
        'enddateCalculation': 'BASED_ON_DATE_OF_BIRTH',
        'enddateCalculationValidityTime': 30,
        'enddateCalculationFreeDate': null,
        '$$hashKey': 'object:148'
      },
      {
        'id': 9,
        'name': 'Vereniging 4',
        'cardSystems': [
          {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          }
        ],
        'permissionRead': true,
        'permissionRegister': false,
        'enddateCalculation': 'BASED_ON_REGISTRATION_DATE',
        'enddateCalculationValidityTime': 1,
        'enddateCalculationFreeDate': null
      },
      {
        'id': 10,
        'name': 'Vereniging 5',
        'cardSystems': [
          {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          }
        ],
        'permissionRead': true,
        'permissionRegister': false,
        'enddateCalculation': 'BASED_ON_REGISTRATION_DATE',
        'enddateCalculationValidityTime': 1,
        'enddateCalculationFreeDate': null
      }
    ],
    'allAssociations': {
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
        'permissionRead': false,
        'permissionRegister': false,
        'enddateCalculation': 'FREE',
        'enddateCalculationValidityTime': null,
        'enddateCalculationFreeDate': 1451516400
      },
      '6': {
        'id': 6,
        'name': 'Vereniging 1',
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
        'enddateCalculationFreeDate': 1451602799
      },
      '7': {
        'id': 7,
        'name': 'testmedewerker Vlaamse Gemeenschapscommissie',
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
        'enddateCalculationFreeDate': 1443650400
      },
      '8': {
        'id': 8,
        'name': 'Vereniging 3',
        'cardSystems': [
          {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          }
        ],
        'permissionRead': true,
        'permissionRegister': true,
        'enddateCalculation': 'BASED_ON_DATE_OF_BIRTH',
        'enddateCalculationValidityTime': 30,
        'enddateCalculationFreeDate': null
      },
      '9': {
        'id': 9,
        'name': 'Vereniging 4',
        'cardSystems': [
          {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          }
        ],
        'permissionRead': true,
        'permissionRegister': false,
        'enddateCalculation': 'BASED_ON_REGISTRATION_DATE',
        'enddateCalculationValidityTime': 1,
        'enddateCalculationFreeDate': null
      },
      '10': {
        'id': 10,
        'name': 'Vereniging 5',
        'cardSystems': [
          {
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': []
          }
        ],
        'permissionRead': true,
        'permissionRegister': false,
        'enddateCalculation': 'BASED_ON_REGISTRATION_DATE',
        'enddateCalculationValidityTime': 1,
        'enddateCalculationFreeDate': null
      }
    }
  };
  memberShips = {
    'passholder': {
      'name': 'geldig veelpunten_cnet 1',
      'firstName': 'mia',
      'secondName': '',
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
      '1': {
        permissionRegister: true
      }
    }
  };

  var passholder = {
    passNumber: '01234567891234', points: 123
  };


  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, _$rootScope_) {

    $q = $injector.get('$q');
    $sce = $injector.get('$sce');
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    moment = $injector.get('moment');
    $httpBackend = $injector.get('$httpBackend');

    membershipService  = jasmine.createSpyObj('membershipService', ['list']);
    deferredMemberShips = $q.defer();
    var memberShipPromise = deferredMemberShips.promise;
    membershipService.list.and.returnValue(memberShipPromise);

    modalInstance = {
      open: jasmine.createSpy('modalInstance.open'),
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    controller = $controller('PassholderMembershipController', {
      passholder: passholder,
      membershipService: membershipService,
      moment: moment,
      $rootScope: $rootScope,
      $scope: $scope,
      MembershipEndDateCalculator: $injector.get('MembershipEndDateCalculator'),
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

});
