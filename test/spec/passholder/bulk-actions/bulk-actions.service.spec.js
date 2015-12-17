'use strict';

describe('Service: bulkActionsService', function () {
  var apiUrl = 'http://example.com/';

  beforeEach(module('ubr.passholder.bulkActions', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
    $window = jasmine.createSpy();
    $provide.value('$window', $window);
  }));

  var bulkActionsService, $window, $httpParamSerializer, BulkSelection, SearchParameters,
    PassholderSearchResults, searchParameters, bulkSelection, searchResults;

  var jsonIdentity = {
    'uitPas': {
      'number': '0930000422202',
      'kansenStatuut': false,
      'status': 'ACTIVE'
    },
    'passHolder': {
      'name': {
        'first': 'Victor',
        'last': 'D\'Hooghe'
      },
      'address': {
        'street': 'Baanweg 60',
        'postalCode': '9308',
        'city': 'Aalst'
      },
      'birth': {
        'date': '2007-11-15',
        'place': 'Aalst'
      },
      'gender': 'MALE',
      'nationality': 'belg',
      'privacy': {
        'email': false,
        'sms': false
      },
      'contact': {
        'email': 'email@email.com'
      },
      kansenStatuten: [{
        status: 'ACTIVE',
        endDate: '2015-12-06',
        cardSystem: {
          name: 'UiTPAS Regio Aalst',
          id: '1'
        }
      }],
      uitPassen: [],
      'points': 309,
      'picture': 'picture-in-base64-format',
      'remarks': 'remarks',
      'uid': 'e1e2b335-e756-4e72-bb0f-3d163a583b35'
    }
  };
  var jsonResultCollection = {
    itemsPerPage: 10,
    totalItems: 50,
    member: [
      jsonIdentity,
      jsonIdentity,
      jsonIdentity,
      jsonIdentity,
      jsonIdentity,
      jsonIdentity,
      jsonIdentity,
      jsonIdentity,
      jsonIdentity,
      jsonIdentity
    ],
    invalidUitpasNumbers: [
      '0987654321012',
      '0987654321013',
      '0987654321014',
      '0987654321015',
      '0987654321016'
    ],
    firstPage: 'http://culpas-silex.dev/passholders?page=1',
    lastPage: 'http://culpas-silex.dev/passholders?page=5',
    previousPage: 'http://culpas-silex.dev/passholders?page=1',
    nextPage: 'http://culpas-silex.dev/passholders?page=2'
  };

  var searchParams = {
    'uitpasNumber': [
      '0123456789012',
      '0123456789013',
      '0123456789014',
      '0123456789015'
    ],
    'dateOfBirth': '1983-02-03',
    'firstName': 'Albe*',
    'name': 'Conta*',
    'street': 'Bondgenotenlaan',
    'city': 'Leuven',
    'email': 'foo@bar.com',
    'membershipAssociationId': '5',
    'membershipStatus': 'ACTIVE'
  };

  beforeEach(inject(function ($injector) {
    bulkActionsService = $injector.get('bulkActionsService');
    $window = $injector.get('$window');
    $httpParamSerializer = $injector.get('$httpParamSerializer');
    BulkSelection = $injector.get('BulkSelection');
    SearchParameters = $injector.get('SearchParameters');
    PassholderSearchResults = $injector.get('PassholderSearchResults');

    searchResults = new PassholderSearchResults(jsonResultCollection);
    searchParameters = new SearchParameters();
    searchParameters.fromParams(searchParams);

    bulkSelection = new BulkSelection(searchResults, searchParameters);
  }));

  it('redirects to the xlsx download url', function() {
    bulkSelection.addUitpasNumberToSelection('0123456789012');

    bulkActionsService.exportPassholders(bulkSelection);

    expect($window.location).toEqual('http://example.com/passholders.xlsx?city=Leuven&dateOfBirth=1983-02-03&email=foo@bar.com&firstName=Albe*&membershipAssociationId=5&membershipStatus=ACTIVE&name=Conta*&selection%5B%5D=0123456789012&street=Bondgenotenlaan');
  });

});
