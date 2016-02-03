'use strict';

describe('Controller: AddressBulkController', function () {

  var $controller, $uibModalInstance, $scope, BulkSelection, PassholderSearchResults, SearchParameters,
    searchResults, searchParameters, bulkSelection, passholderService, advancedSearchService, $state,
    addressBulkController, controller;

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
    firstPage: "http://culpas-silex.dev/passholders?firstName=jan&limit=10&page=1",
    invalidUitpasNumbers: [],
    itemsPerPage: 10,
    lastPage: "http://culpas-silex.dev/passholders?firstName=jan&limit=10&page=3",
    nextPage: "http://culpas-silex.dev/passholders?firstName=jan&limit=10&page=2",
    page: 1,
    passen: [
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

  // load the controller's module
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(inject(function (_$controller_, $rootScope, $injector, _$state_, _BulkSelection_, _PassholderSearchResults_, _SearchParameters_) {
    $controller = _$controller_;
    $state = _$state_;
    passholderService = jasmine.createSpyObj('passholderService', ['findPassholders, findPassholder']);
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['dismiss']);
    advancedSearchService = jasmine.createSpyObj('advancedSearchService', ['findPassholders']);
    $scope = $rootScope.$new();
    BulkSelection = _BulkSelection_;
    PassholderSearchResults = _PassholderSearchResults_;
    SearchParameters = _SearchParameters_;

    searchResults = new PassholderSearchResults(jsonSearchResults);
    searchParameters = new SearchParameters(jsonSearchParameters);
    bulkSelection = new BulkSelection(searchResults, searchParameters, []);

    controller = $controller('AddressBulkController', {
      bulkSelection: bulkSelection,
      passholderService: passholderService,
      $uibModalInstance: $uibModalInstance,
      $state: $state
    });

    controller.submitBusy = false;
    controller.isSubmitted = false;
  }));

  it('should initialize', function () {
    bulkSelection = new BulkSelection(
      new PassholderSearchResults(), new SearchParameters(), []);

    var expectedBulkSelection = {
      uitpasNumberSelection: [],
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

  it('should find all the passholders again when select all is selected', function () {

    bulkSelection.selectAll = true;
    spyOn(controller, 'findPassHoldersAgain');

    controller.checkSelectAll();

    expect(bulkSelection.selectAll).toBeTruthy();
    expect(searchParameters.limit).toEqual(searchResults.totalItems);
    expect(controller.findPassHoldersAgain).toHaveBeenCalledWith(searchParameters);
    expect(controller.passholders).toEqual(searchResults.passen);
  });

  it('should find the selected passholders individual by number through a loop', function () {
    bulkSelection.selectAll = false;

    spyOn(controller, 'findPassHolderByNumber');

    controller.checkSelectAll();

    expect(bulkSelection.selectAll).toBeFalsy();
    expect(controller.findPassHolderByNumber.calls.count()).toBe(bulkSelection.uitpasNumberSelection.length);
    expect(controller.passholders).toEqual(searchResults.passen);
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
      passholders: searchResults.passen, bulkAddressForm: addressForm, bulkSelection: bulkSelection });
    expect($state.transitionTo('counter.main.advancedSearch.showBulkResults'));
  });

  it('can close the modal', function () {
    controller.cancel();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });
});
