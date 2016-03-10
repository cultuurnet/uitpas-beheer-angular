'use strict';

describe('Controller: PassholderActivityTariffsController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var $scope, $httpBackend, $q, $controller, activityService, modalInstance, TicketSaleAPIError,
    activityMode, bulkSelection, $state, BulkSelection, PassholderSearchResults, SearchParameters,
    searchResults, searchParameters, Counter, activeCounter, passholders, Passholder;

  var activity = {
    'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
    'title': 'Altijd open',
    'description': '',
    'when': '',
    'points': 182,
    'checkinConstraint': {
    'allowed': true,
      'startDate': new Date('2015-09-01T00:00:00+00:00'),
      'endDate': new Date('2015-09-01T23:59:59+00:00'),
      'reason': ''
  },
    free: true,
      sales: {
    maximumReached: false,
      differentiation: false,
      base: {
      'Default prijsklasse': 6
    },
    tariffs: {
      kansentariefAvailable: true,
        couponAvailable: false,
        lowestAvailable: 1.5,
        list: [
        {
          name: 'Kansentarief',
          type: 'KANSENTARIEF',
          maximumReached: false,
          prices: [
            {priceClass: 'Default prijsklasse', price: 1.5, type: 'KANSENTARIEF'}
          ]
        }
      ]
    }
  }
  };

  var passholder = { passNumber: '01234567891234', points: 123 };

  var jsonSearchParameters = {
    uitpasNumbers: [],
    page: 1,
    limit: 10,
    dateOfBirth: null,
    firstName: 'jan',
    name: null,
    street: null,
    city: null,
    email: null,
    membershipAssociationId: null,
    membershipStatus: null,
    mode: {
      title: 'Zoeken',
      name: 'DETAIL'
    }
  };

  var jsonSearchResults = {
    firstPage: 'http://culpas-silex.dev/passholders?firstName=jan&limit=10&page=1',
    invalidUitpasNumbers: [],
    itemsPerPage: 10,
    lastPage: 'http://culpas-silex.dev/passholders?firstName=jan&limit=10&page=3',
    nextPage: 'http://culpas-silex.dev/passholders?firstName=jan&limit=10&page=2',
    page: 1,
    member: [],
    length: 10,
    previousPage: undefined,
    totalItems: 29,
    unknownNumbersConfirmed: false
  };

  var jsonCounter = {
    'id': '452',
    'consumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
    'name': 'CC de Werf',
    'role': 'admin',
    'actorId': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
    'cardSystems': {
      '1': {
        'permissions': ['kansenstatuut toekennen'],
        'groups': ['Geauthorizeerde registratie balies'],
        'id': 1,
        'name': 'UiTPAS Dender',
        'distributionKeys': []
      }
    },
    'permissions': ['kansenstatuut toekennen'],
    'groups': ['Geauthorizeerde registratie balies']
  };

  var jsonPassHolder = {
    'uid': 'string',
    'name': {
      'first': 'Jeffrey',
      'middle': '',
      'last': 'Scholliers'
    },
    'address': {
      'street': 'Steenweg op Aalst 94',
      'postalCode': '9308',
      'city': 'Aalst'
    },
    'birth': {
      'date': '2003-12-26',
      'place': 'Sint-Agatha-Berchem'
    },
    'inszNumber': '97122957396',
    'gender': 'MALE',
    'nationality': 'Belg',
    'picture': 'R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw==',
    'contact': {
      'email': 'foo@bar.com',
      'telephoneNumber': '016454545',
      'mobileNumber': '+32 498 77 88 99'
    },
    'privacy': {
      'email': true,
      'sms': true
    },
    'points': 40,
    'remarks': 'Dit maakt niet uit.',
    'kansenStatuten': [
      {
        'status': 'ACTIVE',
        'endDate': '2017-12-31',
        'cardSystem': {
          'id': '1',
          'name': 'UiTPAS Dender'
        }
      }
    ],
    'uitPassen': [
      {
        'number': '0930000210219',
        'kansenStatuut': true,
        'status': 'ACTIVE',
        'type': 'CARD',
        'cardSystem': {
          'id': '1',
          'name': 'UiTPAS Dender'
        }
      }
    ]
  };

  beforeEach(inject(function ($injector, $rootScope){
    $controller = $injector.get('$controller');
    $state = jasmine.createSpyObj('$state', ['go']);
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    $q = $injector.get('$q');
    activityService = $injector.get('activityService');
    $scope = $rootScope.$new();
    $httpBackend = $injector.get('$httpBackend');
    TicketSaleAPIError = {
      ORANGE_API_ERROR: {
        message: 'Orange API Error',
        step: 'orangeStep'
      }
    };

    BulkSelection = $injector.get('BulkSelection');
    PassholderSearchResults = $injector.get('PassholderSearchResults');
    SearchParameters = $injector.get('SearchParameters');

    Counter = $injector.get('Counter');
    activeCounter = new Counter(angular.copy(jsonCounter));

    Passholder = $injector.get('Passholder');
    var jsonParsePassholder = new Passholder(jsonPassHolder);

    passholders = [
      jsonParsePassholder,
      jsonParsePassholder,
      jsonParsePassholder,
      jsonParsePassholder
    ];

    searchResults = new PassholderSearchResults(jsonSearchResults);
    searchParameters = new SearchParameters(jsonSearchParameters);
    bulkSelection = new BulkSelection(searchResults, searchParameters, []);

    activityMode = 'passholders';
  }));

  function getControllerForPassholder() {
    var controller = $controller('PassholderActivityTariffsController', {
      passholder: passholder,
      passholders: passholders,
      activity: activity,
      activityMode: activityMode,
      bulkSelection: bulkSelection,
      counter: activeCounter,
      $uibModalInstance: modalInstance,
      activityService: activityService,
      $rootScope: $scope,
      $state: $state,
      TicketSaleAPIError: TicketSaleAPIError
    });

    return controller;
  }

  it('should should have certain paramaters at initialisation', function () {
    var controller = getControllerForPassholder(passholder);
    expect(controller.passholder).toEqual(passholder);
    expect(controller.activity).toEqual(activity);
  });

  it('can dismiss the modal', function () {
    var controller = getControllerForPassholder(passholder);
    controller.cancelModal();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  it('can get the size of an object', function () {
    var controller = getControllerForPassholder(passholder);

    expect(controller.sizeOff(passholder)).toBe(2);
  });

  it('can submit the activity tariffs form', function () {
    var controller = getControllerForPassholder(passholder);
    var deferredClaim = $q.defer();
    var claimPromise = deferredClaim.promise;

    controller.selectedTariff = {
      type: 'COUPON',
      id: 123,
      price: 1235,
      priceClass: 'Basisprijs'
    };

    spyOn(activityService, 'claimTariff').and.returnValue(claimPromise);
    spyOn($scope, '$emit');

    controller.claimTariff(passholder, activity);

    expect(controller.formSubmitBusy).toBeTruthy();

    deferredClaim.resolve({claim: 'claim'});
    $scope.$digest();

    expect($scope.$emit).toHaveBeenCalled();
    expect(controller.formSubmitBusy).toBeFalsy();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('can handle errors during form submit', function () {
    var controller = getControllerForPassholder(passholder);
    var deferredClaim = $q.defer();
    var claimPromise = deferredClaim.promise;

    controller.selectedTariff = {
      type: 'COUPON',
      id: 123,
      price: 1235,
      priceClass: 'Basisprijs'
    };
    var serviceError = {
      code: 'TARIFF_NOT_CLAIMED',
      title: 'Tarief niet toegekend',
      message: 'Het geselecteerde tarief voor activiteit "ACTIVITY" kon niet worden toegekend.'
    };

    spyOn(activityService, 'claimTariff').and.returnValue(claimPromise);
    spyOn($scope, '$emit');

    controller.claimTariff(passholder, activity);

    expect(controller.formSubmitBusy).toBeTruthy();

    deferredClaim.reject(serviceError);
    $scope.$digest();

    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.asyncError).toEqual(serviceError);
    expect($scope.$emit).not.toHaveBeenCalled();
    expect(modalInstance.close).not.toHaveBeenCalled();
  });

  it('it should keep track of the total ticket price when buying multiple group tickets', function (){
    passholder = {availableTickets: 10};
    var controller = getControllerForPassholder();

    expect(controller.groupSale.maxTickets).toEqual(10);
    expect(controller.groupSale.getTotalPrice()).toEqual(1.5);

    controller.groupSale.tickets = 5;
    expect(controller.groupSale.getTotalPrice()).toEqual(7.5);
  });

  it('it displays a user friendly error message when the API returns a known error', function () {
    var controller = getControllerForPassholder(passholder);
    var ticketSaleError = {
      code: 'ORANGE_API_ERROR',
      message: 'I\'m a funky API error with technical details. Don\'t show me to noobs.'
    };
    var expectedAsyncError = {
      cleanMessage: 'Orange API Error',
      code: 'ORANGE_API_ERROR',
      message: 'I\'m a funky API error with technical details. Don\'t show me to noobs.'
    };

    controller.handleAsyncError(ticketSaleError);
    expect(controller.asyncError).toEqual(expectedAsyncError);

    controller.clearAsyncError();
    expect(controller.asyncError).toEqual(false);
  });

  it('should should have certain paramaters at initialisation when activity is counter', function () {
    activityMode = 'counter';
    passholder = '';
    var controller = getControllerForPassholder();
    expect(controller.passholders).toEqual(passholders);
    expect(controller.bulkSelection).toEqual(bulkSelection);
    expect(controller.passholder).toEqual(passholders[0]);
    expect(controller.activity).toEqual(activity);
  });

  it('can submit the activity tariffs form in bulk', function () {
    var controller = getControllerForPassholder();

    controller.selectedTariff = {
      type: 'COUPON',
      id: 123,
      price: 1235,
      priceClass: 'Basisprijs'
    };

    controller.bulkClaimTariff();

    expect(controller.formSubmitBusy).toBeTruthy();
    expect($state.go).toHaveBeenCalledWith('counter.main.advancedSearch.showBulkResults',{
      passholders: controller.passholders,
      activity: controller.activity,
      tariff: controller.selectedTariff,
      ticketCount: null,
      action: 'tariffs'
    });
  });
});
