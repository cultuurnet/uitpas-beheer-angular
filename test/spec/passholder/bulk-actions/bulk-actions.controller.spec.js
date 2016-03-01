'use strict';

describe('Controller: BulkActionsController', function () {

  var $controller, $uibModalInstance, $scope, BulkSelection, PassholderSearchResults, SearchParameters, $q,
    searchResults, searchParameters, bulkSelection, passholderService, advancedSearchService, $state, controller,
    Passholder, passholder, action, bulkSelectionSpy;

  var addressForm = {
    street: 'Teststraat 123',
    zip: '1000',
    city: 'Brussel'
  };
  addressForm.$valid = true;

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
    member: [
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass,
      jsonPass
    ],
    length: 10,
    previousPage: undefined,
    totalItems: 29,
    unknownNumbersConfirmed: false
  };

  var passholdersPromise = [
    jsonPass,
    jsonPass,
    jsonPass,
    jsonPass,
    jsonPass,
    jsonPass,
    jsonPass,
    jsonPass,
    jsonPass,
    jsonPass
  ];

  // load the controller's module
  beforeEach(module('ubr.passholder'));

  beforeEach(inject(function (_$controller_, $rootScope, $injector, _$state_) {
    $controller = _$controller_;
    $state = _$state_;
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['dismiss']);
    advancedSearchService = jasmine.createSpyObj('advancedSearchService', ['findPassholders']);
    bulkSelectionSpy = jasmine.createSpyObj('bulkSelectionFactory', ['getPassholderNumbers']);
    $scope = $rootScope.$new();
    $q = $injector.get('$q');
    BulkSelection = $injector.get('BulkSelection');
    PassholderSearchResults = $injector.get('PassholderSearchResults');
    SearchParameters = $injector.get('SearchParameters');
    Passholder = $injector.get('Passholder');

    //bulkSelectionSpy.getPassholderNumbers.and.returnValue(passholdersPromise);

    passholder = new Passholder(jsonPass);
    searchResults = new PassholderSearchResults(jsonSearchResults);
    searchParameters = new SearchParameters(jsonSearchParameters);
    bulkSelection = new BulkSelection(searchResults, searchParameters, []);
    action = 'address';


    controller = getController();
  }));

  var getController = function () {
    controller = $controller('BulkActionsController', {
      bulkSelection: bulkSelection,
      action: action,
      passholderService: passholderService,
      $uibModalInstance: $uibModalInstance,
      $state: $state
    });

    controller.submitBusy = false;
    controller.isSubmitted = false;

    return controller;
  };

  it('should initialize', function () {
    bulkSelection = new BulkSelection(
      new PassholderSearchResults(), new SearchParameters(), ['0934000004515', '0930000035319', '0930000065118']
    );

    var expectedBulkSelection = {
      uitpasNumberSelection: ['0934000004515', '0930000035319', '0930000065118'],
      searchParameters: {
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
      },
      searchResults: {
        itemsPerPage: 0,
        totalItems: 0,
        passen: [],
        invalidUitpasNumbers: [],
        firstPage: '',
        lastPage: '',
        previousPage: '',
        nextPage: '',
        unknownNumbersConfirmed: false,
        page: 1
      },
      selectAll: false
    };
    expect(bulkSelection).toEqual(expectedBulkSelection);
  });

  it('should lock down the form while submitting', function () {
    controller.submitForm(searchResults.passen, addressForm, bulkSelection);
    expect(controller.isSubmitted).toBeTruthy();
  });

  it('can submit the form and go to the next state', function() {
    spyOn(controller, 'submitForm').and.callThrough();
    spyOn($state, 'go');

    controller.submitForm(searchResults.passen, addressForm, bulkSelection);
    expect(addressForm.$valid).toBeTruthy();
    expect($state.go).toHaveBeenCalledWith('counter.main.advancedSearch.showBulkResults', {
      passholders: searchResults.passen, bulkForm: addressForm, bulkSelection: bulkSelection, action: action });
    expect($state.transitionTo('counter.main.advancedSearch.showBulkResults'));
  });

  it('can close the modal', function () {
    controller.cancel();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });
});
