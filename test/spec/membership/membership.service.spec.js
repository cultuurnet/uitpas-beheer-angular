'use strict';

describe('Service: MembershipService', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  // Instantiate service.
  var membershipService, $httpBackend, $q, $scope;

  // Setup mocking data
  var passholder = { passNumber: '01234567891234' };
  var profile = {
    'allAssociations': {
      '10': {
        'enddateCalculationFreeDate': null,
        'enddateCalculationValidityTime': 1,
        'enddateCalculation': 'BASED_ON_REGISTRATION_DATE',
        'permissionRegister': false,
        'permissionRead': true,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'Vereniging 5',
        'id': 10
      },
      '9': {
        'enddateCalculationFreeDate': null,
        'enddateCalculationValidityTime': 1,
        'enddateCalculation': 'BASED_ON_REGISTRATION_DATE',
        'permissionRegister': false,
        'permissionRead': true,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'Vereniging 4',
        'id': 9
      },
      '8': {
        'enddateCalculationFreeDate': null,
        'enddateCalculationValidityTime': 30,
        'enddateCalculation': 'BASED_ON_DATE_OF_BIRTH',
        'permissionRegister': true,
        'permissionRead': true,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'Vereniging 3',
        'id': 8
      },
      '6': {
        'enddateCalculationFreeDate': 1451602799,
        'enddateCalculationValidityTime': null,
        'enddateCalculation': 'FREE',
        'permissionRegister': true,
        'permissionRead': true,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'Vereniging 1',
        'id': 6
      },
      '7': {
        'enddateCalculationFreeDate': 1443650400,
        'enddateCalculationValidityTime': null,
        'enddateCalculation': 'FREE',
        'permissionRegister': true,
        'permissionRead': true,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'testmedewerker Vlaamse Gemeenschapscommissie',
        'id': 7
      },
      '1': {
        'enddateCalculationFreeDate': 1451516400,
        'enddateCalculationValidityTime': null,
        'enddateCalculation': 'FREE',
        'permissionRegister': false,
        'permissionRead': false,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'Jeugdhuis Leeuwerik',
        'id': 1
      }
    },
    'otherAssociations': [
      {
        'enddateCalculationFreeDate': 1451516400,
        'enddateCalculationValidityTime': null,
        'enddateCalculation': 'FREE',
        'permissionRegister': false,
        'permissionRead': false,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'Jeugdhuis Leeuwerik',
        'id': 1
      },
      {
        'enddateCalculationFreeDate': 1443650400,
        'enddateCalculationValidityTime': null,
        'enddateCalculation': 'FREE',
        'permissionRegister': true,
        'permissionRead': true,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'testmedewerker Vlaamse Gemeenschapscommissie',
        'id': 7
      },
      {
        'enddateCalculationFreeDate': null,
        'enddateCalculationValidityTime': 30,
        'enddateCalculation': 'BASED_ON_DATE_OF_BIRTH',
        'permissionRegister': true,
        'permissionRead': true,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'Vereniging 3',
        'id': 8
      },
      {
        'enddateCalculationFreeDate': null,
        'enddateCalculationValidityTime': 1,
        'enddateCalculation': 'BASED_ON_REGISTRATION_DATE',
        'permissionRegister': false,
        'permissionRead': true,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'Vereniging 4',
        'id': 9
      },
      {
        'enddateCalculationFreeDate': null,
        'enddateCalculationValidityTime': 1,
        'enddateCalculation': 'BASED_ON_REGISTRATION_DATE',
        'permissionRegister': false,
        'permissionRead': true,
        'cardSystems': [
          {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          }
        ],
        'name': 'Vereniging 5',
        'id': 10
      }
    ],
    'atLeastOneKansenstatuutExpired': false,
    'passholder': {
      'voucherNumber': null,
      'uitpasNumber': null,
      'inszNumberHash': null,
      'numberOfCheckins': 2,
      'cardSystemSpecific': {
        '1': {
          'status': 'ACTIVE',
          'kansenStatuutInGracePeriod': false,
          'kansenStatuutEndDate': 1483225199,
          'kansenStatuutExpired': false,
          'kansenStatuut': true,
          'cardSystem': {
            'distributionKeys': [],
            'name': 'UiTPAS Regio Aalst',
            'id': 1
          },
          'smsPreference': 'NO_SMS',
          'emailPreference': 'ALL_MAILS',
          'currentCard': {
            'cardSystem': {
              'distributionKeys': [],
              'name': 'UiTPAS Regio Aalst',
              'id': 1
            },
            'type': 'CARD',
            'status': 'ACTIVE',
            'kansenpas': true,
            'uitpasNumber': '0930000800316',
            'city': null
          }
        }
      },
      'picture': null,
      'balieConsumerKey': null,
      'schoolConsumerKey': null,
      'moreInfo': null,
      'points': 38,
      'registrationBalieConsumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'memberships': [
        {
          'expired': false,
          'newEndDate': null,
          'renewDate': 1480546799,
          'renewable': false,
          'association': {
            'enddateCalculationFreeDate': null,
            'enddateCalculationValidityTime': null,
            'enddateCalculation': null,
            'permissionRegister': null,
            'permissionRead': null,
            'cardSystems': [
              {
                'distributionKeys': [],
                'name': 'UiTPAS Regio Aalst',
                'id': 1
              }
            ],
            'name': 'Vereniging 1',
            'id': 6
          },
          'endDate': 1483225199,
          'name': 'Vereniging 1',
          'associationId': '6',
          'id': '233'
        }
      ],
      'verified': false,
      'blocked': null,
      'uitIdUser': {
        'nick': 'mia-geldig-veelpunten_cnet-3',
        'id': '5950d8c2-b428-4b4b-9ee3-3bddd55cac17'
      },
      'kansenStatuutInGracePeriod': null,
      'kansenStatuutExpired': null,
      'kansenStatuutEndDate': null,
      'kansenStatuut': null,
      'price': null,
      'placeOfBirth': 'Aalst',
      'nationality': 'Belg',
      'gsm': 'gsm-nr',
      'telephone': '0444\/44.44.44',
      'city': 'Aalst',
      'postalCode': '9300',
      'box': null,
      'number': '1',
      'street': 'Wolvenveld',
      'gender': 'MALE',
      'dateOfBirth': 268351200,
      'inszNumber': '14071510381',
      'smsPreference': null,
      'emailPreference': null,
      'email': 'mia-geldig-veelpunten_cnet-3@mailinator.com',
      'secondName': null,
      'firstName': 'mia',
      'name': 'geldig veelpunten_cnet 3'
    }
  };
  var associationId = 1234;
  var endDate = {
    fixed: false,
    date: '2020-10-24'
  };
  // expected generic error
  var expectedError = {
    type: 'error',
    exception: 'CultuurNet\\UiTPASBeheer\\Counter\\CounterNotSetException',
    message: 'No active counter set for the current user.',
    code: 'COUNTER_NOT_SET'
  };
  var assertErrorReponse = function(error) {
    expect(error).toEqual(expectedError);
  };

  beforeEach(inject(function ($injector, $rootScope) {
    $httpBackend = $injector.get('$httpBackend');
    membershipService = $injector.get('membershipService');
    $q = $injector.get('$q');
    $scope = $rootScope;
  }));

  it('should return and resolve a promise when requesting for the memberships list', function(done) {
    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'passholders/' + passholder.passNumber + '/profile')
      .respond(200, JSON.stringify(profile));

    // request for membership list
    membershipService.list(passholder.passNumber).then(done);

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });

  it('should return 1 membership for the passholder', function() {
    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'passholders/' + passholder.passNumber + '/profile')
      .respond(200, JSON.stringify(profile));

    function done (data) {
      expect(data.passholder.memberships.length).toBe(1);
    }
    // request for membership list
    membershipService.list(passholder.passNumber).then(done);

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });

  it('should return and resolve a promise when requesting to stop a membership', function(done) {
    // Mock an HTTP response.
    $httpBackend
      .expectDELETE(apiUrl + 'passholders/' + passholder.passNumber + '/profile/memberships/' + associationId)
      .respond(200);

    // request to stop a membership for the passholder
    membershipService.stop(passholder.passNumber, associationId).then(done);

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });

  it('should return and resolve a promise when requesting to register a membership', function(done) {
    // expected body to be posted
    var expectRequestData = {
      associationId: associationId,
      endDate: endDate.date
    };

    // Mock an HTTP response.
    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + passholder.passNumber + '/profile/memberships', JSON.stringify(expectRequestData))
      .respond(200);

    // request to start a membership for the passholder
    membershipService.register(passholder.passNumber, associationId, endDate).then(done);

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });

  it('should send the correct body when requesting to register a membership', function(done) {
    // expected body to be posted
    var expectRequestData = {
      associationId: associationId
    };

    // change the date to fixed
    endDate.fixed = true;

    // Mock an HTTP response.
    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + passholder.passNumber + '/profile/memberships', JSON.stringify(expectRequestData))
      .respond(200);

    // request to start a membership for the passholder
    membershipService.register(passholder.passNumber, associationId, endDate).then(done);

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });

  it('should return an error when failing to request the memberships list', function(done) {
    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'passholders/' + passholder.passNumber + '/profile')
      .respond(400, JSON.stringify(expectedError));

    // request for membership list
    membershipService.list(passholder.passNumber).catch(function() {
      done();
    });

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });

  it('should return an error when failing to stop a membership', function() {
    // Mock an HTTP response.
    $httpBackend
      .expectDELETE(apiUrl + 'passholders/' + passholder.passNumber + '/profile/memberships/' + associationId)
      .respond(400, JSON.stringify(expectedError));

    // request to stop a membership for the passholder
    membershipService.stop(passholder.passNumber, associationId).catch(assertErrorReponse);

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });

  it('should return an error when failed to register a membership', function() {
    // Mock an HTTP response.
    $httpBackend
      .expectPOST(apiUrl + 'passholders/' + passholder.passNumber + '/profile/memberships')
      .respond(400, JSON.stringify(expectedError));

    // request to start a membership for the passholder
    membershipService.register(passholder.passNumber, associationId, endDate).catch(assertErrorReponse);

    // Deliver the HTTP response so the data is asserted.
    $httpBackend.flush();
  });
});
