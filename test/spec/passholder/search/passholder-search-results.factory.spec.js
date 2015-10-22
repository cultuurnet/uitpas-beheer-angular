'use strict';

describe('Factory: PassholderSearchResults', function () {

  beforeEach(module('uitpasbeheerApp'));

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

  var PassholderSearchResults, Pass;

  beforeEach(inject(function (_PassholderSearchResults_, _Pass_) {
    PassholderSearchResults = _PassholderSearchResults_;
    Pass = _Pass_;
  }));

  function getJsonPassholderSearchResults() {
    return angular.copy(jsonResultCollection);
  }

  it('should correctly parse a search result set', function () {
    var jsonPassholderSearchResults = getJsonPassholderSearchResults();
    var memberPass = new Pass(jsonIdentity);
    var expectedPassholderSearchResults = {
      passen: [
        memberPass,
        memberPass,
        memberPass,
        memberPass,
        memberPass,
        memberPass,
        memberPass,
        memberPass,
        memberPass,
        memberPass
      ],
      itemsPerPage: 10,
      totalItems: 50,
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
      nextPage: 'http://culpas-silex.dev/passholders?page=2',
      unknownNumbersConfirmed: false,
      page: 1
    };

    var searchResults = new PassholderSearchResults(jsonPassholderSearchResults);
    expect(searchResults).toEqual(expectedPassholderSearchResults);

    jsonPassholderSearchResults.member = null;
    expectedPassholderSearchResults.passen = [];
    searchResults = new PassholderSearchResults(jsonPassholderSearchResults);
    expect(searchResults).toEqual(expectedPassholderSearchResults);
  });

  it('returns an empty object when no parameters are provided', function () {
    var expectedSearchResults = {
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
    };

    var passholderSearchResults = new PassholderSearchResults();

    expect(passholderSearchResults).toEqual(expectedSearchResults);
  });

  it('should keep track of unkown numbers and their confirmation', function () {
    var searchResults = new PassholderSearchResults();

    expect(searchResults.hasUnknownNumbers()).toEqual(false);

    searchResults.invalidUitpasNumbers = ['123132465465'];
    expect(searchResults.hasUnknownNumbers()).toEqual(true);
    expect(searchResults.hasConfirmedUnknownNumbers()).toEqual(false);

    searchResults.confirmUnknownNumbers();
    expect(searchResults.hasUnknownNumbers()).toEqual(true);
    expect(searchResults.hasConfirmedUnknownNumbers()).toEqual(true);
  });
});
