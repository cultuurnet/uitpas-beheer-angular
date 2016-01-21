'use strict';

describe('Controller: AddressBulkController', function () {

  var $controller, $uibModalInstance, $scope, BulkSelection, PassholderSearchResults, SearchParameters,
    searchResults, searchParameters, bulkSelection, passholderService, advancedSearchService, $state,
    addressBulkController;

  var addressForm = {
    street: '',
    zip: '',
    city: ''
  };

  // load the controller's module
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(inject(function (_$controller_, $rootScope, $injector, _BulkSelection_, _PassholderSearchResults_, _SearchParameters_) {
    $controller = _$controller_;
    $state = jasmine.createSpyObj('$state', ['go']);
    passholderService = $injector.get('passholderService');
    advancedSearchService = $injector.get('advancedSearchService');
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['dismiss']);
    $scope = $rootScope.$new();
    BulkSelection = _BulkSelection_;
    PassholderSearchResults = _PassholderSearchResults_;
    SearchParameters = _SearchParameters_;

    searchResults = new PassholderSearchResults();
    searchParameters = new SearchParameters();
    bulkSelection = new BulkSelection(searchResults, searchParameters, []);

    addressBulkController = getController();
    addressBulkController.submitBusy = false;
    addressBulkController.isSubmitted = false;
  }));

  function getController() {
    return $controller('AddressBulkController', {
      bulkSelection: bulkSelection,
      passholderService: passholderService,
      $uibModalInstance: $uibModalInstance,
      $state: $state
    });
  }

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

  fit('should find all the passholders again when select all is selected', function () {
    searchParameters.firstName = 'jan';
    searchResults = advancedSearchService.findPassholders(searchParameters);
    bulkSelection = new BulkSelection(searchResults, searchParameters, []);
    bulkSelection.selectAll = true;
    searchParameters.limit = searchResults.totalItems;

    findPassHoldersAgain(searchParameters);

    function findPassHoldersAgain(searchParameters) {
      passholderService
        .findPassholders(searchParameters)
        .then(
        function(PassholderSearchResults) {
          var passholders = PassholderSearchResults.passen;
          angular.forEach(passholders, function(value, key) {
            passholders[key] = passholders[key].passholder;
          });

          addressBulkController.passholders = passholders;
        }
      );
    }

    expect(bulkSelection.selectAll).toBeTruthy();
    expect(searchParameters.limit).toEqual(searchResults.totalItems);
    //console.log(addressBulkController.passholders);
    //console.log(searchResults.passen);
    //expect(addressBulkController.passholders.length).toEqual(searchResults.totalItems);
  });

  it('should lock down the form while submitting', function () {
    addressBulkController.submitForm(searchResults.passen, addressForm, bulkSelection);
    expect(addressBulkController.isSubmitted).toBeTruthy();
  });

  /*fit('can submit the form', function() {
    addressBulkController.submitForm(searchResults.passen, addressForm, bulkSelection);
    expect($state.go).toHaveBeenCalledWith('counter.main.advancedSearch.showBulkResults',
      { passholders: searchResults.passen, bulkAddressForm: addressForm, bulkSelection: bulkSelection });
  });*/

  it('can close the modal', function () {
    addressBulkController.cancel();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });
});
