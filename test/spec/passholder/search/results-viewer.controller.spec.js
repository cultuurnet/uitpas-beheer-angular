'use strict';

describe('Controller: Results Viewer', function () {

  var $controller, controller, $scope, $rootScope, advancedSearchService, $state, UiTPASRouter;

  beforeEach(module('ubr.passholder.search'));

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    advancedSearchService = jasmine.createSpyObj('advancedSearchService', ['findPassholders', 'goToPage']);
    $state = jasmine.createSpyObj('$state', ['go']);
    UiTPASRouter = jasmine.createSpyObj('UiTPASRouter', ['go']);
    $state.params = {};
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    controller = $controller('ResultsViewerController', {
      $scope: $scope,
      $rootScope: $rootScope,
      $state: $state,
      advancedSearchService: advancedSearchService,
      UiTPASRouter: UiTPASRouter
    });
  }));

  it('should show results immediately when there are no unknown numbers', function () {
    controller.results = jasmine.createSpyObj('results', ['hasUnknownNumbers', 'hasConfirmedUnknownNumbers']);
    controller.results.hasUnknownNumbers.and.returnValue(false);

    expect(controller.isShowingResults()).toEqual(true);
    expect(controller.noSearchDone()).toBeFalsy();
  });

  it('should not show results without confirmation when there are unknown numbers', function () {
    controller.results = jasmine.createSpyObj('results', ['hasUnknownNumbers', 'hasConfirmedUnknownNumbers']);
    controller.results.hasUnknownNumbers.and.returnValue(true);

    controller.results.hasConfirmedUnknownNumbers.and.returnValue(false);
    expect(controller.isShowingResults()).toEqual(false);

    controller.results.hasConfirmedUnknownNumbers.and.returnValue(true);
    expect(controller.isShowingResults()).toEqual(true);
  });

  it('should load the passholder to show details', function () {
    controller.showPassholderDetails('1234567894561');
    expect(UiTPASRouter.go).toHaveBeenCalledWith('1234567894561');
  });

  it('should enter a loading state when finding search results', function () {
    controller.finding();
    expect(controller.loading).toEqual(true);
  });

  it('should clear the search results and show instructions when a different result set is loading', function () {
    var searchParameters = jasmine.createSpyObj('searchParameters', ['yieldsSameResultSetAs']);
    searchParameters.yieldsSameResultSetAs.and.returnValue(false);
    controller.finding({}, searchParameters);
    controller.results = {result: 'page'};

    controller.finding({}, searchParameters);
    expect(controller.loading).toEqual(true);
    expect(controller.results).toBeNull();
  });

  it('should show a loading state while finding results from the same set', function () {
    var searchParameters = jasmine.createSpyObj('searchParameters', ['yieldsSameResultSetAs']);
    searchParameters.yieldsSameResultSetAs.and.returnValue(true);
    controller.finding({}, searchParameters);
    controller.results = {result: 'page'};

    controller.finding({}, searchParameters);
    expect(controller.loading).toEqual(true);
    expect(controller.results).toEqual({result: 'page'});
  });

  it('should update the active page in both directions', function () {
    controller.activePage = 6;
    controller.updateActivePage();
    expect(advancedSearchService.goToPage).toHaveBeenCalledWith(6);

    controller.updateActivePage(3);
    expect(controller.activePage).toEqual(3);
  });

  it('it should show results when they are found', inject(function (PassholderSearchResults) {
    var searchResults = new PassholderSearchResults();
    controller.loading = true;

    controller.updateResults({}, searchResults);
    expect(controller.results).toEqual(searchResults);
    expect(controller.loading).toEqual(false);
  }));

  it('can tell when no search has been done', function () {
    expect(controller.noSearchDone()).toBeTruthy();
  });
});
