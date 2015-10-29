'use strict';

describe('Factory: PassCollection', function () {

  beforeEach(module('uitpasbeheerApp'));

  var jsonSearchParametersUitpasNumbers = {
    page: 2,
    limit: 15,
    uitpasNumbers: [
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
    var expectedSearchParametersFields = {
      city: 'Vilvoorde',
      dateOfBirth: '2004-08-16',
      email: 'jos@humo.be',
      firstName: 'Jos',
      limit: 10,
      membershipAssociationId: 5,
      membershipStatus: 'ACTIVE',
      name: 'Het debiele ei',
      page: 1,
      street: 'Harensesteenweg'
    };

    var searchParametersFields = new SearchParameters(jsonSearchParametersFields);
    expect(searchParametersFields.serialize()).toEqual(expectedSearchParametersFields);
  });

  it('should correctly parse a fields parameter set without birth date', function () {
    var jsonSearchParametersFields = getJsonSearchParametersFields();
    var expectedSearchParametersFields = {
      city: 'Vilvoorde',
      email: 'jos@humo.be',
      firstName: 'Jos',
      limit: 10,
      membershipAssociationId: 5,
      membershipStatus: 'ACTIVE',
      name: 'Het debiele ei',
      page: 1,
      street: 'Harensesteenweg'
    };

    var searchParametersFields = new SearchParameters(jsonSearchParametersFields);
    searchParametersFields.dateOfBirth = null;

    expect(searchParametersFields.serialize()).toEqual(expectedSearchParametersFields);
  });

  it('returns an empty object when no parameters are provided', function () {
    var expectedEmptyObject = {
      page: 1,
      limit: 10,
      uitpasNumbers: [],
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

  it('should consider the results set for search parameters the same when only their page is different', function (){
    var searchParametersPageOne = new SearchParameters(getJsonSearchParametersFields());
    searchParametersPageOne.page = 1;
    var searchParametersPageTwo = angular.copy(searchParametersPageOne);
    searchParametersPageTwo.page = 2;

    expect(searchParametersPageOne.yieldsSameResultSetAs(searchParametersPageTwo)).toEqual(true);

    searchParametersPageTwo.name = 'Dirk';
    expect(searchParametersPageOne.yieldsSameResultSetAs(searchParametersPageTwo)).toEqual(false);
  });

  it('should leave out empty parameters when serializing', function () {
    var emptySearchData = {
      dateOfBirth: null,
      firstName: '',
      name: '',
      street: '',
      city: '',
      email: '',
      membershipAssociationId: null,
      membershipStatus: null,
      'uitpasNumber[]': []
    };
    var expectedSerializedSearchParameters = {
      page: 1,
      limit: 10
    };

    var searchParameters = new SearchParameters(emptySearchData);
    var actualSerializedSearchParameters = searchParameters.serialize();
    expect(actualSerializedSearchParameters).toEqual(expectedSerializedSearchParameters);
  });

  it('should include UiTPAS numbers when serializing search parameters', function () {
    var searchParameters = new SearchParameters({uitpasNumbers: ['123465798654', '123465798852']});

    var expectedParameters = {
      page: 1,
      limit: 10,
      'uitpasNumber[]': ['123465798654', '123465798852']
    };

    expect(searchParameters.serialize()).toEqual(expectedParameters);
  });
});
