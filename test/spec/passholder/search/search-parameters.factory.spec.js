'use strict';

describe('Factory: PassCollection', function () {

  beforeEach(module('uitpasbeheerApp'));

  /**
   * Search mode enum.
   * @readonly
   * @enum {object}
   */
  var SearchModes = {
    DETAIL: { title:'Zoeken', name:'DETAIL' },
    NUMBER: { title:'Via kaartnummer', name:'NUMBER' }
  };

  var jsonSearchParametersUitpasNumbers = {
    page: 1,
    limit: 10,
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
    var expectedSearchParametersUitpasNumbers = new SearchParameters();
    expectedSearchParametersUitpasNumbers.uitpasNumbers = [
      '0987654321012',
      '0987654321013',
      '0987654321014',
      '0987654321015',
      '0987654321016',
      '0987654321017',
      '0987654321018',
      '0987654321019',
      '0987654321020'
    ];

    var searchParametersUitpasNumbers = new SearchParameters(jsonSearchParametersUitpasNumbers);

    expect(searchParametersUitpasNumbers).toEqual(expectedSearchParametersUitpasNumbers);
  });

  it('should correctly parse a fields parameter set', function () {
    var jsonSearchParametersFields = getJsonSearchParametersFields();
    var expectedSearchParametersFields = {
      city: 'Vilvoorde',
      dateOfBirth: new Date('2004-08-16'),
      email: 'jos@humo.be',
      firstName: 'Jos',
      limit: 10,
      membershipAssociationId: 5,
      membershipStatus: 'ACTIVE',
      name: 'Het debiele ei',
      page: 1,
      street: 'Harensesteenweg',
      mode: SearchModes.DETAIL,
      uitpasNumbers: []
    };

    var searchParametersFields = new SearchParameters(jsonSearchParametersFields);
    expect(searchParametersFields).toEqual(expectedSearchParametersFields);
  });

  it('should correctly parse a fields parameter set without birth date', function () {
    var jsonSearchParametersFields = getJsonSearchParametersFields();
    var expectedSearchParametersFields = new SearchParameters({
      city: 'Vilvoorde',
      email: 'jos@humo.be',
      firstName: 'Jos',
      limit: 10,
      membershipAssociationId: 5,
      membershipStatus: 'ACTIVE',
      name: 'Het debiele ei',
      page: 1,
      street: 'Harensesteenweg'
    });

    var searchParametersFields = new SearchParameters(jsonSearchParametersFields);
    searchParametersFields.dateOfBirth = null;

    expect(searchParametersFields).toEqual(expectedSearchParametersFields);
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
      membershipStatus: null,
      mode: SearchModes.DETAIL
    };
    var actualParameters = new SearchParameters();

    expect(actualParameters).toEqual(expectedEmptyObject);
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

  it('should url encode dob, uitpas-numbers and email when getting params', function () {
    var searchParameters = new SearchParameters({
      uitpasNumbers: ['123465798654', '123465798852'],
      email: 'dirk@iDirk.de',
      dateOfBirth: '1955-05-05'
    });

    var params = searchParameters.toParams();
    var expectedParams = {
      uitpasNumbers: '123465798654-123465798852',
      email: 'dirk%40iDirk%2Ede',
      dateOfBirth: '1955-05-05',
      page: 1,
      mode: 'DETAIL'
    };

    expect(params).toEqual(expectedParams);
  });

  it('should include all the relevant parameters when searching by passholder details', function () {
    var serializedParameters = {
      city: 'Vilvoorde',
      dateOfBirth: '2004-08-16',
      email: 'jos@humo.be',
      firstName: 'Jos',
      limit: 10,
      membershipAssociationId: 5,
      membershipStatus: 'ACTIVE',
      name: 'Het debiele ei',
      page: 1,
      street: 'Harensesteenweg',
      mode: 'DETAIL'
    };

    var expectedParameters = {
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

    var searchParameters = new SearchParameters(serializedParameters);
    var queryParameters = searchParameters.toQueryParameters();

    expect(queryParameters).toEqual(expectedParameters);
  });

  it('should include all the relevant parameters when searching by passholder numbers', function () {
    var serializedParameters = {
      city: 'Vilvoorde',
      dateOfBirth: '2004-08-16',
      email: 'jos@humo.be',
      firstName: 'Jos',
      limit: 10,
      membershipAssociationId: 5,
      membershipStatus: 'ACTIVE',
      name: 'Het debiele ei',
      page: 1,
      street: 'Harensesteenweg',
      mode: 'NUMBER',
      uitpasNumbers: ['123465798654', '123465798852']
    };

    var expectedParameters = {
      limit: 10,
      page: 1,
      'uitpasNumber[]': ['123465798654', '123465798852']
    };

    var searchParameters = new SearchParameters(serializedParameters);
    var queryParameters = searchParameters.toQueryParameters();

    expect(queryParameters).toEqual(expectedParameters);
  });

  it('should set properties when passed a whitespace-separated UiTPAS numbers', function () {
    var searchParameters = new SearchParameters();
    searchParameters.fromParams({
      uitpasNumbers: '123465798654 123465798852\n123465798654'
    });

    var expectedParameters = new SearchParameters({
      uitpasNumbers: ['123465798654', '123465798852', '123465798654']
    });

    expect(searchParameters).toEqual(expectedParameters);
  });
});
