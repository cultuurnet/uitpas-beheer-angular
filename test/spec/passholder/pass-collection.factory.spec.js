'use strict';

describe('Factory: PassCollection', function () {

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

  var PassCollection, Pass;

  beforeEach(inject(function (_PassCollection_, _Pass_) {
    PassCollection = _PassCollection_;
    Pass = _Pass_;
  }));

  function getJsonPassCollection() {
    return angular.copy(jsonResultCollection);
  }

  it('should correctly parse a search result set', function () {
    var jsonPassCollection = getJsonPassCollection();

    var expectedPassCollection = angular.copy(jsonResultCollection);
    var memberPass = new Pass(jsonIdentity);
    expectedPassCollection.member = [
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
    ];

    var passCollection = new PassCollection(jsonPassCollection);
    expect(passCollection).toEqual(expectedPassCollection);

    jsonPassCollection.member = null;
    expectedPassCollection.member = [];
    passCollection = new PassCollection(jsonPassCollection);
    expect(passCollection).toEqual(expectedPassCollection);
  });

  it('returns an empty object when no parameters are provided', function () {
    var expectedEmptyObject = {
      itemsPerPage: '',
      totalItems: '',
      member: [],
      invalidUitpasNumbers: [],
      firstPage: '',
      lastPage: '',
      previousPage: '',
      nextPage: ''
    };

    expect(new PassCollection()).toEqual(expectedEmptyObject);
  });
});
