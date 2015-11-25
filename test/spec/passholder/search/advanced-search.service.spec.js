'use strict';

describe('Service: Advanced Search', function () {

  var searchService, passholderService, $q, $rootScope, $state;

  beforeEach(module('uitpasbeheerAppViews'));
  beforeEach(module('ubr.passholder.search', function($provide) {
    passholderService = jasmine.createSpyObj('passholderService', ['findPassholders']);
    $provide.provider('passholderService', {
      $get: function () {
        return passholderService;
      }
    });
  }));

  beforeEach(inject(function (advancedSearchService, _$q_, _$rootScope_, _$state_) {
    searchService = advancedSearchService;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $state = _$state_;
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
    spyOn($state, 'go');
    spyOn($rootScope, '$emit');
    var searchParameters = {
      beep: 'boop',
      toParams: function () {
        return {};
      }
    };
    searchService.findPassholders(searchParameters);
    $rootScope.$digest();

    expect(passholderService.findPassholders).toHaveBeenCalledWith(searchParameters);
    expect($rootScope.$emit).toHaveBeenCalledWith('findingPassholders', searchParameters);
    expect($rootScope.$emit).toHaveBeenCalledWith('passholdersFound', expectedSearchResults);
  });

  it('should reset the active page when searching with parameters that return a different result set', inject(function (SearchParameters) {
    var oldSearchParameters = new SearchParameters({
      page: 4,
      name: 'Danny'
    });

    var newSearchParameters = new SearchParameters({
      page: 4,
      name: 'Dirk'
    });

    var expectedSearchParameters = new SearchParameters({
      page: 1,
      name: 'Dirk'
    });

    passholderService.findPassholders.and.returnValue($q.resolve());

    searchService.findPassholders(oldSearchParameters);
    searchService.findPassholders(newSearchParameters);

    expect(passholderService.findPassholders.calls.mostRecent().args[0]).toEqual(expectedSearchParameters);
  }));

  it('should not reset the active page when searching with parameters that return the same result set', inject(function (SearchParameters) {
    var oldSearchParameters = new SearchParameters({
      page: 4,
      name: 'Danny'
    });

    var newSearchParameters = new SearchParameters({
      page: 10,
      name: 'Danny'
    });

    passholderService.findPassholders.and.returnValue($q.resolve());

    searchService.findPassholders(oldSearchParameters);
    searchService.findPassholders(newSearchParameters);

    expect(passholderService.findPassholders.calls.mostRecent().args[0]).toEqual(newSearchParameters);
  }));

  it('should not inherit the state parameters from the current page when doing a new search', function () {
    var expectedSearchResults = {
      awww: 'yeeah!'
    };
    passholderService.findPassholders.and.returnValue($q.resolve(expectedSearchResults));
    spyOn($state, 'go');
    var searchParameters1 = {
      beep: 'boop',
      toParams: function () {
        return {beep: 'boop'};
      }
    };
    searchService.findPassholders(searchParameters1);
    $rootScope.$digest();
    expect($state.go).toHaveBeenCalledWith('counter.main.advancedSearch', { beep: 'boop' }, { inherit: false });
  });
});
