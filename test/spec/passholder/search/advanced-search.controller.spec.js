'use strict';

describe('Controller: PassholderAdvancedSearchController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var advancedSearchService, $q, controller, SearchParameters, PassholderSearchResults, $scope, activeCounter, Counter,
      $controller, $state, $rootScope;

  var SearchModes = {
    DETAIL: { title:'Zoeken', name:'DETAIL' },
    NUMBER: { title:'Via kaartnummer', name:'NUMBER' }
  };

  var jsonPass = {
    'uitPas': {
      'number': '0930000422202',
      'kansenStatuut': true,
      'status': 'LOCAL_STOCK',
      'type': 'CARD',
      'cardSystem': {
        'id': '4a567b89',
        'name': 'UiTPAS Regio Aalst'
      }
    },
    'passHolder': {
      'uid': 'string',
      'name': {
        'first': 'John',
        'middle': 'Lupus',
        'last': 'Smith'
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
      'inszNumber': '93051822361',
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
          'endDate': '2015-12-26',
          'cardSystem': {
            'id': '4a567b89',
            'name': 'UiTPAS Regio Aalst'
          }
        }
      ],
      'uitPassen': [
        {
          'number': '0930000422202',
          'kansenStatuut': true,
          'status': 'LOCAL_STOCK',
          'type': 'CARD',
          'cardSystem': {
            'id': '4a567b89',
            'name': 'UiTPAS Regio Aalst'
          }
        }
      ]
    },
    'group': {
      'name': 'Vereniging',
      'availableTickets': 0
    }
  };
  var activeCounterAssociations = [
    {
      id: 1,
      name:'Chiro Jongens',
      enddateCalculation: 'FREE',
      enddateCalculationFreeDate: 1451602799,
      enddateCalculationValidityTime: 30,
      permissionRead: true,
      permissionRegister: true,
      cardSystems: []
    },
    {
      id: 2,
      name:'Boyscouts from hell',
      enddateCalculation: 'BASED_ON_DATE_OF_BIRTH',
      enddateCalculationFreeDate: 1451602799,
      enddateCalculationValidityTime: 30,
      permissionRead: true,
      permissionRegister: true,
      cardSystems: []
    },
    {
      id: 3,
      name:'Karel & Jos gaan er op los',
      enddateCalculation: 'BASED_ON_REGISTRATION_DATE',
      enddateCalculationFreeDate: 1451602799,
      enddateCalculationValidityTime: 30,
      permissionRead: true,
      permissionRegister: true,
      cardSystems: []
    }
  ];
  var activeCounterJson = {
    'id': '452',
    'consumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
    'name': 'Vierdewereldgroep Mensen voor Mensen',
    'role': 'admin',
    'actorId': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
    'cardSystems': {
      '1': {
        'permissions': ['kansenstatuut toekennen'],
        'groups': ['Geauthorizeerde registratie balies'],
        'id': 1,
        'name': 'UiTPAS Regio Aalst',
        'distributionKeys': []
      }
    },
    'permissions': ['kansenstatuut toekennen'],
    'groups': ['Geauthorizeerde registratie balies']
  };
  var searchResponse = {
    'itemsPerPage': 10,
    'totalItems': 0,
    'member': [],
    'invalidUitpasNumbers': [],
    'firstPage': 'http://culpas-silex.dev/passholders?page=1',
    'lastPage': 'http://culpas-silex.dev/passholders?page=1',
    'previousPage': 'http://culpas-silex.dev/passholders?page=1',
    'nextPage': 'http://culpas-silex.dev/passholders?page=1'
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, $injector, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    advancedSearchService = jasmine.createSpyObj('advancedSearchService', ['findPassholders']);
    $q = $injector.get('$q');
    SearchParameters = $injector.get('SearchParameters');
    PassholderSearchResults = $injector.get('PassholderSearchResults');
    $scope = $rootScope.$new();
    Counter = $injector.get('Counter');
    activeCounter = new Counter(angular.copy(activeCounterJson));
    $state = jasmine.createSpyObj('$state', ['go']);
    $state.params = {};

    controller = $controller('PassholderAdvancedSearchController', {
      SearchParameters: SearchParameters,
      advancedSearchService: advancedSearchService,
      activeCounterAssociations: activeCounterAssociations,
      activeCounter: activeCounter,
      $state: $state,
      $rootScope: $rootScope,
      $scope: $scope
    });
  }));

  it('can validate UiTPAS numbers', function () {
    controller.validateUitpasNumbers();
    expect(controller.invalidNumbers).toEqual([]);

    var uitpasNumbersToValidate = '0930000804615 0930000807113 0930000802619 0930000801207';
    controller.validateUitpasNumbers(uitpasNumbersToValidate);
    expect(controller.invalidNumbers).toEqual([]);

    uitpasNumbersToValidate = '0930000804615 0930000807113 09300008026197 093000080120';
    controller.validateUitpasNumbers(uitpasNumbersToValidate);
    expect(controller.invalidNumbers).toEqual(['09300008026197', '093000080120']);
  });

  it('should validate passnumbers before searching passholders by number', function () {
    controller.passNumbers = '0930000804615 0930000807113 09300008026197 093000080120';
    spyOn(controller, 'validateUitpasNumbers').and.returnValue(false);

    controller.findPassholdersByNumbers();

    expect(controller.validateUitpasNumbers).toHaveBeenCalledWith('0930000804615 0930000807113 09300008026197 093000080120');
    expect(controller.invalidNumbers).toEqual([]);
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should display a list of invalid pass numbers before trying to search for them', function () {
    var expectInvalidNumbers = [
      '093000080461',
      '09300008071',
      '0930000802'
    ];
    controller.passNumbers = '093000080461 09300008071 0930000802 0930000801207';

    controller.findPassholdersByNumbers();

    expect(controller.invalidNumbers).toEqual(expectInvalidNumbers);
    expect(advancedSearchService.findPassholders).not.toHaveBeenCalled();
  });

  it('can find passholders', function () {
    var searchResponse = {
      'itemsPerPage': 10,
      'totalItems': 2,
      'member': [
        jsonPass,
        jsonPass
      ],
      'invalidUitpasNumbers': [
        '0930000804615',
        '0930000807113'
      ],
      'firstPage': 'http://culpas-silex.dev/passholders?page=1',
      'lastPage': 'http://culpas-silex.dev/passholders?page=1',
      'previousPage': 'http://culpas-silex.dev/passholders?page=1',
      'nextPage': 'http://culpas-silex.dev/passholders?page=1'
    };
    controller.passNumbers = '0930000804615 0930000807113 0930000802619 0930000801207';
    advancedSearchService.findPassholders.and.returnValue($q.when(new PassholderSearchResults(searchResponse)));

    controller.findPassholdersByNumbers();
    $scope.$digest();

    expect(controller.results).toEqual(new PassholderSearchResults(searchResponse));
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('can find passholders without passNumbers', function () {
    advancedSearchService.findPassholders.and.returnValue($q.when(new PassholderSearchResults(searchResponse)));

    controller.findPassholdersByNumbers();
    $scope.$digest();

    expect(controller.results).toEqual(new PassholderSearchResults(searchResponse));
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should show async errors from the API' , function () {
    var searchApiError = {};
    controller.passNumbers = '0930000804615 0930000807113 0930000802619 0930000801207';

    advancedSearchService.findPassholders.and.returnValue($q.reject(searchApiError));

    controller.findPassholdersByNumbers();
    $scope.$digest();
    expect(controller.asyncError).toEqual({});
  });

  it('can clear asyncErrors' , function () {
    var searchApiError = {};
    controller.passNumbers = '0930000804615 0930000807113 0930000802619 0930000801207';

    advancedSearchService.findPassholders.and.returnValue($q.reject(searchApiError));

    controller.findPassholdersByNumbers();
    $scope.$digest();
    expect(controller.asyncError).toEqual({});

    controller.clearAsyncError();
    expect(controller.asyncError).toBeNull();
  });

  it('should find passholders filtered with the details available on the side', function () {
    var serializedSearchParameters = {
      page: 1,
      dateOfBirth: '1988-02-03',
      firstName: 'Dirk',
      name: 'Dirkington',
      street: 'Dirklane',
      city: 'Dirktown',
      email: 'dirk@e-dirk.de',
      membershipAssociationId: 'some-id',
      membershipStatus: 'some-status'
    };

    controller.searchFields = new SearchParameters(serializedSearchParameters);
    var expectedSearchParameters = new SearchParameters(serializedSearchParameters);
    spyOn(controller, 'findPassholders');

    controller.findPassholdersByDetails();
    expect(controller.findPassholders).toHaveBeenCalledWith(expectedSearchParameters);
  });

  it('can disable the association membership status field', function () {
    expect(controller.disableAssociationMembershipStatus()).toBeTruthy();
    controller.searchFields.membershipAssociationId = 'something else';
    expect(controller.disableAssociationMembershipStatus()).toBeFalsy();
    controller.searchFields.membershipAssociationId = '';
    expect(controller.disableAssociationMembershipStatus()).toBeTruthy();
  });

  it('can reset the searchfields', function () {
    var serializedSearchParameters = {
      page: 1,
      dateOfBirth: '1988-02-03',
      firstName: 'Dirk',
      name: 'Dirkington',
      street: 'Driklane',
      city: 'Dirktown',
      email: 'dirk@e-dirk.de',
      membershipAssociationId: 'some-id',
      membershipStatus: 'some-status'
    };

    controller.searchFields = new SearchParameters(serializedSearchParameters);
    expect(controller.searchFields.firstName).toBe('Dirk');

    controller.resetSearchFields();
    expect(controller.searchFields).toEqual(new SearchParameters());
  });

  it('can validate search field patterns', function () {
    controller.searchFields.name = '*';
    controller.findPassholdersByDetails();

    var expectedError = {
      cleanMessage: 'Gebruik minstens 1 teken behalve * bij de velden:',
      context: [ 'Naam' ]
    };

    expect(controller.asyncError).toEqual(expectedError);
  });

  it('should show the correct tabs when when the page is loaded', function () {
    var withoutDetailsController = $controller('PassholderAdvancedSearchController', {
      SearchParameters: SearchParameters,
      advancedSearchService: advancedSearchService,
      activeCounterAssociations: [],
      activeCounter: new Counter(angular.copy(activeCounterJson)),
      $state: $state,
      $rootScope: $rootScope,
      $scope: $scope
    });

    expect(withoutDetailsController.detailModeEnabled).toEqual(false);

    var newCounter = new Counter(angular.copy(activeCounterJson));
    newCounter.cardSystems[1].permissions.push('registratie');
    var withDetailsController = $controller('PassholderAdvancedSearchController', {
      SearchParameters: SearchParameters,
      advancedSearchService: advancedSearchService,
      activeCounterAssociations: [],
      activeCounter: newCounter,
      $state: $state,
      $rootScope: $rootScope,
      $scope: $scope
    });

    expect(withDetailsController.detailModeEnabled).toEqual(true);
  });

  it('should fire off a search when search params are not default on initialization', function () {
    var searchParameters = jasmine.createSpyObj(searchParameters, ['hasDefaultParameters']);
    spyOn(controller, 'findPassholdersByDetails');
    spyOn(controller, 'findPassholdersByNumbers');
    searchParameters.hasDefaultParameters.and.returnValue(false);
    searchParameters.mode = SearchModes.DETAIL;

    controller.initializeSearchMode(searchParameters);
    expect(controller.findPassholdersByDetails).toHaveBeenCalled();

    // when detail mode is not enabled you can only find by number
    controller.detailModeEnabled = false;
    searchParameters.mode = SearchModes.NUMBER;
    controller.initializeSearchMode(searchParameters);
    expect(controller.findPassholdersByNumbers).toHaveBeenCalled();
  });

  it('reloads the parameters from the url on state change success', function () {
    advancedSearchService.findPassholders.and.returnValue($q.when(new PassholderSearchResults(searchResponse)));
    $state.params = {
      firstName: 'Jos',
      mode: 'NUMBER'
    };
    $rootScope.$emit('$locationChangeSuccess');
    var expectedSearchFields = {
      uitpasNumbers: [],
      page: 1,
      limit: 10,
      dateOfBirth: null,
      firstName: 'Jos',
      name: null,
      street: null,
      city: null,
      email: null,
      membershipAssociationId: null,
      membershipStatus: null,
      mode: {
        title:'Via kaartnummer',
        name:'NUMBER'
      }
    };
    expect(controller.searchFields).toEqual(expectedSearchFields);

    $state.params = {
      firstName: 'Jos',
      mode: 'DETAIL'
    };
    $rootScope.$emit('$locationChangeSuccess');
    var expectedSearchFields = {
      uitpasNumbers: [],
      page: 1,
      limit: 10,
      dateOfBirth: null,
      firstName: 'Jos',
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
    expect(controller.searchFields).toEqual(expectedSearchFields);
  });

  it('clears the parameters from the url on state change success with empty state params', function () {
    advancedSearchService.findPassholders.and.returnValue($q.when(new PassholderSearchResults(searchResponse)));
    $state.params = {
      mode: 'DETAIL',
      page: null
    };
    $rootScope.$emit('$locationChangeSuccess');
    var expectedSearchFields = {
      uitpasNumbers: [],
      page: 1,
      limit: 10,
      dateOfBirth: null,
      firstName: null,
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
    var expectedStateParams = {
      mode: 'DETAIL',
      page: null
    };
    expect(controller.searchFields).toEqual(expectedSearchFields);
    expect($state.params).toEqual(expectedStateParams);
  });

  it('does not clear the parameters from the url on state change success when page parameter is given', function () {
    advancedSearchService.findPassholders.and.returnValue($q.when(new PassholderSearchResults(searchResponse)));
    $state.params = {
      mode: 'DETAIL',
      'page' : 5,
    };
    $rootScope.$emit('$locationChangeSuccess');
    var expectedSearchFields = {
      uitpasNumbers: [],
      page: 5,
      limit: 10,
      dateOfBirth: null,
      firstName: null,
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
    var expectedStateParams = {
      mode: 'DETAIL',
      page: 5
    };
    expect(controller.searchFields).toEqual(expectedSearchFields);
    expect($state.params).toEqual(expectedStateParams);
  });

  it('can check if the form is empty', function () {
    expect(controller.formIsEmpty({})).toBeTruthy();
    expect(controller.formIsEmpty({field: {$modelValue: 'value'}})).toBeFalsy();
  });
});
