'use strict';

describe('Factory: BulkSelection', function () {

  beforeEach(module('uitpasbeheerApp'));

  var BulkSelection, PassholderSearchResults, SearchParameters, bulkSelection, searchResults, searchParameters, Pass;

  var jsonPass = {
    'uitPas': {
      'number': '0930000422202',
      'kansenStatuut': false,
      'status': 'ACTIVE'
    },
    'passHolder': {
      'name': {
        'first': 'Victor',
        'last': 'DHooghe'
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
      'remarks': 'remarks',
      'uid': 'e1e2b335-e756-4e72-bb0f-3d163a583b35'
    }
  };
  var jsonSearchResultsWithPassen = {
    member: [
      angular.copy(jsonPass),
      angular.copy(jsonPass)
    ],
    itemsPerPage: 10,
    totalItems: 2,
    invalidUitpasNumbers: [],
    firstPage: 'http://culpas-silex.dev/passholders?page=1',
    lastPage: 'http://culpas-silex.dev/passholders?page=5',
    previousPage: 'http://culpas-silex.dev/passholders?page=1',
    nextPage: 'http://culpas-silex.dev/passholders?page=2',
    unknownNumbersConfirmed: false,
    page: 1
  };
  jsonSearchResultsWithPassen.member[1].uitPas.number = '0930000422203';

  var jsonSearchParameters = {
    dateOfBirth: '2004-08-16',
    firstName: 'Jos',
    name: 'Het debiele ei',
    street: 'Harensesteenweg',
    city: 'Vilvoorde',
    email: 'jos@humo.be',
    membershipAssociationId: 5,
    membershipStatus: 'ACTIVE'
  };

  beforeEach(inject(function (_BulkSelection_, _PassholderSearchResults_, _SearchParameters_, _Pass_) {
    BulkSelection = _BulkSelection_;
    PassholderSearchResults = _PassholderSearchResults_;
    SearchParameters = _SearchParameters_;
    Pass = _Pass_;

    searchResults = new PassholderSearchResults();
    searchParameters = new SearchParameters();
    bulkSelection = new BulkSelection(searchResults, searchParameters, []);
  }));


  it('should initialize', function () {
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

  it('can receive new searchParameters', function () {
    var newSearchparamaters = new SearchParameters(jsonSearchParameters);
    bulkSelection.updateSearchParameters(newSearchparamaters);

    var expectedBulkSelection = {
      uitpasNumberSelection: [],
      searchParameters: {
        uitpasNumbers: [],
        page: 1,
        limit: 10,
        dateOfBirth: new Date('2004-08-16'),
        firstName: 'Jos',
        name: 'Het debiele ei',
        street: 'Harensesteenweg',
        city: 'Vilvoorde',
        email: 'jos@humo.be',
        membershipAssociationId: 5,
        membershipStatus: 'ACTIVE',
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

  it('can receive new searchResults', function () {
    bulkSelection.uitpasNumberSelection = ['0987654321013'];
    bulkSelection.selectAll = true;
    var searchResults = new PassholderSearchResults(jsonSearchResultsWithPassen);
    bulkSelection.updateSearchResults(searchResults);

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
        itemsPerPage: 10,
        totalItems: 2,
        passen: [],
        invalidUitpasNumbers: [],
        firstPage: 'http://culpas-silex.dev/passholders?page=1',
        lastPage: 'http://culpas-silex.dev/passholders?page=5',
        previousPage: 'http://culpas-silex.dev/passholders?page=1',
        nextPage: 'http://culpas-silex.dev/passholders?page=2',
        unknownNumbersConfirmed: false,
        page: 1
      },
      selectAll: false
    };
    expectedBulkSelection.searchResults.passen[0] = new Pass(jsonSearchResultsWithPassen.member[0]);
    expectedBulkSelection.searchResults.passen[1] = new Pass(jsonSearchResultsWithPassen.member[1]);
    expect(bulkSelection).toEqual(expectedBulkSelection);
    expect(bulkSelection.uitpasNumberSelection).toEqual([]);
    expect(bulkSelection.selectAll).toBeFalsy();
  });

  it('can add an uitpas number to the selection', function () {
    var searchResults = new PassholderSearchResults(jsonSearchResultsWithPassen);
    bulkSelection.updateSearchResults(searchResults);
    bulkSelection.addUitpasNumberToSelection('0987654321013');
    expect(bulkSelection.uitpasNumberSelection).toEqual(['0987654321013']);

    bulkSelection.addUitpasNumberToSelection('0987654321013');
    expect(bulkSelection.uitpasNumberSelection).toEqual([]);
    expect(bulkSelection.selectAll).toBeTruthy();
  });

  it('can remove an uitpas number from a number selection', function () {
    bulkSelection.uitpasNumberSelection = [
      '0987654321012',
      '0987654321013'
    ];

    bulkSelection.removeUitpasNumberFromSelection('0987654321012');
    expect(bulkSelection.uitpasNumberSelection).toEqual(['0987654321013']);
  });

  it('can remove an uitpas number from the select all selection', function () {
    var searchResults = new PassholderSearchResults(jsonSearchResultsWithPassen);
    bulkSelection.updateSearchResults(searchResults);
    bulkSelection.selectAll = true;

    bulkSelection.removeUitpasNumberFromSelection('0930000422202');

    expect(bulkSelection.uitpasNumberSelection).toEqual(['0930000422203']);
    expect(bulkSelection.selectAll).toBeFalsy();
  });

  it('can remove all the uitpas numbers from the selection', function () {
    bulkSelection.uitpasNumberSelection = [
      '0987654321013',
      '0987654321014',
      '0987654321015'
    ];

    bulkSelection.removeAllUitpasNumbers();
    expect(bulkSelection.uitpasNumberSelection).toEqual([]);
  });

  it('can check if a number is in the selection', function () {
    bulkSelection.uitpasNumberSelection = [
      '0987654321013',
      '0987654321014',
      '0987654321015'
    ];

    expect(bulkSelection.numberInSelection('0987654321013')).toBeTruthy();
    expect(bulkSelection.numberInSelection('0987654321012')).toBeFalsy();
  });

  it('can convert its internal data to information for the request', function () {
    var newSearchparamaters = new SearchParameters(jsonSearchParameters);
    bulkSelection.updateSearchParameters(newSearchparamaters);

    var expectedBulkSelection = {
      searchParameters: {
        firstName: 'Jos',
        name: 'Het debiele ei',
        street: 'Harensesteenweg',
        city: 'Vilvoorde',
        email: 'jos@humo.be',
        membershipAssociationId: 5,
        membershipStatus: 'ACTIVE',
        dateOfBirth: '2004-08-16'
      }
    };

    expect(bulkSelection.toBulkSelection()).toEqual(expectedBulkSelection);

    bulkSelection.uitpasNumberSelection = [
      '0987654321013',
      '0987654321014',
      '0987654321015'
    ];
    expectedBulkSelection.selection = [
      '0987654321013',
      '0987654321014',
      '0987654321015'
    ];
    expect(bulkSelection.toBulkSelection()).toEqual(expectedBulkSelection);

  });
});
