'use strict';

describe('Factory: PassCollection', function () {

  beforeEach(module('uitpasbeheerApp'));

  var jsonSearchParametersUitpasNumbers = {
    page: 2,
    limit: 15,
    uitpasNumber: [
      '0987654321012',
      '0987654321013',
      '0987654321014',
      '0987654321015',
      '0987654321016',
      '0987654321017',
      '0987654321018',
      '0987654321019',
      '0987654321020'
    ]
  };
  var jsonSearchParametersFields = {
    dateOfBirth: '2004-08-16',
    firstName: 'Jos',
    name: 'Het debiele ei',
    street: 'Harensesteenweg',
    city: 'Vilvoorde',
    email: 'jos@humo.be',
    membershipAssociationId: 5,
    membershipStatus: 'ACTIVE'
  };

  var SearchParameters, day;

  beforeEach(inject(function (_SearchParameters_, _day_) {
    SearchParameters = _SearchParameters_;
    day = _day_;
  }));

  function getJsonSearchParametersUitpasNumbers() {
    return angular.copy(jsonSearchParametersUitpasNumbers);
  }

  function getJsonSearchParametersFields() {
    return angular.copy(jsonSearchParametersFields);
  }

  it('should correctly parse a UiTPAS numbers parameter set', function () {
    var jsonSearchParametersUitpasNumbers = getJsonSearchParametersUitpasNumbers();
    var expectedSearchParametersUitpasNumbers = getJsonSearchParametersUitpasNumbers();
    expectedSearchParametersUitpasNumbers.dateOfBirth = null;
    expectedSearchParametersUitpasNumbers.firstName = null;
    expectedSearchParametersUitpasNumbers.name = null;
    expectedSearchParametersUitpasNumbers.street = null;
    expectedSearchParametersUitpasNumbers.city = null;
    expectedSearchParametersUitpasNumbers.email = null;
    expectedSearchParametersUitpasNumbers.membershipAssociationId = null;
    expectedSearchParametersUitpasNumbers.membershipStatus = null;

    var searchParametersUitpasNumbers = new SearchParameters(jsonSearchParametersUitpasNumbers);

    expect(searchParametersUitpasNumbers).toEqual(expectedSearchParametersUitpasNumbers);
  });

  it('should correctly parse a fields parameter set', function () {
    var jsonSearchParametersFields = getJsonSearchParametersFields();
    var expectedSearchParametersFields = getJsonSearchParametersFields();
    expectedSearchParametersFields.page = null;
    expectedSearchParametersFields.limit = null;
    expectedSearchParametersFields['uitpasNumber[]'] = [];

    var searchParametersFields = new SearchParameters(jsonSearchParametersFields);
    expect(searchParametersFields.serialize()).toEqual(expectedSearchParametersFields);
  });

  it('should correctly parse a fields parameter set without birth date', function () {
    var jsonSearchParametersFields = getJsonSearchParametersFields();
    var expectedSearchParametersFields = getJsonSearchParametersFields();
    expectedSearchParametersFields.page = null;
    expectedSearchParametersFields.limit = null;
    expectedSearchParametersFields.dateOfBirth = null;
    expectedSearchParametersFields['uitpasNumber[]'] = [];

    var searchParametersFields = new SearchParameters(jsonSearchParametersFields);
    searchParametersFields.dateOfBirth = null;

    expect(searchParametersFields.serialize()).toEqual(expectedSearchParametersFields);
  });

  it('should correctly parse a fields parameter set whenn ot serialized', function () {
    var jsonSearchParametersFields = getJsonSearchParametersFields();
    var expectedSearchParametersFields = getJsonSearchParametersFields();
    expectedSearchParametersFields.page = null;
    expectedSearchParametersFields.limit = null;
    expectedSearchParametersFields.uitpasNumber = [];

    var searchParametersFields = new SearchParameters(jsonSearchParametersFields);

    expectedSearchParametersFields.dateOfBirth = day('2004-08-16', 'YYYY-MM-DD').toDate();
    expect(searchParametersFields).toEqual(expectedSearchParametersFields);
  });

  it('returns an empty object when no parameters are provided', function () {
    var expectedEmptyObject = {
      page: null,
      limit: null,
      uitpasNumber: [],
      dateOfBirth: null,
      firstName: null,
      name: null,
      street: null,
      city: null,
      email: null,
      membershipAssociationId: null,
      membershipStatus: null
    };

    expect(new SearchParameters()).toEqual(expectedEmptyObject);
  });
});
