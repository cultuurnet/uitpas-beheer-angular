'use strict';

describe('Controller: Results Viewer', function () {

  var $controller, controller, $scope, $rootScope, advancedSearchService, $state, UiTPASRouter, bulkActionsService,
    $q, BulkSelection, Counter, activeCounter;

  var activeCounterJson = {
    'id': '452',
    'consumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
    'name': 'Vierdewereldgroep Mensen voor Mensen',
    'role': 'admin',
    'actorId': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
    'cardSystems': {
      '1': {
        'permissions': ['kansenstatuut toekennen'],
        'groups': ['Geauthorizeerde registratie balies'],
        'id': 1,
        'name': 'UiTPAS Regio Aalst',
        'distributionKeys': []
      }
    },
    //'permissions': ['registratie', 'kansenstatuut toekennen'],
    'permissions': ['kansenstatuut toekennen'],
    'groups': ['Geauthorizeerde registratie balies']
  };

  beforeEach(module('ubr.passholder.search'));
  beforeEach(module('uitpasbeheerApp', function($provide) {
    UiTPASRouter = jasmine.createSpyObj('UiTPASRouter', ['go', 'getLastIdentification']);
    $provide.provider('UiTPASRouter', {
      $get: function () {
        return UiTPASRouter;
      }
    });

    bulkActionsService = jasmine.createSpyObj('bulkActionsService', ['exportPassholders']);
    $provide.provider('bulkActionsService', {
      $get: function () {
        return bulkActionsService;
      }
    });
  }));

  beforeEach(inject(function (_$controller_, _$rootScope_, _$q_, $injector) {
    advancedSearchService = jasmine.createSpyObj('advancedSearchService', ['findPassholders', 'goToPage']);
    $state = jasmine.createSpyObj('$state', ['go']);
    BulkSelection = $injector.get('BulkSelection');

    $state.params = {};
    $q = _$q_;
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    Counter = $injector.get('Counter');
    activeCounter = new Counter(angular.copy(activeCounterJson));

    controller = getController();
  }));

  function getController() {
    return $controller('ResultsViewerController', {
      $scope: $scope,
      $rootScope: $rootScope,
      $state: $state,
      advancedSearchService: advancedSearchService,
      UiTPASRouter: UiTPASRouter,
      bulkActionsService: bulkActionsService,
      activeCounter: activeCounter
    });
  }

  it('should check if the active counter has the permission for kansenstatuut', function () {
    spyOn(controller, 'hasCounterPermissions');
    controller.hasCounterPermissions();

    $scope.$digest();

    expect(controller.hasCounterPermissions).toHaveBeenCalled();
    expect(controller.counterHasKansenstatuutPermission).toBeTruthy();
  });

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

  it('should show the passholder list view immediately before loading results from previous search parameters', function () {
    $state.params = {
      page: 2
    };
    var controller = getController();
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

  it('resets the search parameters when asked', function () {
    controller.loading = true;
    controller.results = {some: 'thing'};
    $rootScope.$emit('resetSearch');

    expect(controller.loading).toBeFalsy();
    expect(controller.results).toBeNull();
  });

  it('can deselect all items for the bulk actions', function () {
    controller.bulk.selection.uitpasNumberSelection = ['0123456789012', '0123456789013'];
    controller.bulk.selection.selectAll = false;
    controller.bulkSelectAll();
    expect(controller.bulk.selection.uitpasNumberSelection).toEqual([]);
  });

  it('can remove a pass from the select all bulk selection', function () {
    var pass = {
      number: '0132456789012'
    };

    controller.bulk.selection.selectAll = true;
    spyOn(controller.bulk.selection, 'removeUitpasNumberFromSelection');
    controller.togglePassBulkSelection(pass);
    expect(controller.bulk.selection.removeUitpasNumberFromSelection).toHaveBeenCalledWith(pass.number);
  });

  it('can remove a pass from an items bulk selection', function () {
    var pass = {
      number: '0132456789012'
    };

    controller.bulk.selection.selectAll = false;
    controller.bulk.selection.uitpasNumberSelection = ['0123456789012', '0132456789013'];
    spyOn(controller.bulk.selection, 'removeUitpasNumberFromSelection');
    spyOn(controller.bulk.selection, 'numberInSelection').and.returnValue(true);
    controller.togglePassBulkSelection(pass);
    expect(controller.bulk.selection.removeUitpasNumberFromSelection).toHaveBeenCalledWith(pass.number);
  });

  it('can add a pass to the bulk selection', function () {
    var pass = {
      number: '0132456789012'
    };

    spyOn(controller.bulk.selection, 'addUitpasNumberToSelection');
    controller.togglePassBulkSelection(pass);
    expect(controller.bulk.selection.addUitpasNumberToSelection).toHaveBeenCalledWith(pass.number);
  });

  it('can start a bulk action of type export and delegate the work', function () {
    controller.bulk.action = 'export';
    spyOn(controller, 'doBulkExport');
    controller.doBulkAction();

    expect(controller.doBulkExport).toHaveBeenCalled();
  });

  it('can start a bulk action of type address and delegate the work', function () {
    var bulkSelection = new BulkSelection(controller.results, controller.searchParameters);
    controller.bulk.action = 'address';
    controller.doBulkAction();

    expect($state.go).toHaveBeenCalledWith('counter.main.advancedSearch.bulkAddress', { bulkSelection: bulkSelection, action: 'address' });
  });

  it('can start a bulk action of type kansenstatuut and delegate the work', function () {
    var bulkSelection = new BulkSelection(controller.results, controller.searchParameters);
    controller.bulk.action = 'kansenstatuut';
    controller.doBulkAction();

    expect($state.go).toHaveBeenCalledWith('counter.main.advancedSearch.bulkKansenstatuut', { bulkSelection: bulkSelection, action: 'kansenstatuut' });
  });

  it('can start a bulk action of type points and delegate the work', function () {
    var params = controller.bulk.selection.toQueryParameters();
    params.action = 'points';
    if (!params.selection) {
      params.totalItems = controller.bulk.selection.searchResults.totalItems;
    }
    controller.doBulkAction();

    expect($state.go).toHaveBeenCalledWith('counter.main.advancedSearch.bulkPoints', params, { inherit: false });
  });

  it('can request a bulk export and report success to the user', function () {
    controller.bulk.selection.uitpasNumberSelection = ['0123456789012'];

    controller.doBulkExport();

    expect(bulkActionsService.exportPassholders).toHaveBeenCalled();
    expect(controller.bulk.export.requestingExport).toBeFalsy();
  });
});
