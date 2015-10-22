'use strict';

fdescribe('Controller: PassholderAdvancedSearchController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var advancedSearchService, $q, controller, SearchParameters, PassholderSearchResults, $scope;

  var jsonPass = {
    'uitPas': {
      'number': '0930000422202',
      'kansenStatuut': true,
      'status': 'LOCAL_STOCK',
      'type': 'CARD',
      'cardSystem': {
        'id': '4a567b89',
        'name': 'UiTPAS Regio Aalst'
      }
    },
    'passHolder': {
      'uid': 'string',
      'name': {
        'first': 'John',
        'middle': 'Lupus',
        'last': 'Smith'
      },
      'address': {
        'street': 'Steenweg op Aalst 94',
        'postalCode': '9308',
        'city': 'Aalst'
      },
      'birth': {
        'date': '2003-12-26',
        'place': 'Sint-Agatha-Berchem'
      },
      'inszNumber': '93051822361',
      'gender': 'MALE',
      'nationality': 'Belg',
      'picture': 'R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw==',
      'contact': {
        'email': 'foo@bar.com',
        'telephoneNumber': '016454545',
        'mobileNumber': '+32 498 77 88 99'
      },
      'privacy': {
        'email': true,
        'sms': true
      },
      'points': 40,
      'remarks': 'Dit maakt niet uit.',
      'kansenStatuten': [
        {
          'status': 'ACTIVE',
          'endDate': '2015-12-26',
          'cardSystem': {
            'id': '4a567b89',
            'name': 'UiTPAS Regio Aalst'
          }
        }
      ],
      'uitPassen': [
        {
          'number': '0930000422202',
          'kansenStatuut': true,
          'status': 'LOCAL_STOCK',
          'type': 'CARD',
          'cardSystem': {
            'id': '4a567b89',
            'name': 'UiTPAS Regio Aalst'
          }
        }
      ]
    },
    'group': {
      'name': 'Vereniging',
      'availableTickets': 0
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, $rootScope) {
    advancedSearchService = jasmine.createSpyObj('advancedSearchService', ['findPassholders']);
    $q = $injector.get('$q');
    SearchParameters = $injector.get('SearchParameters');
    PassholderSearchResults = $injector.get('PassholderSearchResults');
    $scope = $rootScope;

    controller = $controller('PassholderAdvancedSearchController', {
      SearchParameters: SearchParameters,
      advancedSearchService: advancedSearchService
    });
  }));

  it('can validate UiTPAS numbers', function () {
    controller.validateUitpasNumbers();
    expect(controller.invalidNumbers).toEqual([]);

    var uitpasNumbersToValidate = '0930000804615 0930000807113 0930000802619 0930000801207';
    controller.validateUitpasNumbers(uitpasNumbersToValidate);
    expect(controller.invalidNumbers).toEqual([]);

    uitpasNumbersToValidate = '0930000804615 0930000807113 09300008026197 093000080120';
    controller.validateUitpasNumbers(uitpasNumbersToValidate);
    expect(controller.invalidNumbers).toEqual(['09300008026197', '093000080120']);
  });

  it('can find passholders', function () {
    var searchResponse = {
      'itemsPerPage': 10,
      'totalItems': 2,
      'member': [
        jsonPass,
        jsonPass
      ],
      'invalidUitpasNumbers': [
        '0930000804615',
        '0930000807113'
      ],
      'firstPage': 'http://culpas-silex.dev/passholders?page=1',
      'lastPage': 'http://culpas-silex.dev/passholders?page=1',
      'previousPage': 'http://culpas-silex.dev/passholders?page=1',
      'nextPage': 'http://culpas-silex.dev/passholders?page=1'
    };
    controller.passNumbers = '0930000804615 0930000807113 0930000802619 0930000801207';
    advancedSearchService.findPassholders.and.returnValue($q.when(new PassholderSearchResults(searchResponse)));

    controller.findPassholders();
    $scope.$digest();

    expect(controller.results).toEqual(new PassholderSearchResults(searchResponse));
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('can find passholders without passNumbers', function () {
    var searchResponse = {
      'itemsPerPage': 10,
      'totalItems': 0,
      'member': [],
      'invalidUitpasNumbers': [],
      'firstPage': 'http://culpas-silex.dev/passholders?page=1',
      'lastPage': 'http://culpas-silex.dev/passholders?page=1',
      'previousPage': 'http://culpas-silex.dev/passholders?page=1',
      'nextPage': 'http://culpas-silex.dev/passholders?page=1'
    };

    advancedSearchService.findPassholders.and.returnValue($q.when(new PassholderSearchResults(searchResponse)));

    controller.findPassholders();
    $scope.$digest();

    expect(controller.results).toEqual(new PassholderSearchResults(searchResponse));
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should validate passnumbers before searching passholders', function () {
    var searchResponse = {
      'itemsPerPage': 10,
      'totalItems': 2,
      'member': [
        jsonPass,
        jsonPass
      ],
      'invalidUitpasNumbers': [
        '0930000804615',
        '0930000807113'
      ],
      'firstPage': 'http://culpas-silex.dev/passholders?page=1',
      'lastPage': 'http://culpas-silex.dev/passholders?page=1',
      'previousPage': 'http://culpas-silex.dev/passholders?page=1',
      'nextPage': 'http://culpas-silex.dev/passholders?page=1'
    };
    controller.passNumbers = '0930000804615 0930000807113 09300008026197 093000080120';

    controller.findPassholders();
    $scope.$digest();

    expect(controller.results).toBeNull();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should show async errors from the API' , function () {
    var searchApiError = {};
    controller.passNumbers = '0930000804615 0930000807113 0930000802619 0930000801207';

    advancedSearchService.findPassholders.and.returnValue($q.reject(searchApiError));

    controller.findPassholders();
    $scope.$digest();
    expect(controller.asyncError).toEqual({});
  });

  it('can clear asyncErrors' , function () {
    var searchApiError = {};
    controller.passNumbers = '0930000804615 0930000807113 0930000802619 0930000801207';

    advancedSearchService.findPassholders.and.returnValue($q.reject(searchApiError));

    controller.findPassholders();
    $scope.$digest();
    expect(controller.asyncError).toEqual({});

    controller.clearAsyncError();
    expect(controller.asyncError).toBeNull();
  });
});
