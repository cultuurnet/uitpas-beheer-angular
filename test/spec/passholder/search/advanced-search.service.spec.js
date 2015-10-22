'use strict';

describe('Service: Advanced Search', function () {

  var searchService, passholderService, $q, $rootScope;


  beforeEach(module('ubr.passholder.search', function($provide) {
    passholderService = jasmine.createSpyObj('passholderService', ['findPassholders']);
    $provide.provider('passholderService', {
      $get: function () {
        return passholderService;
      }
    });
  }));

  beforeEach(inject(function (advancedSearchService, _$q_, _$rootScope_) {
    searchService = advancedSearchService;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  it('should find the next page off the previous passholders search when going to the next page', function () {
    var expectedSearchParameters = {
      page: 4,
      green: 'orange'
    };
    searchService.searchParameters = {
      green: 'orange',
      page: 1
    };
    spyOn(searchService, 'findPassholders');

    searchService.goToPage(4);

    expect(searchService.findPassholders).toHaveBeenCalledWith(expectedSearchParameters);
  });

  it('should throw an error when trying to go to a page without and active search', function () {
    var expectedError = Error('There is no active search for which we can show a specific page.');

    function changePage() {
      searchService.goToPage(3);
    }

    expect(changePage).toThrow(expectedError);
  });

  it('should notify others when starting a search and then finding passholders', function (){
    var expectedSearchResults = {
      awww: 'yeeah!'
    };
    passholderService.findPassholders.and.returnValue($q.resolve(expectedSearchResults));
    spyOn($rootScope, '$emit');
    var searchParameters = {
      beep: 'boop'
    };
    searchService.findPassholders(searchParameters);
    $rootScope.$digest();

    expect(passholderService.findPassholders).toHaveBeenCalledWith(searchParameters);
    expect($rootScope.$emit).toHaveBeenCalledWith('findingPassholders', searchParameters);
    expect($rootScope.$emit).toHaveBeenCalledWith('passholdersFound', expectedSearchResults);
  });
});